const Joi = require("joi");
const { startCheckout, getSubscription, getPaymentHistory, cancelSubscription, verifyCheckoutPayment } = require("../../controllers/subscriptionController");
const protect = require("../../middlewares/auth/authMiddleware");
const auditRequest = require("../../middlewares/auditRequest");
const validate = require("../../middlewares/validate");

const subscriptionRouter = require("express").Router();
const checkoutSchema = Joi.object({ plan: Joi.string().valid("monthly", "annual").required() });
const paymentVerificationSchema = Joi.object({
	orderId: Joi.string().pattern(/^order_[A-Za-z0-9]+$/).required(),
	paymentId: Joi.string().pattern(/^pay_[A-Za-z0-9]+$/).required(),
	signature: Joi.string().hex().length(64).required(),
});

subscriptionRouter.get("/", protect, getSubscription);
subscriptionRouter.get("/history", protect, getPaymentHistory);
subscriptionRouter.post("/checkout", protect, auditRequest, validate(checkoutSchema), startCheckout);
subscriptionRouter.post("/cancel", protect, auditRequest, cancelSubscription);
subscriptionRouter.post("/verify-payment", protect, auditRequest, validate(paymentVerificationSchema), verifyCheckoutPayment);

module.exports = subscriptionRouter;