const Expense = require("../models/expenseModel");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { successResponse } = require("../utils/apiResponse");
const { generateInsights } = require("../services/insightService");
const { fromMinorUnits } = require("../utils/money");

const buildRange = (req) => {
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 365 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to || to - from > 2 * 366 * 24 * 60 * 60 * 1000) {
    const error = new Error("Provide a valid date range of at most two years");
    error.statusCode = 400;
    throw error;
  }
  return { from, to };
};

const aggregateSpending = async (userId, from, to) => {
  const results = await Expense.aggregate([
    { $match: { userId, expenseDate: { $gte: from, $lte: to } } },
    {
      $facet: {
        totals: [{ $group: { _id: null, amountMinor: { $sum: "$amountMinor" }, count: { $sum: 1 } } }],
        categories: [{ $group: { _id: { $ifNull: ["$category", "Uncategorized"] }, amountMinor: { $sum: "$amountMinor" }, count: { $sum: 1 } } }, { $sort: { amountMinor: -1 } }],
        months: [{ $group: { _id: { $dateToString: { format: "%Y-%m", date: "$expenseDate" } }, amountMinor: { $sum: "$amountMinor" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }],
      },
    },
  ]);
  const result = results[0] || { totals: [], categories: [], months: [] };
  return {
    total: fromMinorUnits(result.totals[0]?.amountMinor || 0),
    count: result.totals[0]?.count || 0,
    categories: result.categories.map(({ _id, amountMinor, count }) => ({
      category: _id,
      amount: fromMinorUnits(amountMinor),
      count,
    })),
    months: result.months.map(({ _id, amountMinor, count }) => ({
      month: _id,
      amount: fromMinorUnits(amountMinor),
      count,
    })),
  };
};

const summarizeExpenses = (expenses) => {
  const categories = new Map();
  const months = new Map();
  let totalMinor = 0;

  for (const expense of expenses) {
    const amountMinor = Number(expense.amountMinor || 0);
    const category = expense.category || "Uncategorized";
    const month = new Date(expense.expenseDate).toISOString().slice(0, 7);
    totalMinor += amountMinor;

    const categorySummary = categories.get(category) || { category, amountMinor: 0, count: 0 };
    categorySummary.amountMinor += amountMinor;
    categorySummary.count += 1;
    categories.set(category, categorySummary);

    const monthSummary = months.get(month) || { month, amountMinor: 0, count: 0 };
    monthSummary.amountMinor += amountMinor;
    monthSummary.count += 1;
    months.set(month, monthSummary);
  }

  return {
    totalMinor,
    count: expenses.length,
    categories: [...categories.values()].sort((a, b) => b.amountMinor - a.amountMinor),
    months: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)),
  };
};

const getExportData = async (userId, from, to) => {
  const expenses = await Expense.find({ userId, expenseDate: { $gte: from, $lte: to } })
    .select("merchant amountMinor category expenseDate notes")
    .sort({ expenseDate: 1, _id: 1 })
    .limit(50000)
    .lean();
  return { expenses, summary: summarizeExpenses(expenses) };
};

const summary = async (req, res, next) => {
  try {
    const range = buildRange(req);
    const data = await aggregateSpending(req.user._id, range.from, range.to);
    return successResponse(res, 200, "Analytics retrieved successfully", { ...range, ...data });
  } catch (error) {
    return next(error);
  }
};

const exportExpenses = async (req, res, next) => {
  try {
    const { from, to } = buildRange(req);
    const { expenses } = await getExportData(req.user._id, from, to);
    const safeCell = (value) => {
      let text = String(value ?? "");
      if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
      return `"${text.replaceAll('"', '""')}"`;
    };
    const lines = [
      ["date", "merchant", "amount", "category", "notes"].map(safeCell).join(","),
      ...expenses.map((item) => [item.expenseDate.toISOString(), item.merchant, fromMinorUnits(item.amountMinor), item.category, item.notes].map(safeCell).join(",")),
    ];
    res.set({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="expenses.csv"',
      "Cache-Control": "no-store",
    });
    return res.status(200).send(lines.join("\r\n"));
  } catch (error) {
    return next(error);
  }
};

