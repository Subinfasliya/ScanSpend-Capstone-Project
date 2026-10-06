const mongoose = require("mongoose");

const receiptScanUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  periodStart: { type: Date, required: true },
  used: { type: Number, required: true, default: 0, min: 0 },
});

receiptScanUsageSchema.index({ userId: 1, periodStart: 1 }, { unique: true });

module.exports = mongoose.model("ReceiptScanUsage", receiptScanUsageSchema);