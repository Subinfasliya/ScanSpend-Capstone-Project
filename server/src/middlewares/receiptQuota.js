const ReceiptScanUsage = require("../models/receiptScanUsageModel");
const createError = require("../utils/createError");
const { getReceiptLimit } = require("../services/applicationSettingsService");

const FREE_MONTHLY_RECEIPT_LIMIT = 5;

const hasActivePremium = (user, now = new Date()) =>
  user?.isPremium === true && (!user.premiumExpiresAt || user.premiumExpiresAt > now);

const getReceiptUsage = async (user, now = new Date()) => {
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const resetsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const [usage, freeMonthlyLimit] = await Promise.all([ReceiptScanUsage.findOne({
    userId: user._id,
    periodStart,
  }).lean(), getReceiptLimit()]);
  const used = usage?.used || 0;
  const premium = hasActivePremium(user, now);

  return {
    premium,
    monthlyLimit: premium ? null : freeMonthlyLimit,
    used,
    remaining: premium ? null : Math.max(0, freeMonthlyLimit - used),
    resetsAt,
  };
};

const reserveReceiptScan = async (user, now = new Date()) => {
  const freeMonthlyLimit = await getReceiptLimit();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const filter = { userId: user._id, periodStart };
  let usage;
  try {
    usage = await ReceiptScanUsage.findOneAndUpdate(filter, { $inc: { used: 1 } }, {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: false,
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
    usage = await ReceiptScanUsage.findOneAndUpdate(filter, { $inc: { used: 1 } }, { returnDocument: "after" });
  }

  if (!hasActivePremium(user, now) && usage.used > freeMonthlyLimit) {
    await ReceiptScanUsage.updateOne(filter, { $inc: { used: -1 } });
    throw createError(429, "Free plan monthly receipt and OCR limit reached");
  }
  return usage;
};

const requireReceiptQuota = async (req, res, next) => {
  try {
    if (!req.user) return next(createError(401, "Authentication required"));
    const usage = await getReceiptUsage(req.user);
    if (!usage.premium && usage.remaining === 0) {
      return next(createError(429, "Free plan monthly receipt and OCR limit reached", usage));
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { FREE_MONTHLY_RECEIPT_LIMIT, getReceiptUsage, hasActivePremium, reserveReceiptScan, requireReceiptQuota };