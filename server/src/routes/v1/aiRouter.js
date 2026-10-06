const Joi = require("joi");
const rateLimit = require("express-rate-limit");
const aiController = require("../../controllers/aiController");
const protect = require("../../middlewares/auth/authMiddleware");
const validate = require("../../middlewares/validate");

const aiRouter = require("express").Router();
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please try again shortly." },
});
const chatSchema = Joi.object({
  prompt: Joi.string().trim().min(1).max(16000).required(),
});

aiRouter.post("/chat", protect, chatLimiter, validate(chatSchema), aiController.chat);

module.exports = aiRouter;