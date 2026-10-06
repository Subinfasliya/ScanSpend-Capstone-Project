import { useEffect, useState } from "react";
import { Link } from "react-router";
import { LuCalendarClock, LuCrown, LuPause, LuPlay, LuTrash2 } from "react-icons/lu";
import { toast } from "react-toastify";
import { recurringExpensesApi } from "../api/recurringExpensesApi";
import { usePremiumStatus } from "../hooks/usePremiumStatus";
import { useCategoryStore } from "../store/categoryStore";

const toDateInput = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const formatMoney = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount || 0);

const RecurringExpenses = () => {
  const categories = useCategoryStore((state) => state.categories);
  const [items, setItems] = useState([]);
  const { premium: hasPremium, isLoading: planLoading, error: premiumError } = usePremiumStatus();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    merchant: "",
    amount: "",
    category: categories[0]?.value || "",
    frequency: "monthly",
    nextRunAt: toDateInput(new Date(Date.now() + 86400000)),
  });

  useEffect(() => {
    if (premiumError) setError(premiumError);
  }, [premiumError]);

  useEffect(() => {
    if (planLoading) return undefined;
    if (!hasPremium) {
      setItems([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    recurringExpensesApi.list()
      .then((result) => { if (active) setItems(result); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [hasPremium, planLoading]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const createSchedule = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const nextRunAt = new Date(`${form.nextRunAt}T12:00:00`).toISOString();
      const created = await recurringExpensesApi.create({
        merchant: form.merchant,
        amount: Number(form.amount),
        category: form.category,
        frequency: form.frequency,
        nextRunAt,
      });
      setItems((current) => [...current, { ...created, id: created._id || created.id }].sort((a, b) => new Date(a.nextRunAt) - new Date(b.nextRunAt)));
      setForm((current) => ({ ...current, merchant: "", amount: "" }));
      toast.success("Recurring expense scheduled");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSchedule = async (item) => {
    try {
      const updated = await recurringExpensesApi.setActive(item.id, !item.active);
      setItems((current) => current.map((row) => row.id === item.id ? { ...updated, id: updated._id || updated.id } : row));
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  const removeSchedule = async (id) => {
    try {
      await recurringExpensesApi.remove(id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success("Recurring expense removed");
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  if (planLoading || loading) return <p className="p-6 text-slate-500">Loading recurring expenses...</p>;

  if (!hasPremium) {
    return (
      <section className="mx-auto max-w-3xl border border-slate-200 bg-white p-8 text-center">
        <LuCrown className="mx-auto text-amber-700" size={30} />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Recurring schedules are a Premium feature</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">Schedule routine expenses and let ScanSpend create them for you on time.</p>
        <Link to="/app/premium" className="mt-6 inline-flex bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700">Explore Premium</Link>
        {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-3 sm:p-5 lg:p-6">
      <header className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">Premium tools</p>
        <h1 className="mt-2 text-3xl font-bold">Recurring expenses</h1>
        <p className="mt-2 text-amber-50">Schedule predictable payments. ScanSpend will create the expense when it is due.</p>
      </header>
      {error && <p role="alert" className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="divide-y divide-slate-200">
            {items.length ? items.map((item) => (
              <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold text-slate-900">{item.merchant}</h2>
                    {!item.active && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">Paused</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{formatMoney(item.amount)} · {item.frequency} · {item.category || "Uncategorized"}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><LuCalendarClock />Next run {new Date(item.nextRunAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSchedule(item)} aria-label={item.active ? `Pause ${item.merchant}` : `Resume ${item.merchant}`} title={item.active ? "Pause schedule" : "Resume schedule"} className="border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100">
                    {item.active ? <LuPause size={18} /> : <LuPlay size={18} />}
                  </button>
                  <button onClick={() => removeSchedule(item.id)} aria-label={`Delete ${item.merchant}`} title="Delete schedule" className="border border-slate-300 p-2 text-rose-700 transition hover:bg-rose-50"><LuTrash2 size={18} /></button>
                </div>
              </article>
            )) : <p className="p-6 text-slate-500">No recurring expenses yet.</p>}
          </div>
        </section>

        <form onSubmit={createSchedule} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Create schedule</h2>
          <label htmlFor="recurring-merchant" className="mt-4 block text-sm font-medium text-slate-700">Merchant</label>
          <input id="recurring-merchant" required maxLength="120" value={form.merchant} onChange={(event) => updateForm("merchant", event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
          <label htmlFor="recurring-amount" className="mt-4 block text-sm font-medium text-slate-700">Amount (₹)</label>
          <input id="recurring-amount" type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => updateForm("amount", event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
          <label htmlFor="recurring-category" className="mt-4 block text-sm font-medium text-slate-700">Category</label>
          <select id="recurring-category" value={form.category} onChange={(event) => updateForm("category", event.target.value)} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100">
            <option value="">Uncategorized</option>
            {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <label htmlFor="recurring-frequency" className="mt-4 block text-sm font-medium text-slate-700">Frequency</label>
          <select id="recurring-frequency" value={form.frequency} onChange={(event) => updateForm("frequency", event.target.value)} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100">
            <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
          </select>
          <label htmlFor="recurring-date" className="mt-4 block text-sm font-medium text-slate-700">First run</label>
          <input id="recurring-date" type="date" required min={toDateInput(new Date(Date.now() + 86400000))} max={toDateInput(new Date(Date.now() + 365 * 86400000))} value={form.nextRunAt} onChange={(event) => updateForm("nextRunAt", event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
          <button type="submit" disabled={saving} className="mt-5 w-full bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50">{saving ? "Scheduling..." : "Schedule expense"}</button>
        </form>
      </div>
    </div>
  );
};

export default RecurringExpenses;