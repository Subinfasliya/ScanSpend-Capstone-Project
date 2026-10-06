const env = require("../config/env");
const ApplicationSettings = require("../models/applicationSettingsModel");

const defaults = () => ({
  freeMonthlyReceiptLimit: 5,
  monthlyAmountPaise: env.razorpay.monthlyAmount,
  annualAmountPaise: env.razorpay.annualAmount,
});

const toPublicSettings = (settings) => {
  const values = settings || {};
  const fallback = defaults();
  return {
    freeMonthlyReceiptLimit: values.freeMonthlyReceiptLimit ?? fallback.freeMonthlyReceiptLimit,
    monthlyPriceInr: (values.monthlyAmountPaise ?? fallback.monthlyAmountPaise) / 100,
    annualPriceInr: (values.annualAmountPaise ?? fallback.annualAmountPaise) / 100,
  };
};

const getApplicationSettings = async () => {
  const settings = await ApplicationSettings.findOne({ key: "global" }).lean();
  return toPublicSettings(settings);
};

const saveApplicationSettings = async ({ freeMonthlyReceiptLimit, monthlyPriceInr, annualPriceInr }) => {
  const saved = await ApplicationSettings.findOneAndUpdate(
    { key: "global" },
    {
      $set: {
        freeMonthlyReceiptLimit,
        monthlyAmountPaise: Math.round(monthlyPriceInr * 100),
        annualAmountPaise: Math.round(annualPriceInr * 100),
      },
      $setOnInsert: { key: "global" },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
  return toPublicSettings(saved);
};

const getReceiptLimit = async () => (await getApplicationSettings()).freeMonthlyReceiptLimit;

const getSubscriptionPrices = async () => {
  const settings = await getApplicationSettings();
  return {
    monthlyAmountPaise: Math.round(settings.monthlyPriceInr * 100),
    annualAmountPaise: Math.round(settings.annualPriceInr * 100),
  };
};

module.exports = { getApplicationSettings, saveApplicationSettings, getReceiptLimit, getSubscriptionPrices };