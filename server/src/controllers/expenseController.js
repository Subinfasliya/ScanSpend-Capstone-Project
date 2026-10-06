const Expense = require("../models/expenseModel");
const createError = require("../utils/createError");
const { successResponse } = require("../utils/apiResponse");
const { toMinorUnits, serializeExpense } = require("../utils/money");
const { getBudgetAlert } = require("../services/budgetAlertService");

const createExpense = async (req, res, next) => {
  try {
    const { amount, ...fields } = req.body;
    const expense = await Expense.create({
      ...fields,
      amountMinor: toMinorUnits(amount),
      userId: req.user._id,
    });
    const result = serializeExpense(expense);
    result.budgetAlert = await getBudgetAlert({ userId: req.user._id, category: expense.category, expenseDate: expense.expenseDate });
    return successResponse(res, 201, "Expense created successfully", result);
  } catch (error) {
    return next(error);
  }
};

const listExpenses = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = { userId: req.user._id };

    if (req.query.from || req.query.to) {
      filter.expenseDate = {};
      if (req.query.from) filter.expenseDate.$gte = new Date(req.query.from);
      if (req.query.to) filter.expenseDate.$lte = new Date(req.query.to);
    }
    if (req.query.category) filter.category = req.query.category;

    const [documents, total] = await Promise.all([
      Expense.find(filter)
        .sort({ expenseDate: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Expense.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Expenses retrieved successfully", {
      items: documents.map(serializeExpense),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

const getExpense = async (req, res, next) => {
  return successResponse(res, 200, "Expense retrieved successfully", serializeExpense(req.resource));
};

const updateExpense = async (req, res, next) => {
  try {
    const { amount, ...fields } = req.body;
    Object.assign(req.resource, fields);
    if (amount !== undefined) req.resource.amountMinor = toMinorUnits(amount);
    await req.resource.save();
    const result = serializeExpense(req.resource);
    result.budgetAlert = await getBudgetAlert({ userId: req.user._id, category: req.resource.category, expenseDate: req.resource.expenseDate });
    return successResponse(res, 200, "Expense updated successfully", result);
  } catch (error) {
    return next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    await req.resource.deleteOne();
    return successResponse(res, 200, "Expense deleted successfully");
  } catch (error) {
    return next(error);
  }
};

const validateExpenseQuery = (req, res, next) => {
  const { from, to, page, limit, category } = req.query;
  const validDate = (value) => !value || !Number.isNaN(Date.parse(value));
  if (!validDate(from) || !validDate(to) || (from && to && new Date(from) > new Date(to))) {
    return next(createError(400, "Invalid expense date range"));
  }
  if ((page && !/^\d+$/.test(page)) || (limit && !/^\d+$/.test(limit))) {
    return next(createError(400, "Page and limit must be positive integers"));
  }
  if (category && (typeof category !== "string" || category.length > 80)) {
    return next(createError(400, "Invalid expense category"));
  }
  return next();
};

module.exports = {
  createExpense,
  listExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  validateExpenseQuery,
};