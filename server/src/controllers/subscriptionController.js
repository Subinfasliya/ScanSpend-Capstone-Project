const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const Subscription = require("../models/subscriptionModel");
const User = require("../models/userModel");
const env = require("../config/env");
const createError = require("../utils/createError");
const { successResponse } = require("../utils/apiResponse");
const { paymentSignatureIsValid } = require("../utils/paymentSignature");
const { getSubscriptionPrices } = require("../services/applicationSettingsService");

const getRazorpay = () => {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw createError(503, "Subscription payments are not configured");
  }
  return new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret });
};

const startCheckout = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const prices = await getSubscriptionPrices();
    const amount = plan === "monthly" ? prices.monthlyAmountPaise : prices.annualAmountPaise;
    if (!Number.isSafeInteger(amount) || amount < 100) throw createError(503, "Subscription pricing is not configured");

    const order = await getRazorpay().orders.create({
      amount,
      currency: "INR",
      receipt: `${req.user._id.toString()}-${Date.now()}`.slice(0, 40),
      notes: { userId: req.user._id.toString(), plan },
    });
    const subscription = await Subscription.create({
      userId: req.user._id,
      plan,
      orderId: order.id,
      amount,
      currency: "INR",
    });

    return successResponse(res, 201, "Payment order created", {
      subscriptionId: subscription._id,
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: env.razorpay.keyId,
      plan,
    });
  } catch (error) {
    return next(error);
  }
};

const getSubscription = async (req, res, next) => {
  try {
    const now = new Date();
    const premium = req.user.isPremium && (!req.user.premiumExpiresAt || req.user.premiumExpiresAt > now);
    if (req.user.isPremium && !premium) {
      await Promise.all([
        User.updateOne(
          { _id: req.user._id, isPremium: true, premiumExpiresAt: { $lte: now } },
          { $set: { isPremium: false, subscriptionPlan: "free" } },
        ),
        Subscription.updateMany(
          { userId: req.user._id, status: "active", expiresAt: { $lte: now } },
          { $set: { status: "expired" } },
        ),
      ]);
      req.user.isPremium = false;
      req.user.subscriptionPlan = "free";
    }
    const prices = await getSubscriptionPrices();
    const subscription = await Subscription.findOne({ userId: req.user._id, status: "active", expiresAt: { $gt: now } })
      .sort({ expiresAt: -1 })
      .lean();
    return successResponse(res, 200, "Subscription retrieved", {
      premium: Boolean(premium),
      subscription,
      paymentConfigured: Boolean(env.razorpay.keyId && env.razorpay.keySecret),
      plans: {
        monthly: { amount: prices.monthlyAmountPaise, currency: "INR" },
        annual: { amount: prices.annualAmountPaise, currency: "INR" },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const now = new Date();
    await Subscription.updateMany(
      { userId: req.user._id, status: "active", expiresAt: { $lte: now } },
      { $set: { status: "expired" } },
    );
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const [items, total] = await Promise.all([
      Subscription.find({ userId: req.user._id })
        .select("plan status orderId paymentId amount currency startsAt expiresAt cancelAtPeriodEnd cancellationRequestedAt createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Subscription.countDocuments({ userId: req.user._id }),
    ]);
    return successResponse(res, 200, "Payment history retrieved", { items, page, limit, total });
  } catch (error) {
    return next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const now = new Date();
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: "active",
      expiresAt: { $gt: now },
    }).sort({ expiresAt: -1 });
    if (!subscription) throw createError(404, "No active subscription to cancel");

    if (!subscription.cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
      subscription.cancellationRequestedAt = now;
      await subscription.save();
    }

    return successResponse(res, 200, "Subscription will end after the current paid period", {
      cancelAtPeriodEnd: true,
      expiresAt: subscription.expiresAt,
    });
  } catch (error) {
    return next(error);
  }
};

const verifyCheckoutPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    if (!paymentSignatureIsValid({ orderId, paymentId, signature }, env.razorpay.keySecret)) {
      throw createError(400, "Payment verification failed");
    }

    const subscription = await Subscription.findOne({ orderId, userId: req.user._id });
    if (!subscription) throw createError(404, "Subscription order not found");

    const razorpay = getRazorpay();
    let payment = await razorpay.payments.fetch(paymentId);
    if (payment.order_id !== orderId) {
      throw createError(400, "Payment does not belong to this order");
    }
    if (payment.amount !== subscription.amount || payment.currency !== subscription.currency) {
      throw createError(400, "Payment amount or currency does not match the order");
    }
    if (payment.status === "authorized") {
      payment = await razorpay.payments.capture(paymentId, payment.amount, payment.currency);
    }
    if (payment.status !== "captured") {
      throw createError(409, "Payment is not captured yet. Please wait for confirmation.");
    }

    await processPaymentCaptured({
      orderId,
      paymentId,
      amount: payment.amount,
      currency: payment.currency,
    });

    return successResponse(res, 200, "Payment verified and subscription activated", {
      premium: true,
      plan: subscription.plan,
    });
  } catch (error) {
    return next(error);
  }
};

const processPaymentCaptured = async ({ orderId, paymentId, amount, currency }) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const subscription = await Subscription.findOne({ orderId }).session(session);
      if (!subscription) return;
      if (subscription.amount !== amount || subscription.currency !== currency) {
        throw createError(400, "Payment amount or currency does not match the order");
      }

      const alreadyActivated = subscription.status === "active";
      if (alreadyActivated && subscription.paymentId !== paymentId) {
        throw createError(409, "Subscription was activated by a different payment");
      }
      if (!alreadyActivated && !["pending", "failed"].includes(subscription.status)) return;

      const user = await User.findById(subscription.userId).session(session);
      if (!user || !user.isActive) throw createError(404, "Subscription user not found");

      const now = new Date();
      if (!alreadyActivated) {
        const startsAt = user.premiumExpiresAt > now ? user.premiumExpiresAt : now;
        const expiresAt = calculateExpiry(startsAt, subscription.plan);
        subscription.status = "active";
        subscription.paymentId = paymentId;
        subscription.startsAt = startsAt;
        subscription.expiresAt = expiresAt;
        await subscription.save({ session });
      }

      const currentExpiry = user.premiumExpiresAt > now ? user.premiumExpiresAt : null;
      const subscriptionExpiry = subscription.expiresAt;
      const effectiveExpiry = currentExpiry && currentExpiry > subscriptionExpiry
        ? currentExpiry
        : subscriptionExpiry;
      user.isPremium = effectiveExpiry > now;
      user.premiumExpiresAt = effectiveExpiry;
      if (!currentExpiry || subscriptionExpiry >= currentExpiry) {
        user.subscriptionPlan = subscription.plan;
      }
      await user.save({ session, validateBeforeSave: false });
    });
  } finally {
    await session.endSession();
  }
};

const calculateExpiry = (start, plan) => {
  const expiresAt = new Date(start);
  const day = expiresAt.getUTCDate();
  const month = expiresAt.getUTCMonth();
  expiresAt.setUTCDate(1);
  if (plan === "monthly") expiresAt.setUTCMonth(month + 1);
  else expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);
  const finalDay = new Date(Date.UTC(expiresAt.getUTCFullYear(), expiresAt.getUTCMonth() + 1, 0)).getUTCDate();
  expiresAt.setUTCDate(Math.min(day, finalDay));
  return expiresAt;
};

module.exports = { startCheckout, getSubscription, getPaymentHistory, cancelSubscription, verifyCheckoutPayment, processPaymentCaptured, calculateExpiry };