const exportExpensesExcel = async (req, res, next) => {
  try {
    const { from, to } = buildRange(req);
    const { expenses, summary } = await getExportData(req.user._id, from, to);
    const workbook = new ExcelJS.Workbook();
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.addRow(["ScanSpend Expense Report"]);
    summarySheet.addRow(["Reporting period", `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`]);
    summarySheet.addRow(["Total spending (INR)", fromMinorUnits(summary.totalMinor)]);
    summarySheet.addRow(["Total expenses", summary.count]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Category summary"]);
    summarySheet.addRow(["Category", "Total (INR)", "Transactions"]);
    const categoryHeaderRow = summarySheet.lastRow.number;
    for (const item of summary.categories) {
      summarySheet.addRow([item.category, fromMinorUnits(item.amountMinor), item.count]);
    }
    summarySheet.addRow([]);
    summarySheet.addRow(["Monthly summary"]);
    summarySheet.addRow(["Month", "Total (INR)", "Transactions"]);
    const monthHeaderRow = summarySheet.lastRow.number;
    for (const item of summary.months) {
      summarySheet.addRow([item.month, fromMinorUnits(item.amountMinor), item.count]);
    }
    summarySheet.columns = [{ width: 30 }, { width: 24 }, { width: 18 }];
    summarySheet.getRow(1).font = { bold: true, size: 16 };
    summarySheet.getRow(categoryHeaderRow).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summarySheet.getRow(monthHeaderRow).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summarySheet.getRow(categoryHeaderRow).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
    summarySheet.getRow(monthHeaderRow).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };

    const sheet = workbook.addWorksheet("Expenses");
    sheet.columns = [
      { header: "Date", key: "date", width: 24 },
      { header: "Merchant", key: "merchant", width: 32 },
      { header: "Amount (INR)", key: "amount", width: 18 },
      { header: "Category", key: "category", width: 22 },
      { header: "Notes", key: "notes", width: 48 },
    ];
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
    for (const expense of expenses) {
      sheet.addRow({
        date: expense.expenseDate.toISOString(),
        merchant: expense.merchant,
        amount: fromMinorUnits(expense.amountMinor),
        category: expense.category || "Uncategorized",
        notes: expense.notes || "",
      });
    }
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="expenses.xlsx"',
      "Cache-Control": "no-store",
    });
    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    return next(error);
  }
};

