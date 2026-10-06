const { Readable } = require("node:stream");
const cloudinary = require("cloudinary").v2;
const { createWorker } = require("tesseract.js");
const env = require("../config/env");
const createError = require("../utils/createError");
const { toMinorUnits } = require("../utils/money");

let workerPromise;

const parseDate = (text) => {
  const monthNames = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10,
    october: 10, nov: 11, november: 11, dec: 12, december: 12,
  };
  const candidates = [];
  const yearFirst = text.match(/\b(20\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/);
  const dayFirst = text.match(/\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](20\d{2})\b/);
  const monthWordFirst = text.match(/\b(0?[1-9]|[12]\d|3[01])\s+([A-Za-z]{3,9})\.?[,]?\s+(20\d{2})\b/);
  const monthWordLast = text.match(/\b([A-Za-z]{3,9})\.?\s+(0?[1-9]|[12]\d|3[01])[,]?\s+(20\d{2})\b/);

  if (yearFirst) candidates.push([Number(yearFirst[1]), Number(yearFirst[2]), Number(yearFirst[3])]);
  if (dayFirst) candidates.push([Number(dayFirst[3]), Number(dayFirst[2]), Number(dayFirst[1])]);
  if (monthWordFirst) candidates.push([Number(monthWordFirst[3]), monthNames[monthWordFirst[2].toLowerCase()], Number(monthWordFirst[1])]);
  if (monthWordLast) candidates.push([Number(monthWordLast[3]), monthNames[monthWordLast[1].toLowerCase()], Number(monthWordLast[2])]);

  for (const [year, month, day] of candidates) {
    if (!month) continue;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) return date;
  }
  return undefined;
};

const extractReceiptFields = (text, { advanced = false } = {}) => {
  const boundedText = String(text || "").slice(0, advanced ? 50000 : 20000).trim();
  const lines = boundedText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const merchant = lines.find((line) => !/^(tax invoice|receipt|invoice|date|time|cashier|thank you|gstin|phone|tel|address|bill no)/i.test(line))?.slice(0, 120);
  const amountPatterns = [
    /(?:grand\s+total|total\s+(?:amount|due|payable)|amount\s+due|balance\s+due)\s*[:\-]?\s*(?:₹|INR\s*|rs\.?\s*)?([0-9][0-9,]*(?:\.\d{1,2})?)/i,
    /\btotal\b\s*[:\-]?\s*(?:₹|INR\s*|rs\.?\s*)?([0-9][0-9,]*(?:\.\d{1,2})?)/i,
    ...(advanced ? [/(?:paid|amount)\D{0,16}(?:₹|INR\s*|rs\.?\s*)?([0-9][0-9,]*(?:\.\d{1,2})?)/i] : []),
  ];
  let amountMinor;
  for (const pattern of amountPatterns) {
    const match = [...lines].reverse().map((line) => line.match(pattern)).find(Boolean);
    if (!match) continue;
    try {
      amountMinor = toMinorUnits(match[1].replaceAll(",", ""));
    } catch {
      amountMinor = undefined;
    }
    if (Number.isSafeInteger(amountMinor) && amountMinor > 0) break;
    amountMinor = undefined;
  }

  const expenseDate = parseDate(boundedText);
  return {
    extracted: {
      ...(merchant ? { merchant } : {}),
      ...(Number.isSafeInteger(amountMinor) && amountMinor > 0 ? { amountMinor } : {}),
      ...(expenseDate ? { expenseDate } : {}),
      rawText: boundedText,
    },
  };
};

const configureCloudinary = () => {
  const credentials = env.cloudinary;
  if (!credentials?.cloudName || !credentials.apiKey || !credentials.apiSecret) {
    throw createError(503, "Receipt storage is not configured");
  }
  cloudinary.config({
    cloud_name: credentials.cloudName,
    api_key: credentials.apiKey,
    api_secret: credentials.apiSecret,
    secure: true,
  });
};

const uploadReceiptImage = (buffer, userId) => {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: "scanspend/receipts",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        max_bytes: 5 * 1024 * 1024,
        context: { user_id: userId.toString() },
      },
      (error, result) => {
        if (!error) return resolve(result);
        const providerError = error.error || error;
        const statusCode = providerError.http_code || providerError.statusCode;
        console.error("Cloudinary receipt upload failed", {
          statusCode: statusCode || null,
          name: providerError.name || "Error",
        });
        if (statusCode === 403) {
          return reject(createError(502, "Cloudinary API key is missing the create permission required to upload receipts."));
        }
        return reject(createError(502, "Receipt storage could not complete the upload."));
      },
    );
    Readable.from(buffer).pipe(upload);
  });
};

const recognizeReceipt = async (buffer, { advanced = false } = {}) => {
  workerPromise ??= createWorker("eng");
  const worker = await workerPromise;
  const result = await worker.recognize(buffer);
  return extractReceiptFields(result.data.text, { advanced });
};

const deleteReceiptImage = async (publicId) => {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
};

module.exports = { uploadReceiptImage, recognizeReceipt, extractReceiptFields, deleteReceiptImage };