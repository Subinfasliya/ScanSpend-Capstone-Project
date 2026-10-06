import { useMemo } from "react";

import { useExpenseStore } from "../../store/expenseStore";
import {
  getCategorySummary,
  getCurrentMonthExpense,
  getCurrentMonthTransactions,
  getMonthlyComparison,
  getRecentExpenses,
  getTodayExpense,
  getTopCategory,
  getTotalExpense,
  getWeeklyExpense,
} from "../../utils/expenseAnalytics/expenseAnalytics";
import { useAuth } from "../../context/AuthContext";

export const useExpenseAnalytics = () => {
  const { user } = useAuth();
  const allExpenses = useExpenseStore((state) => state.expenses);

  const analytics = useMemo(() => {
    const userExpenses = allExpenses.filter(
      (expense) => expense.userId === user.id,
    );
    return {
      userExpenses,
      totalExpense: getTotalExpense(userExpenses),
      currentMonthExpense: getCurrentMonthExpense(userExpenses),
      currentMonthTransactions: getCurrentMonthTransactions(userExpenses),
      topCategoryExpense: getTopCategory(userExpenses),
      monthlyComparison: getMonthlyComparison(userExpenses),
      todayExpense: getTodayExpense(userExpenses),
      weeklyExpense: getWeeklyExpense(userExpenses),
      categorySummary: getCategorySummary(userExpenses),
      recentExpenses: getRecentExpenses(userExpenses),
    };
  }, [allExpenses, user.id]);

  return analytics;
};
