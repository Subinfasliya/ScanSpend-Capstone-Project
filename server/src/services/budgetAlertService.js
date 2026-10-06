const Budget = require("../models/budgetModel");
const Expense = require("../models/expenseModel");
const { fromMinorUnits } = require("../utils/money");

const getBudgetAlert = async ({ userId, category, expenseDate }) => {
  if (!category) return null;
  const year = expenseDate.getUTCFullYear();
  const month = expenseDate.getUTCMonth() + 1;
  const budget = await Budget.findOne({ userId, category, year, month }).lean();
  if (!budget) return null;

  const periodStart = new Date(Date.UTC(year, month - 1, 1));
  const periodEnd = new Date(Date.UTC(year, month, 1));
  const [spend] = await Expense.aggregate([
    { $match: { userId, category, expenseDate: { $gte: periodStart, $lt: periodEnd } } },
    { $group: { _id: null, amountMinor: { $sum: "$amountMinor" } } },
  ]);
  const spentMinor = spend?.amountMinor || 0;
  const exactPercentUsed = (spentMinor / budget.limitMinor) * 100;
  const percentUsed = Math.min(100, Math.round(exactPercentUsed));
  if (exactPercentUsed < 80) return null;
  const isOverBudget = exactPercentUsed >= 100;
  const overAmount = fromMinorUnits(Math.max(0, spentMinor - budget.limitMinor));

  return {
    level: isOverBudget ? "over" : "warning",
    percentUsed,
    spent: fromMinorUnits(spentMinor),
    limit: fromMinorUnits(budget.limitMinor),
    overAmount,
    message: isOverBudget
      ? `${category} spending exceeded its monthly budget by ₹${overAmount.toFixed(2)}.`
      : `${category} spending has reached ${percentUsed}% of its monthly budget.`,
  };
};

module.exports = { getBudgetAlert };