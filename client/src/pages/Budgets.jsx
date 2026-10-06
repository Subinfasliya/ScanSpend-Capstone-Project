import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { LuCrown, LuTrash2 } from "react-icons/lu";
import { budgetsApi } from "../api/budgetsApi";
import { usePremiumStatus } from "../hooks/usePremiumStatus";
import { useCategoryStore } from "../store/categoryStore";
import { toast } from "react-toastify";

const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

const Budgets = () => {
  const categories = useCategoryStore((state) => state.categories);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(categories[0]?.value || "");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { premium: hasPremium, isLoading: planLoading, error: planError } = usePremiumStatus();

  const categoryNames = useMemo(() => new Map(categories.map((item) => [item.value, item.label])), [categories]);

  useEffect(() => { if (planError) setError(planError); }, [planError]);

  useEffect(() => {
    if (!hasPremium) return;
    let active = true;
    setLoading(true);
    budgetsApi.list(year, month)
      .then((result) => { if (active) { setItems(result.items); setError(""); } })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [year, month, hasPremium]);

  if (planLoading) return <p className="p-6 text-slate-500">Loading plan details...</p>;

  if (!hasPremium) {
    return (
      <section className="mx-auto max-w-3xl border border-slate-200 bg-white p-8 text-center">
        <LuCrown className="mx-auto text-amber-700" size={30} />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Budgets are a Premium feature</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">Set category limits and receive alerts as your spending approaches them.</p>
        <Link to="/app/premium" className="mt-6 inline-flex bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700">Explore Premium</Link>
        {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
      </section>
    );
  }

  const saveBudget = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await budgetsApi.save({ category, limit: Number(limit), year, month });
      const result = await budgetsApi.list(year, month);
      setItems(result.items);
      setLimit("");
      toast.success("Budget saved");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeBudget = async (item) => {
    try {
      await budgetsApi.remove({ category: item.category, year, month });
      setItems((current) => current.filter((currentItem) => currentItem.category !== item.category));
      toast.success("Budget deleted");
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-3 sm:p-5 lg:p-6">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">Planning</p>
        <h1 className="mt-2 text-3xl font-bold">Monthly budgets</h1>
        <p className="mt-2 text-emerald-50">Set category limits and compare them with your recorded spending.</p>
      </header>

      {error && <p role="alert" className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="budget-month">Month</label>
            <select id="budget-month" value={month} onChange={(event) => setMonth(Number(event.target.value))} className="border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
              {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(2000, index).toLocaleString("en", { month: "long" })}</option>)}
            </select>
            <label className="sr-only" htmlFor="budget-year">Year</label>
            <input id="budget-year" type="number" min="2000" max="2200" value={year} onChange={(event) => setYear(Number(event.target.value))} className="w-28 border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
            {loading ? <p className="p-6 text-slate-500">Loading budgets...</p> : items.length ? items.map((item) => {
              const percent = Math.min(100, item.percentUsed);
              const overBudget = item.spent > item.limit;
              const budgetWarning = item.spent / item.limit >= 0.8;
              return (
                <article key={item._id || item.category} className="p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-semibold text-slate-900">{categoryNames.get(item.category) || item.category}</h2>
                    <p className="text-sm text-slate-600">{money(item.spent)} of {money(item.limit)}</p>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${item.category} budget used`} aria-valuemin="0" aria-valuemax={item.limit} aria-valuenow={Math.min(item.spent, item.limit)}>
                    <div className={`h-full ${overBudget ? "bg-rose-600" : "bg-emerald-600"}`} style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className={`text-sm ${overBudget ? "font-semibold text-rose-700" : budgetWarning ? "font-semibold text-amber-700" : "text-slate-500"}`}>
                      {overBudget ? `${money(item.spent - item.limit)} over budget` : `${money(item.remaining)} remaining`} · {item.percentUsed}% used{budgetWarning ? " · Budget alert" : ""}
                    </p>
                    <button type="button" onClick={() => removeBudget(item)} aria-label={`Delete ${categoryNames.get(item.category) || item.category} budget`} title="Delete budget" className="border border-slate-300 p-2 text-rose-700 transition hover:bg-rose-50">
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            }) : <p className="p-6 text-slate-500">No budgets set for this month.</p>}
          </div>
        </div>

        <form onSubmit={saveBudget} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Set a category limit</h2>
          <label htmlFor="budget-category" className="mt-5 block text-sm font-medium text-slate-700">Category</label>
          <select id="budget-category" required value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
            {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <label htmlFor="budget-limit" className="mt-4 block text-sm font-medium text-slate-700">Monthly limit (₹)</label>
          <input id="budget-limit" type="number" min="0.01" step="0.01" required value={limit} onChange={(event) => setLimit(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder="e.g. 12000" />
          <button type="submit" disabled={saving || !category} className="mt-5 w-full bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50">{saving ? "Saving..." : "Save budget"}</button>
        </form>
      </section>
    </div>
  );
};

export default Budgets;