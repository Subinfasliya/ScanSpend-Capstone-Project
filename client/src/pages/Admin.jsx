import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LuActivity,
  LuArrowLeft,
  LuArrowRight,
  LuBanknote,
  LuCircleAlert,
  LuCrown,
  LuRefreshCw,
  LuSave,
  LuSearch,
  LuSettings,
  LuShieldAlert,
  LuShieldCheck,
  LuUsers,
} from "react-icons/lu";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../api/adminApi";
import ConfirmDialog from "../components/common/ConfirmDialog";

const tabs = [
  { id: "overview", label: "Overview", icon: <LuActivity size={17} /> },
  { id: "users", label: "Users", icon: <LuUsers size={17} /> },
  { id: "billing", label: "Subscriptions & payments", icon: <LuBanknote size={17} /> },
  { id: "activity", label: "Audit activity", icon: <LuShieldCheck size={17} /> },
  { id: "settings", label: "App settings", icon: <LuSettings size={17} /> },
];

const money = (amountPaise = 0) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(Number(amountPaise || 0) / 100);

const dateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionTotal, setSubscriptionTotal] = useState(0);
  const [logs, setLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [subscriptionPage, setSubscriptionPage] = useState(1);
  const [search, setSearch] = useState("");
  const [settings, setSettings] = useState({ freeMonthlyReceiptLimit: 5, monthlyPriceInr: 499, annualPriceInr: 4990 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [updatingUser, setUpdatingUser] = useState("");
  const [pendingUserAction, setPendingUserAction] = useState(null);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [userList, systemStats, subscriptionData, audit, currentSettings] = await Promise.all([
        adminApi.users(),
        adminApi.stats(),
        adminApi.subscriptions(subscriptionPage),
        adminApi.auditLogs(auditPage),
        adminApi.settings(),
      ]);
      setUsers(userList);
      setStats(systemStats);
      setSubscriptions(subscriptionData.items);
      setSubscriptionTotal(subscriptionData.total);
      setLogs(audit.items);
      setAuditTotal(audit.total);
      setSettings(currentSettings);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [auditPage, subscriptionPage]);

  useEffect(() => {
    if (user.role === "admin") loadAdminData();
    else setLoading(false);
  }, [loadAdminData, user.role]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((account) => `${account.name} ${account.email}`.toLowerCase().includes(query));
  }, [search, users]);

  const changeUserStatus = async () => {
    const account = pendingUserAction;
    if (!account) return;
    const isActive = !account.isActive;
    setUpdatingUser(account._id);
    try {
      const updated = await adminApi.updateUserStatus(account._id, isActive);
      setUsers((current) => current.map((item) => item._id === updated._id ? { ...item, ...updated } : item));
      setStats(await adminApi.stats());
      toast.success(isActive ? "User account activated" : "User account deactivated");
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setUpdatingUser("");
      setPendingUserAction(null);
    }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSavingSettings(true);
    try {
      const saved = await adminApi.updateSettings({
        freeMonthlyReceiptLimit: Number(settings.freeMonthlyReceiptLimit),
        monthlyPriceInr: Number(settings.monthlyPriceInr),
        annualPriceInr: Number(settings.annualPriceInr),
      });
      setSettings(saved);
      toast.success("Application settings saved");
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSavingSettings(false);
    }
  };

  if (user.role !== "admin") {
    return <section className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
      <LuShieldAlert className="mx-auto text-rose-700" size={30} />
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Administrator access required</h1>
      <p className="mt-2 text-slate-600">Your account does not have permission to view this area.</p>
    </section>;
  }

  const auditPages = Math.max(1, Math.ceil(auditTotal / 50));
  const subscriptionPages = Math.max(1, Math.ceil(subscriptionTotal / 25));
  const statCards = [
    { label: "Total users", value: stats?.users?.total ?? "—", detail: `${stats?.users?.active ?? 0} active`, icon: <LuUsers />, tone: "bg-violet-50 text-violet-700" },
    { label: "Active subscriptions", value: stats?.subscriptions?.active ?? "—", detail: `${stats?.payments?.failed ?? 0} failed payments`, icon: <LuCrown />, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Captured revenue", value: money(stats?.payments?.revenuePaise), detail: `${stats?.payments?.captured ?? 0} captured payments`, icon: <LuBanknote />, tone: "bg-amber-50 text-amber-700" },
    { label: "Expenses recorded", value: stats?.expenses ?? "—", detail: `${stats?.receipts ?? 0} receipt images`, icon: <LuActivity />, tone: "bg-sky-50 text-sky-700" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-6">
      <header className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">Administrator console</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Platform operations</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Manage access, monitor billing, and keep application settings current.</p>
          </div>
          <button type="button" onClick={loadAdminData} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50 sm:self-auto"><LuRefreshCw size={16} className={loading ? "animate-spin" : ""} />Refresh</button>
        </div>
      </header>

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><p>{error}</p><button type="button" onClick={loadAdminData} className="self-start font-semibold underline underline-offset-2 sm:self-auto">Try again</button></div>}

      <div role="tablist" aria-label="Administration sections" className="flex min-w-0 gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" id={`admin-tab-${tab.id}`} aria-selected={activeTab === tab.id} aria-controls={`admin-panel-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition sm:px-4 ${activeTab === tab.id ? "border-violet-700 text-violet-800" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"}`}>
            {tab.icon}<span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`admin-panel-${activeTab}`} aria-labelledby={`admin-tab-${activeTab}`}>
        {loading ? (
          <div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading admin data">{[0, 1, 2, 3].map((item) => <div key={item} className="h-28 rounded-xl bg-slate-200" />)}</div>
        ) : activeTab === "overview" ? (
          <div className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="System statistics">
              {statCards.map((card) => <article key={card.label} className="flex min-w-0 items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${card.tone}`}>{card.icon}</span><div className="min-w-0"><p className="text-sm font-medium text-slate-500">{card.label}</p><p className="mt-1 truncate text-2xl font-bold text-slate-900">{card.value}</p><p className="mt-1 truncate text-xs text-slate-500">{card.detail}</p></div></article>)}
            </section>
            <section className="grid gap-5 xl:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5"><div><h2 className="font-semibold text-slate-900">Latest subscriptions</h2><p className="mt-1 text-xs text-slate-500">Recent orders and payment status</p></div><button type="button" onClick={() => setActiveTab("billing")} className="text-sm font-semibold text-violet-700 hover:text-violet-900">View all</button></div>
                {subscriptions.slice(0, 5).length ? <ul className="divide-y divide-slate-100">{subscriptions.slice(0, 5).map((item) => <li key={item._id} className="flex min-w-0 items-center justify-between gap-3 px-4 py-3.5 sm:px-5"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{item.userId?.name || item.userId?.email || "Deleted user"}</p><p className="mt-1 truncate text-xs text-slate-500">{item.plan} · {dateTime(item.createdAt)}</p></div><div className="shrink-0 text-right"><p className="text-sm font-semibold text-slate-900">{money(item.amount)}</p><p className={`mt-1 text-xs font-semibold capitalize ${item.status === "active" ? "text-emerald-700" : item.status === "failed" ? "text-rose-700" : "text-slate-500"}`}>{item.status}</p></div></li>)}</ul> : <p className="px-5 py-8 text-sm text-slate-500">No subscription activity yet.</p>}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700"><LuShieldCheck size={19} /></span><div><h2 className="font-semibold text-slate-900">Security activity</h2><p className="text-sm text-slate-500">Audit records retained for one year</p></div></div><p className="mt-6 text-3xl font-bold text-slate-900">{(stats?.auditEvents ?? 0).toLocaleString("en-IN")}</p><p className="mt-1 text-sm text-slate-500">total recorded events</p><button type="button" onClick={() => setActiveTab("activity")} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Review audit activity<LuArrowRight size={16} /></button></div>
            </section>
          </div>
        ) : activeTab === "users" ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-semibold text-slate-900">User accounts</h2><p className="mt-1 text-sm text-slate-500">Activate or suspend access. Administrator accounts are protected from self-deactivation.</p></div><label className="relative block w-full sm:max-w-xs"><span className="sr-only">Search accounts</span><LuSearch size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="min-h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label></div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[950px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Account</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last sign-in</th><th className="px-4 py-3 text-right">Access</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredUsers.map((account) => <tr key={account._id} className="hover:bg-slate-50/70"><td className="px-4 py-3"><p className="font-semibold text-slate-900">{account.name}</p><p className="mt-0.5 text-xs capitalize text-slate-500">{account.role} · Joined {new Date(account.createdAt).toLocaleDateString()}</p></td><td className="px-4 py-3"><span className="capitalize text-slate-700">{account.isPremium ? account.subscriptionPlan : "Free"}</span></td><td className="px-4 py-3"><p className="text-slate-700">{account.email}</p><p className={`mt-0.5 text-xs ${account.isEmailVerified ? "text-emerald-700" : "text-amber-700"}`}>{account.isEmailVerified ? "Verified" : "Unverified"}</p></td><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${account.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{account.isActive ? "Active" : "Inactive"}</span></td><td className="px-4 py-3 text-slate-500">{account.lastLoginAt ? dateTime(account.lastLoginAt) : "Never"}</td><td className="px-4 py-3 text-right"><button type="button" disabled={updatingUser === account._id || (account._id === user.id && account.isActive)} onClick={() => setPendingUserAction(account)} className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${account.isActive ? "border border-rose-200 text-rose-700 hover:bg-rose-50" : "bg-emerald-700 text-white hover:bg-emerald-800"}`}>{updatingUser === account._id ? "Saving..." : account.isActive ? "Deactivate" : "Activate"}</button></td></tr>)}</tbody></table></div>
              <div className="divide-y divide-slate-100 md:hidden">{filteredUsers.map((account) => <article key={account._id} className="space-y-3 p-4"><div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-semibold text-slate-900">{account.name}</h3><p className="mt-1 break-all text-xs text-slate-500">{account.email}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${account.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{account.isActive ? "Active" : "Inactive"}</span></div><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span className="capitalize">{account.role}</span><span>{account.isPremium ? account.subscriptionPlan : "Free plan"}</span><span>{account.isEmailVerified ? "Email verified" : "Email unverified"}</span></div><button type="button" disabled={updatingUser === account._id || (account._id === user.id && account.isActive)} onClick={() => setPendingUserAction(account)} className={`min-h-9 w-full rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${account.isActive ? "border border-rose-200 text-rose-700 hover:bg-rose-50" : "bg-emerald-700 text-white hover:bg-emerald-800"}`}>{updatingUser === account._id ? "Saving..." : account.isActive ? "Deactivate account" : "Activate account"}</button></article>)}</div>
              {!filteredUsers.length && <p className="px-4 py-10 text-center text-sm text-slate-500">{users.length ? "No accounts match your search." : "No user accounts found."}</p>}
              <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Showing {filteredUsers.length} of {users.length} accounts</div>
            </div>
          </section>
        ) : activeTab === "billing" ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-slate-900">Subscriptions & payments</h2><p className="mt-1 text-sm text-slate-500">Payment references and amounts only. Card details are not stored by ScanSpend.</p></div><p className="text-sm text-slate-500">{subscriptionTotal.toLocaleString("en-IN")} records</p></div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Payment reference</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{subscriptions.map((item) => <tr key={item._id}><td className="px-4 py-3"><p className="font-medium text-slate-900">{item.userId?.name || "Deleted user"}</p><p className="text-xs text-slate-500">{item.userId?.email || "—"}</p></td><td className="px-4 py-3 capitalize text-slate-700">{item.plan}</td><td className="px-4 py-3 font-semibold text-slate-900">{money(item.amount)} {item.currency}</td><td className="px-4 py-3 font-mono text-xs text-slate-600">{item.paymentId || item.orderId || "—"}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${item.status === "active" ? "bg-emerald-50 text-emerald-800" : item.status === "failed" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{item.status}</span></td><td className="whitespace-nowrap px-4 py-3 text-slate-500">{dateTime(item.createdAt)}</td></tr>)}</tbody></table></div>
              <div className="divide-y divide-slate-100 md:hidden">{subscriptions.map((item) => <article key={item._id} className="space-y-2 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{item.userId?.name || "Deleted user"}</p><p className="truncate text-xs text-slate-500">{item.userId?.email || "—"}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${item.status === "active" ? "bg-emerald-50 text-emerald-800" : item.status === "failed" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{item.status}</span></div><p className="text-sm text-slate-600"><span className="capitalize">{item.plan}</span> · <strong className="text-slate-900">{money(item.amount)}</strong></p><p className="break-all font-mono text-xs text-slate-500">{item.paymentId || item.orderId || "No payment reference"}</p><p className="text-xs text-slate-400">{dateTime(item.createdAt)}</p></article>)}</div>
              {!subscriptions.length && <p className="px-4 py-10 text-center text-sm text-slate-500">No subscription or payment records found.</p>}
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3"><span className="text-xs text-slate-500">Page {subscriptionPage} of {subscriptionPages}</span><div className="flex gap-2"><button type="button" aria-label="Previous subscriptions" disabled={subscriptionPage <= 1} onClick={() => setSubscriptionPage((page) => page - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"><LuArrowLeft size={17} /></button><button type="button" aria-label="Next subscriptions" disabled={subscriptionPage >= subscriptionPages} onClick={() => setSubscriptionPage((page) => page + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"><LuArrowRight size={17} /></button></div></div>
            </div>
          </section>
        ) : activeTab === "activity" ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-slate-900">Audit activity</h2><p className="mt-1 text-sm text-slate-500">Newest recorded events first · retained for up to one year</p></div><p className="text-sm text-slate-500">Page {auditPage} of {auditPages}</p></div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{logs.map((log) => <article key={log._id} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{log.action}</p><p className="mt-1 text-xs text-slate-500">{dateTime(log.createdAt)}</p></div><p className="truncate font-mono text-xs text-slate-500">{log.userId || "System"}{log.resourceId ? ` · ${log.resourceId}` : ""}</p><span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${log.statusCode < 400 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{log.statusCode} {log.statusCode < 400 ? "Success" : "Error"}</span></article>)}</div>{!logs.length && <p className="px-4 py-10 text-center text-sm text-slate-500">No audit activity found.</p>}<div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3"><span className="text-xs text-slate-500">Page {auditPage} of {auditPages}</span><div className="flex gap-2"><button type="button" aria-label="Previous audit page" disabled={auditPage <= 1} onClick={() => setAuditPage((page) => page - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"><LuArrowLeft size={17} /></button><button type="button" aria-label="Next audit page" disabled={auditPage >= auditPages} onClick={() => setAuditPage((page) => page + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"><LuArrowRight size={17} /></button></div></div></div>
          </section>
        ) : (
          <section className="mx-auto max-w-3xl space-y-5">
            <div><h2 className="text-xl font-semibold text-slate-900">Application settings</h2><p className="mt-1 text-sm text-slate-500">Changes affect new receipt scans and future subscription orders.</p></div>
            <form onSubmit={saveSettings} className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block"><span className="text-sm font-semibold text-slate-800">Free monthly receipt scans</span><span className="mt-1 block text-xs leading-5 text-slate-500">Maximum scans per free account in a UTC calendar month.</span><input type="number" min="0" max="100" step="1" required value={settings.freeMonthlyReceiptLimit} onChange={(event) => setSettings((current) => ({ ...current, freeMonthlyReceiptLimit: event.target.value }))} className="mt-3 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-2 text-slate-800"><LuCircleAlert size={17} className="text-amber-600" /><p className="text-sm font-semibold">Price changes</p></div><p className="mt-2 text-xs leading-5 text-slate-600">New prices apply to new checkout orders. Existing subscriptions remain unchanged.</p></div>
                <label className="block"><span className="text-sm font-semibold text-slate-800">Monthly Premium price (INR)</span><span className="mt-1 block text-xs leading-5 text-slate-500">Displayed and charged for new monthly plans.</span><input type="number" min="1" max="100000" step="0.01" required value={settings.monthlyPriceInr} onChange={(event) => setSettings((current) => ({ ...current, monthlyPriceInr: event.target.value }))} className="mt-3 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label>
                <label className="block"><span className="text-sm font-semibold text-slate-800">Annual Premium price (INR)</span><span className="mt-1 block text-xs leading-5 text-slate-500">Displayed and charged for new annual plans.</span><input type="number" min="1" max="1000000" step="0.01" required value={settings.annualPriceInr} onChange={(event) => setSettings((current) => ({ ...current, annualPriceInr: event.target.value }))} className="mt-3 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">Settings are stored in the application database.</p><button type="submit" disabled={savingSettings} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-wait disabled:opacity-60">{savingSettings ? <LuRefreshCw size={16} className="animate-spin" /> : <LuSave size={16} />}{savingSettings ? "Saving..." : "Save settings"}</button></div>
            </form>
          </section>
        )}
      </div>
      <ConfirmDialog
        isOpen={Boolean(pendingUserAction)}
        onClose={() => setPendingUserAction(null)}
        onConfirm={changeUserStatus}
        isLoading={Boolean(updatingUser)}
        title={pendingUserAction?.isActive ? "Deactivate user" : "Activate user"}
        message={pendingUserAction?.isActive ? `Deactivate ${pendingUserAction.name}?` : `Activate ${pendingUserAction?.name}?`}
        detail={pendingUserAction?.isActive ? "This user will lose access to ScanSpend immediately." : "This user will be able to sign in and use their account again."}
        confirmLabel={pendingUserAction?.isActive ? "Deactivate account" : "Activate account"}
        tone={pendingUserAction?.isActive ? "danger" : "primary"}
      />
    </div>
  );
};

export default Admin;
