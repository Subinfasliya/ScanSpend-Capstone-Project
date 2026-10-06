const Joi = require("joi");
const adminController = require("../../controllers/adminController");
const { listAuditLogs } = require("../../controllers/auditController");
const protect = require("../../middlewares/auth/authMiddleware");
const requireRole = require("../../middlewares/auth/authorize");
const auditRequest = require("../../middlewares/auditRequest");
const validate = require("../../middlewares/validate");

const adminRouter = require("express").Router();
const userStatusSchema = Joi.object({ isActive: Joi.boolean().required() });
const settingsSchema = Joi.object({
	freeMonthlyReceiptLimit: Joi.number().integer().min(0).max(100).required(),
	monthlyPriceInr: Joi.number().min(1).max(100000).precision(2).required(),
	annualPriceInr: Joi.number().min(1).max(1000000).precision(2).required(),
});

adminRouter.get("/users", protect, requireRole("admin"), adminController.getAllUsers);
adminRouter.patch("/users/:userId/status", protect, requireRole("admin"), auditRequest, validate(userStatusSchema), adminController.updateUserStatus);
adminRouter.get("/stats", protect, requireRole("admin"), adminController.getSystemStats);
adminRouter.get("/subscriptions", protect, requireRole("admin"), adminController.listSubscriptions);
adminRouter.get("/settings", protect, requireRole("admin"), adminController.getSettings);
adminRouter.patch("/settings", protect, requireRole("admin"), auditRequest, validate(settingsSchema), adminController.updateSettings);
adminRouter.get("/audit-logs", protect, requireRole("admin"), listAuditLogs);

module.exports = adminRouter;
