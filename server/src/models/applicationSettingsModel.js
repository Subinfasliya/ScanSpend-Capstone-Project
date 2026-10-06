const mongoose = require("mongoose");

const applicationSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    freeMonthlyReceiptLimit: { type: Number, required: true, min: 0, max: 100, default: 5 },
    monthlyAmountPaise: { type: Number, required: true, min: 100, default: 49900 },
    annualAmountPaise: { type: Number, required: true, min: 100, default: 499000 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ApplicationSettings", applicationSettingsSchema);