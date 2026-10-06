const normalizeAmount = (amount) => {
  // 50,00 -> 50.00
  if (/^\d+,\d{2}$/.test(amount)) {
    return Number(amount.replace(",", "."));
  }

  // 1,25,000 -> 125000
  return Number(amount.replace(/,/g, ""));
};

export const extractAmount = (text) => {
  const patterns = [
    /\bgrand\s+total\b\s*[:\-]?\s*[₹$€£]?\s*([\d,]+(?:\.\d+)?)/i,
    /\bnet\s+total\b\s*[:\-]?\s*[₹$€£]?\s*([\d,]+(?:\.\d+)?)/i,
    /\btotal\s+amount\b\s*[:\-]?\s*[₹$€£]?\s*([\d,]+(?:\.\d+)?)/i,
    /\btotal\b\s*[:\-]?\s*[₹$€£]?\s*([\d,]+(?:\.\d+)?)/i,
  ];

  for (const pattern of patterns) {
    const macthedAmount = text.match(pattern);

    if (macthedAmount) {
      return normalizeAmount(macthedAmount[1]);
    }
  }

  return null;
};
