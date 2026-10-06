const Joi = require("joi");
const { getBudgets, upsertBudget, deleteBudget } = require("../../controllers/budgetController");
const protect = require("../../middlewares/auth/authMiddleware");
const requirePremium = require("../../middlewares/auth/requirePremium");
const auditRequest = require("../../middlewares/auditRequest");
const validate = require("../../middlewares/validate");

const budgetRouter = require("express").Router();
const budgetSchema = Joi.object({
  category: Joi.string().trim().min(1).max(80).required(),
  year: Joi.number().integer().min(2000).max(2200),
  month: Joi.number().integer().min(1).max(12),
  limit: Joi.number().positive().max(100000000).precision(2).required(),
});
const deleteBudgetSchema = Joi.object({
  category: Joi.string().trim().min(1).max(80).required(),
  year: Joi.number().integer().min(2000).max(2200),
  month: Joi.number().integer().min(1).max(12),
});

budgetRouter.get("/", protect, requirePremium, getBudgets);
budgetRouter.put("/", protect, requirePremium, auditRequest, validate(budgetSchema), upsertBudget);
budgetRouter.delete("/", protect, requirePremium, auditRequest, validate(deleteBudgetSchema), deleteBudget);

module.exports = budgetRouter;