const exportExpensesPdf = async (req, res, next) => {
  try {
    const { from, to } = buildRange(req);
    const { expenses, summary } = await getExportData(req.user._id, from, to);
    const document = new PDFDocument({ margin: 48, size: "A4" });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="expenses.pdf"',
      "Cache-Control": "no-store",
    });
    document.pipe(res);
    const safePdfText = (value) => String(value ?? "").replace(/[^\x20-\x7e]/g, "?");
    const formatPdfMoney = (amountMinor) => `INR ${fromMinorUnits(amountMinor).toFixed(2)}`;
    document.fontSize(20).fillColor("#0f172a").text("ScanSpend Expense Report");
    document.moveDown(0.4).fontSize(10).fillColor("#475569")
      .text(`Reporting period: ${from.toLocaleDateString()} - ${to.toLocaleDateString()}`)
      .text(`Total spending: ${formatPdfMoney(summary.totalMinor)}  |  Expenses: ${summary.count}`);
    document.moveDown(0.8).fontSize(13).fillColor("#0f172a").text("Category breakdown");
    const categoryMax = Math.max(1, ...summary.categories.map((item) => item.amountMinor));
    for (const item of summary.categories.slice(0, 10)) {
      const y = document.y + 3;
      document.fontSize(9).fillColor("#334155").text(safePdfText(item.category), 48, y, { width: 130, lineBreak: false });
      document.save().fillColor("#e2e8f0").rect(184, y + 2, 220, 8).fill();
      document.fillColor("#0f766e").rect(184, y + 2, Math.max(2, 220 * item.amountMinor / categoryMax), 8).fill().restore();
      document.fontSize(9).fillColor("#334155").text(`${formatPdfMoney(item.amountMinor)} (${item.count})`, 412, y, { width: 135, lineBreak: false, align: "right" });
      document.y = y + 16;
    }
    document.moveDown(0.5).fontSize(13).fillColor("#0f172a").text("Monthly spending");
    const monthlyMax = Math.max(1, ...summary.months.map((item) => item.amountMinor));
    const monthlyBarWidth = Math.min(450, (document.page.width - 96) / Math.max(summary.months.length, 1) - 5);
    const monthlyBaseY = document.y + 76;
    summary.months.forEach((item, index) => {
      const height = Math.max(2, 55 * item.amountMinor / monthlyMax);
      const x = 48 + index * (monthlyBarWidth + 5);
      if (x + monthlyBarWidth > document.page.width - 48) return;
      document.save().fillColor("#4f46e5").rect(x, monthlyBaseY - height, monthlyBarWidth, height).fill().restore();
      document.fontSize(7).fillColor("#475569").text(item.month.slice(2), x - 2, monthlyBaseY + 4, { width: monthlyBarWidth + 4, align: "center", lineBreak: false });
    });
    document.y = monthlyBaseY + 23;
    document.moveDown(0.3).fontSize(13).fillColor("#0f172a").text("Expense details");
    document.moveDown(0.3).fillColor("#111827");
    for (const expense of expenses) {
      const amount = formatPdfMoney(expense.amountMinor);
      document.fontSize(9).text(safePdfText(`${expense.expenseDate.toLocaleDateString()}  |  ${expense.merchant}  |  ${expense.category || "Uncategorized"}  |  ${amount}`));
      if (expense.notes) document.fontSize(8).fillColor("#555555").text(safePdfText(expense.notes)).fillColor("#111111");
      document.moveDown(0.35);
    }
    document.end();
  } catch (error) {
    return next(error);
  }
};

const insights = async (req, res, next) => {
  try {
    const now = new Date();
    const currentFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousFrom = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const [current, previous, categories, months] = await Promise.all([
      Expense.aggregate([{ $match: { userId: req.user._id, expenseDate: { $gte: currentFrom, $lte: now } } }, { $group: { _id: null, amountMinor: { $sum: "$amountMinor" } } }]),
      Expense.aggregate([{ $match: { userId: req.user._id, expenseDate: { $gte: previousFrom, $lt: currentFrom } } }, { $group: { _id: null, amountMinor: { $sum: "$amountMinor" } } }]),
      Expense.aggregate([{ $match: { userId: req.user._id, expenseDate: { $gte: currentFrom, $lte: now } } }, { $group: { _id: { $ifNull: ["$category", "Uncategorized"] }, amountMinor: { $sum: "$amountMinor" } } }, { $sort: { amountMinor: -1 } }, { $limit: 10 }]),
      Expense.aggregate([{ $match: { userId: req.user._id, expenseDate: { $gte: previousFrom, $lte: now } } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$expenseDate" } }, amountMinor: { $sum: "$amountMinor" } } }, { $sort: { _id: 1 } }]),
    ]);
    const data = {
      totals: {
        currentPeriod: fromMinorUnits(current[0]?.amountMinor || 0),
        previousPeriod: fromMinorUnits(previous[0]?.amountMinor || 0),
      },
      categories: categories.map(({ _id, amountMinor }) => ({ category: _id, amount: fromMinorUnits(amountMinor) })),
      months: months.map(({ _id, amountMinor }) => ({ month: _id, amount: fromMinorUnits(amountMinor) })),
    };
    const result = await generateInsights(data);
    return successResponse(res, 200, "Spending insights generated", result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { summary, exportExpenses, exportExpensesExcel, exportExpensesPdf, insights, summarizeExpenses };