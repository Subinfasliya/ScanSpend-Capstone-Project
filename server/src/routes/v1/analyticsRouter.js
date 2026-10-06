const analyticsController = require("../../controllers/analyticsController");
const protect = require("../../middlewares/auth/authMiddleware");
const requirePremium = require("../../middlewares/auth/requirePremium");

const analyticsRouter = require("express").Router();

analyticsRouter.get("/summary", protect, analyticsController.summary);
analyticsRouter.get("/insights", protect, requirePremium, analyticsController.insights);
analyticsRouter.get("/export/excel", protect, requirePremium, analyticsController.exportExpensesExcel);
analyticsRouter.get("/export/pdf", protect, requirePremium, analyticsController.exportExpensesPdf);
analyticsRouter.get("/export", protect, requirePremium, analyticsController.exportExpenses);

module.exports = analyticsRouter;