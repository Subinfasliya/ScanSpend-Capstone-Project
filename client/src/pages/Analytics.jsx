import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { LuDownload, LuCrown } from "react-icons/lu";
import { FaChartLine, FaReceipt, FaRegCalendarAlt, FaWallet } from "react-icons/fa";
import { toast } from "react-toastify";
import { analyticsApi } from "../api/analyticsApi";
import { subscriptionsApi } from "../api/subscriptionsApi";
import { usePremiumStatus } from "../hooks/usePremiumStatus";

const inputDate = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const asIso = (date, end = false) => new Date(`${date}T${end ? "23:59:59.999" : "00:00:00"}`).toISOString();
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

const Analytics = () => {
  const initialTo = new Date();
  const initialFrom = new Date();
  initialFrom.setFullYear(initialFrom.getFullYear() - 1);
  const [from, setFrom] = useState(inputDate(initialFrom));
  const [to, setTo] = useState(inputDate(initialTo));
  const { premium: hasPremium } = usePremiumStatus();
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async (fromDate = from, toDate = to) => {
    setLoading(true);
    setError("");
    try {
      const status = await subscriptionsApi.get();
      const report = await analyticsApi.summary(asIso(fromDate), asIso(toDate, true));
      setSummary(report);
      if (status.premium) setInsights(await analyticsApi.insights());
      else setInsights(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const exportReport = async (format) => {
    setExporting(true);
    try {
      const exporters = { csv: analyticsApi.exportCsv, excel: analyticsApi.exportExcel, pdf: analyticsApi.exportPdf };
      const blob = await exporters[format](asIso(from), asIso(to, true));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scanspend-expenses.${format === "excel" ? "xlsx" : format}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-5 p-3 sm:p-5 lg:p-6" aria-label="Loading analytics">
      <div className="h-36 rounded-2xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-3"><div className="h-28 rounded-xl bg-slate-200" /><div className="h-28 rounded-xl bg-slate-200" /><div className="h-28 rounded-xl bg-slate-200" /></div>
      <div className="grid gap-5 lg:grid-cols-2"><div className="h-80 rounded-xl bg-slate-200" /><div className="h-80 rounded-xl bg-slate-200" /></div>
    </div>
  );

  const maxCategory = Math.max(1, ...(summary?.categories || []).map((item) => item.amount));
  const maxMonth = Math.max(1, ...(summary?.months || []).map((item) => item.amount));
  const averageSpend = summary?.count ? summary.total / summary.count : 0;
  const monthColors = ["bg-violet-600", "bg-emerald-600", "bg-amber-500", "bg-sky-600", "bg-rose-500"];

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-6">
      <header className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">{hasPremium ? "Premium reports" : "Spending overview"}</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Spending analytics</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">See where your money goes and how your spending changes over time.</p>
          </div>
          {hasPremium ? (
            <div className="flex flex-wrap gap-2">
              {[['csv', 'CSV'], ['excel', 'Excel'], ['pdf', 'PDF']].map(([format, label]) => (
                <button key={format} type="button" onClick={() => exportReport(format)} disabled={exporting} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60">
                  <LuDownload size={16} />{exporting ? "Preparing..." : `Export ${label}`}
                </button>
              ))}
            </div>
          ) : (
            <Link to="/app/premium" className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-emerald-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 lg:self-auto"><LuCrown size={18} />Unlock premium reports</Link>
          )}
        </div>
      </header>

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><p>{error}</p><button type="button" onClick={() => loadReport()} className="self-start font-semibold underline underline-offset-2 sm:self-auto">Try again</button></div>}

      {hasPremium ? (
        <form onSubmit={(event) => { event.preventDefault(); loadReport(from, to); }} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:mr-auto"><FaRegCalendarAlt className="text-violet-600" />Report period</div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div><label htmlFor="report-from" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">From</label><input id="report-from" type="date" required value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 sm:w-auto" /></div>
            <div><label htmlFor="report-to" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">To</label><input id="report-to" type="date" required value={to} min={from} max={inputDate(new Date())} onChange={(event) => setTo(event.target.value)} className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 sm:w-auto" /></div>
          </div>
          <button type="submit" className="min-h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700">Apply range</button>
        </form>
      ) : (
        <div className="flex flex-col gap-1 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="font-medium text-violet-950">Showing your recent spending summary.</p><p className="text-violet-800">Choose a custom date range with Premium.</p></div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Spending summary">
        {[
          { label: "Total spend", value: money(summary?.total), detail: "Across the selected period", icon: <FaWallet />, tone: "bg-violet-50 text-violet-700" },
          { label: "Transactions", value: (summary?.count || 0).toLocaleString("en-IN"), detail: "Recorded expenses", icon: <FaReceipt />, tone: "bg-emerald-50 text-emerald-700" },
          { label: "Average transaction", value: money(averageSpend), detail: "Average amount per expense", icon: <FaChartLine />, tone: "bg-amber-50 text-amber-700" },
        ].map((item) => (
          <article key={item.label} className="flex min-w-0 items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${item.tone}`} aria-hidden="true">{item.icon}</span>
            <div className="min-w-0"><p className="text-sm font-medium text-slate-500">{item.label}</p><p className="mt-1 truncate text-2xl font-bold text-slate-900">{item.value}</p><p className="mt-1 text-xs text-slate-500">{item.detail}</p></div>
          </article>
        ))}
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Spending by category</h2><p className="mt-1 text-sm text-slate-500">Your largest categories in this period</p></div><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{summary?.categories?.length || 0} categories</span></div>
          {summary?.categories?.length ? (
            <div className="mt-6 space-y-5">{summary.categories.map((item, index) => (
              <div key={item.category}>
                <div className="mb-2 flex min-w-0 items-baseline justify-between gap-3"><span className="truncate text-sm font-medium text-slate-700">{item.category}</span><span className="shrink-0 text-sm font-semibold text-slate-900">{money(item.amount)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${monthColors[index % monthColors.length]}`} style={{ width: `${Math.max(3, item.amount / maxCategory * 100)}%` }} /></div>
              </div>
            ))}</div>
          ) : <div className="mt-6 rounded-lg bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">No expenses in this period yet.</div>}
        </article>

        <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Monthly trend</h2><p className="mt-1 text-sm text-slate-500">Compare totals month by month</p></div><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">INR</span></div>
          {summary?.months?.length ? (
            <div className="mt-5 overflow-x-auto pb-2">
              <div className="flex h-56 min-w-max items-end gap-3 border-b border-slate-200 px-1 sm:gap-4">{summary.months.map((item, index) => {
                const monthLabel = new Date(`${item.month}-01T12:00:00`).toLocaleDateString("en", { month: "short" });
                const height = Math.max(5, item.amount / maxMonth * 100);
                return <div key={item.month} className="flex h-full w-12 shrink-0 flex-col items-center justify-end gap-2 sm:w-14" title={`${monthLabel} ${item.month.slice(0, 4)}: ${money(item.amount)}`}>
                  <div className="flex h-full w-full items-end"><div className={`w-full rounded-t-md ${monthColors[index % monthColors.length]} transition-[height]`} style={{ height: `${height}%` }} /></div>
                  <span className="pb-2 text-xs font-medium text-slate-500">{monthLabel}</span>
                </div>;
              })}</div>
              <p className="mt-3 text-right text-xs text-slate-400">Scroll horizontally to view all months</p>
            </div>
          ) : <div className="mt-6 rounded-lg bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">No monthly data to compare yet.</div>}
        </article>
      </section>

      {hasPremium && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5"><div><h2 className="text-lg font-semibold text-slate-900">Spending insights</h2><p className="mt-1 text-sm text-slate-500">Patterns based on your expense activity</p></div>{insights?.source && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">{insights.source} insights</span>}</div>
        {insights?.insights?.length ? <ul className="divide-y divide-slate-100">{insights.insights.map((item, index) => <li key={`${item.type}-${index}`} className="flex gap-3 px-4 py-4 text-sm leading-6 text-slate-700 sm:px-5"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />{item.message}</li>)}</ul> : <p className="px-4 py-5 text-sm text-slate-500 sm:px-5">Add more expenses over time to receive useful observations.</p>}
      </section>}
    </div>
  );
};

export default Analytics;