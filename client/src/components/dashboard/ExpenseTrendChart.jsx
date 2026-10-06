import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ComposedChart,
} from "recharts";
import { getExpenseTrend } from "../../utils/expenseAnalytics/expenseAnalytics";
import { useExpenseAnalytics } from "../../hooks/expenseHooks/useExpenseAnalytics";
import Dropdown from "../common/Dropdown";
import { periodOptions } from "../../constants/periodOptions";

const ExpenseTrendChart = () => {
  const [period, setPeriod] = useState("6months");

  const { userExpenses } = useExpenseAnalytics();

  const chartData = useMemo(() => {
    return getExpenseTrend(userExpenses, period);
  }, [userExpenses, period]);

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Analytics</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Monthly expense trend</h2>
        </div>

        <div className="w-full sm:w-44">
          <Dropdown
            options={periodOptions}
            value={period}
            onChange={setPeriod}
          />
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `₹${value / 1000}K`} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`₹${value}`, "Expense"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}
            />
            <Area type="monotone" dataKey="expense" fill="#8b5cf6" fillOpacity={0.08} stroke="none" />
            <Line type="monotone" dataKey="expense" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: "#7c3aed" }} activeDot={{ r: 7 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-slate-700">Expenses (₹)</p>
    </div>
  );
};

export default ExpenseTrendChart;
