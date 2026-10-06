const User = require("../models/userModel");
const Expense = require("../models/expenseModel");
const Receipt = require("../models/receiptModel");
const Subscription = require("../models/subscriptionModel");
const AuditLog = require("../models/auditLogModel");
const createError = require("../utils/createError");
const { successResponse } = require("../utils/apiResponse");
const {
  getApplicationSettings,
  saveApplicationSettings,
} = require("../services/applicationSettingsService");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("_id name email role isEmailVerified isActive isPremium premiumExpiresAt subscriptionPlan lastLoginAt createdAt")
      .sort({ createdAt: -1 });
    return successResponse(res, 200, "Users retrieved successfully", { users });
  } catch (error) {
    return next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    if (!/^[a-f\d]{24}$/i.test(userId)) throw createError(400, "Invalid user id");
    if (!isActive && userId === String(req.user._id)) {
      throw createError(400, "You cannot deactivate your own administrator account");
    }

    const account = await User.findById(userId);
    if (!account) throw createError(404, "User not found");
    if (!isActive && account.role === "admin") {
      const activeAdmins = await User.countDocuments({ role: "admin", isActive: true });
      if (activeAdmins <= 1) throw createError(409, "The last active administrator cannot be deactivated");
    }

    account.isActive = isActive;
    await account.save();
    return successResponse(res, 200, "User account updated", {
      _id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
      isActive: account.isActive,
    });
  } catch (error) {
    return next(error);
  }
};

const getSystemStats = async (req, res, next) => {
  try {
    const now = new Date();
    const [users, activeUsers, inactiveUsers, premiumUsers, expenses, receipts, subscriptions, activeSubscriptions, paymentCount, failedPayments, auditEvents, revenue] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ isPremium: true, $or: [{ premiumExpiresAt: null }, { premiumExpiresAt: { $gt: now } }] }),
      Expense.countDocuments(),
      Receipt.countDocuments(),
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: "active", expiresAt: { $gt: now } }),
      Subscription.countDocuments({ paymentId: { $type: "string", $ne: "" } }),
      Subscription.countDocuments({ status: "failed" }),
      AuditLog.countDocuments(),
      Subscription.aggregate([
        { $match: { status: "active", paymentId: { $type: "string", $ne: "" } } },
        { $group: { _id: null, amountPaise: { $sum: "$amount" } } },
      ]),
    ]);

    return successResponse(res, 200, "System statistics retrieved", {
      users: { total: users, active: activeUsers, inactive: inactiveUsers, premium: premiumUsers },
      expenses,
      receipts,
      subscriptions: { total: subscriptions, active: activeSubscriptions },
      payments: { captured: paymentCount, failed: failedPayments, revenuePaise: revenue[0]?.amountPaise || 0 },
      auditEvents,
    });
  } catch (error) {
    return next(error);
  }
};

const listSubscriptions = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const [items, total] = await Promise.all([
      Subscription.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Subscription.countDocuments(),
    ]);
    return successResponse(res, 200, "Subscriptions retrieved", { items, total, page, limit });
  } catch (error) {
    return next(error);
  }
};

const getSettings = async (req, res, next) => {
  try {
    return successResponse(res, 200, "Application settings retrieved", await getApplicationSettings());
  } catch (error) {
    return next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await saveApplicationSettings(req.body);
    return successResponse(res, 200, "Application settings updated", settings);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getSystemStats,
  listSubscriptions,
  getSettings,
  updateSettings,
};
