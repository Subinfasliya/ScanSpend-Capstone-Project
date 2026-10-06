

import { capitalizeFirstLetter } from "../common/stringUtils";


/**
 * Calculate total expense
 */
export const getTotalExpense = (expenses = []) => {
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  return Number(total.toFixed(2));
};

/**
 * Calculate current month's expense
 */
export const getCurrentMonthExpense = (expenses = []) => {
  const today = new Date();

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const result = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);

      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((total, expense) => total + Number(expense.amount), 0);

  return Number(result.toFixed(2));
};

/**
 * Current Month Transactions
 */
export const getCurrentMonthTransactions = (expenses = []) => {
  const today = new Date();

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);

    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  }).length;
};

/**
 * Top Category Expense
 */
export const getTopCategory = (expenses = []) => {
  if (expenses.length === 0) {
    return {
      category: "No Data",
      amount: 0,
    };
  }

  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;

    acc[category] = (acc[category] || 0) + Number(expense.amount);

    return acc;
  }, {});

  let topCategory = "";
  let highestAmount = 0;

  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (amount > highestAmount) {
      highestAmount = amount;
      topCategory = category;
    }
  });

  return {
    category: capitalizeFirstLetter(topCategory),
    amount: Number(highestAmount.toFixed(2)),
  };
};


export const getMonthlyComparison = (expenses = []) => {
  const today = new Date();

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear =
    currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthTotal = expenses
    .filter((expense) => {
      const date = new Date(expense.date);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const lastMonthTotal = expenses
    .filter((expense) => {
      const date = new Date(expense.date);

      return (
        date.getMonth() === lastMonth &&
        date.getFullYear() === lastMonthYear
      );
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const difference = currentMonthTotal - lastMonthTotal;

  // No expenses last month
  if (lastMonthTotal === 0) {
    return {
      currentMonthTotal,
      lastMonthTotal,
      difference,
      percentage: null,
      increased: true,
      message: "New this month",
    };
  }

  const percentage = (difference / lastMonthTotal) * 100;

  // Very large percentages aren't user-friendly
  if (Math.abs(percentage) > 500) {
    return {
      currentMonthTotal,
      lastMonthTotal,
      difference,
      percentage: Number(percentage.toFixed(1)),
      increased: difference >= 0,
      message: `${difference >= 0 ? "↑" : "↓"} ₹${Math.abs(difference).toFixed(
        2
      )} vs last month`,
    };
  }

  return {
    currentMonthTotal,
    lastMonthTotal,
    difference,
    percentage: Number(percentage.toFixed(1)),
    increased: difference >= 0,
    message: `${difference >= 0 ? "↑" : "↓"} ${Math.abs(percentage).toFixed(
      1
    )}% vs last month`,
  };
};

/**
 * Expense Trend Chart Datas
 */
export const getExpenseTrend = (expenses = [], period = "6months") => {
  const today = new Date();

  let monthsToShow = 6;

  switch (period) {
    case "3months":
      monthsToShow = 3;
      break;
    case "6months":
      monthsToShow = 6;
      break;
    case "1year":
      monthsToShow = 12;
      break;
  }

  const result = [];

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - i,
      1
    );

    const month = date.toLocaleString("en-US", {
      month: "short",
    });

    const year = date.getFullYear();

    const total = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);

        return (
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === year
        );
      })
      .reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );

    result.push({
      month,
      expense: Number(total.toFixed(2)),
    });
  }

  return result;
};


/**
 * Calculate today's expense
 */
export const getTodayExpense = (expenses = []) => {
  const today = new Date().toDateString();

  return expenses
    .filter((expense) => new Date(expense.date).toDateString() === today)
    .reduce((total, expense) => total + Number(expense.amount), 0);
};

/**
 * Calculate last 7 days expense
 */
export const getWeeklyExpense = (expenses = []) => {
  const today = new Date();

  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 6);

  return expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);

      return expenseDate >= lastWeek && expenseDate <= today;
    })
    .reduce((total, expense) => total + Number(expense.amount), 0);
};

/**
 * Group expenses by category
 */
export const getCategorySummary = (expenses = []) => {
  return expenses.reduce((summary, expense) => {
    const category = expense.category;

    summary[category] = (summary[category] || 0) + Number(expense.amount);

    return summary;
  }, {});
};

/**
 * Get latest expenses
 */
export const getRecentExpenses = (expenses = [], limit = 5) => {
  return [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

/**
 * Get Financial Year Total transations
 */
