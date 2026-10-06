import ExpenseCard from "../components/dashboard/ExpenseCard";
import { LuArrowRight, LuCalendarDays, LuPlus, LuWallet } from "react-icons/lu";
import { RiPieChart2Line, RiUploadCloudLine } from "react-icons/ri";
import { TfiReceipt } from "react-icons/tfi";
import { useNavigate } from "react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router";
import ActionCard from "../components/dashboard/ActionCard";
import { useExpenseStore } from "../store/expenseStore";
import { useAuth } from "../context/AuthContext";
import { useExpenseAnalytics } from "../hooks/expenseHooks/useExpenseAnalytics";
import AIAssistant from "../components/ai/ai_assistant/AIAssistant";
import { ChartSkeleton, DashboardSkeleton } from "../components/common/LoadingSkeleton";
import { receiptsApi } from "../api/receiptsApi";
import { usePremiumStatus } from "../hooks/usePremiumStatus";

const ExpenseTrendChart = lazy(
  () => import("../components/dashboard/ExpenseTrendChart"),
);

//

const Dashboard = () => {
  const [planUsage, setPlanUsage] = useState(null);
  const { user } = useAuth();
  const { premium } = usePremiumStatus();
  const isLoading = useExpenseStore((state) => state.isLoading);
  const {
    totalExpense,
    currentMonthExpense,
    currentMonthTransactions,
    topCategoryExpense,
    monthlyComparison,
    recentExpenses,
  } = useExpenseAnalytics();

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    receiptsApi.usage()
      .then((usage) => { if (active) setPlanUsage(usage); })
      .catch(() => { if (active) setPlanUsage(null); });
    return () => { active = false; };
  }, [premium]);

  if (isLoading) return <DashboardSkeleton />;

  const formatMoney = (value) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
  const displayName = user.firstName || user.name?.split(" ")[0] || "there";
  const scanProgress = planUsage?.monthlyLimit > 0
    ? Math.min(100, (planUsage.used / planUsage.monthlyLimit) * 100)
    : planUsage?.remaining === 0 ? 100 : 0;

  const handleReceiptUpload = () => {
    navigate("/app/upload-receipt");
  };
  const handleManualReceipt = () => {
    navigate("/app/review-receipt");
  };

  // Summary Cards
  const summaryCards = [
    {
      icon: <LuWallet size={30} />,
      title: "Total Expense",
      total: formatMoney(totalExpense),
      description: "All time",
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#7C3AED]",
    },
    {
      icon: <LuCalendarDays size={30} />,
      title: "This Month Expense",
      total: formatMoney(currentMonthExpense),
      description: monthlyComparison.message,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
    },
    {
      icon: <TfiReceipt size={30} />,
      title: "Transactions this month",
      total: currentMonthTransactions.toLocaleString("en-IN"),
      description: "This month",
      iconBg: "bg-[#FFEDD5]",
      iconColor: "text-[#F97316]",
    },
    {
      icon: <RiPieChart2Line size={30} />,
      title: "Top Category",
      total: topCategoryExpense.category,
      description: formatMoney(topCategoryExpense.amount),
      iconBg: "bg-[#DBEAFE]",
      iconColor: "text-[#2563EB]",
    },
  ];

  // Action cards
  const actionCards = [
    {
      title: "Scan Receipt or Upload Receipt",
      description: "Use camera to scan or upload from gallery",
      icon: <RiUploadCloudLine size={34} />,
      bgColor: "bg-[#DBEAFE]",
      iconBg: "text-[#2563EB]",
      onClick: handleReceiptUpload,
    },
    {
      title: "Add Expense",
      description: "Create expense manually",
      icon: <LuPlus size={34} />,
      bgColor: "bg-[#DCFCE7]",
      iconBg: "text-[#22C55E]",
      onClick: handleManualReceipt,
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-6">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm sm:p-7">
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Your money, in focus</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Welcome back, {displayName}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Here’s your spending at a glance. Scan a receipt or add an expense to keep things current.</p>
          </div>
          <Link to="/app/expenses" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 md:self-auto">View expenses<LuArrowRight size={16} /></Link>
        </div>
      </section>

      {planUsage && !planUsage.premium && (
        <section className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Free plan limits">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">Free plan</p><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">{planUsage.remaining} scans left</span></div>
              <h2 className="mt-2 text-base font-semibold text-slate-900">Monthly receipt allowance</h2>
              <div className="mt-3 h-2 max-w-xl overflow-hidden rounded-full bg-amber-100"><div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${scanProgress}%` }} /></div>
              <p className="mt-2 text-xs text-slate-600">{planUsage.used} of {planUsage.monthlyLimit} scans used · resets {new Date(planUsage.resetsAt).toLocaleDateString()}</p>
            </div>
            <Link to="/app/premium" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700">
              Explore Premium
            </Link>
          </div>
        </section>
      )}

      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Spending summary">
        {summaryCards.map((card) => (
          <ExpenseCard key={card.title} {...card} />
        ))}
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quick actions</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Keep your records up to date</h2>
              </div>
              <p className="text-sm text-slate-500">Choose how to add your next expense</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {actionCards.map((card) => (
                <ActionCard key={card.title} {...card} />
              ))}
            </div>
          </section>

          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <Suspense fallback={<ChartSkeleton />}>
              <ExpenseTrendChart />
            </Suspense>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Latest activity</p><h2 className="mt-1 text-lg font-semibold text-slate-900">Recent expenses</h2></div>
              <Link to="/app/expenses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-900">All expenses<LuArrowRight size={16} /></Link>
            </div>
            {recentExpenses.length ? <div className="divide-y divide-slate-100">
              {recentExpenses.slice(0, 5).map((expense) => <article key={expense.id} className="flex min-w-0 items-center gap-3 px-4 py-3.5 sm:px-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><TfiReceipt size={17} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{expense.merchant}</p><p className="mt-0.5 truncate text-xs text-slate-500">{expense.category || "Uncategorized"} · {new Date(expense.date).toLocaleDateString()}</p></div>
                <p className="shrink-0 text-sm font-semibold text-slate-900">{formatMoney(expense.amount)}</p>
              </article>)}
            </div> : <div className="px-4 py-9 text-center sm:px-5"><p className="text-sm font-medium text-slate-700">No expenses recorded yet</p><button type="button" onClick={handleManualReceipt} className="mt-2 text-sm font-semibold text-violet-700 hover:text-violet-900">Add your first expense</button></div>}
          </section>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <div className="min-h-[480px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <AIAssistant />
          </div>
        </aside>
      </div>
    </div>
  );
};
export default Dashboard;
