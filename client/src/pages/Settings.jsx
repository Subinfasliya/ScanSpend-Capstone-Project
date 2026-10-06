import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LuActivity, LuCircleCheck, LuCircleX, LuRefreshCw, LuShieldCheck } from "react-icons/lu";
import { toast } from "react-toastify";
import { authApi } from "../api/authApi";
import { systemApi } from "../api/systemApi";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/common/ConfirmDialog";

const Settings = () => {
  const { clearSession, user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState("");
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);

  const checkHealth = async () => {
    setCheckingHealth(true);
    setHealthError("");
    try {
      setHealth(await systemApi.health());
    } catch (error) {
      setHealthError(error.message);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => { checkHealth(); }, []);

  const changePassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsChanging(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success("Password changed. Sign in again with your new password.");
      clearSession();
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsChanging(false);
    }
  };

  const logoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      await authApi.logoutAll();
      clearSession();
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoggingOutAll(false);
      setLogoutAllDialogOpen(false);
    }
  };

  const healthy = health?.status === "success" && health.database?.connected;
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || "ScanSpend user";

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-6">
      <header className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Account controls</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Settings & security</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Manage your sign-in credentials, active sessions, and service status.</p>
      </header>

      <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-4 sm:px-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-lg font-bold text-violet-800">{displayName.charAt(0).toUpperCase()}</span>
            <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{displayName}</p><p className="mt-0.5 truncate text-sm text-slate-500">{user?.email || "Account email unavailable"}</p></div>
            <span className="ml-auto hidden shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-800 sm:inline-flex">{user?.role || "User"}</span>
          </div>
          <form onSubmit={changePassword} className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><LuShieldCheck size={19} /></span>
              <div><h2 className="font-semibold text-slate-900">Change password</h2><p className="mt-1 text-sm text-slate-500">Choose a new password with at least 8 characters.</p></div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label htmlFor="current-password" className="block text-sm font-medium text-slate-700 sm:col-span-2">Current password<input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label>
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">New password<input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label>
              <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-700">Confirm new password<input id="confirm-new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label>
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">You’ll be signed out after changing your password.</p><button type="submit" disabled={isChanging} className="min-h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-50">{isChanging ? "Updating password..." : "Update password"}</button></div>
          </form>
        </article>

        <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-live="polite">
          <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700"><LuActivity size={19} /></span>
            <div className="min-w-0"><h2 className="font-semibold text-slate-900">Service status</h2><p className="mt-1 text-sm text-slate-500">API and database availability</p></div>
          </div>
          <div className="flex-1 p-4 sm:p-5">
            {healthError ? <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><p>{healthError}</p></div> : health ? (
              <>
                <p className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${healthy ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{healthy ? <LuCircleCheck size={18} /> : <LuCircleX size={18} />}{healthy ? "All systems operational" : "Service degraded"}</p>
                <dl className="mt-4 divide-y divide-slate-100 text-sm">
                  {[["API", health.api || "Unavailable"], ["Database", health.database?.status || "Unavailable"], ["Environment", health.environment || "—"], ["Version", health.version || "—"]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 py-3"><dt className="text-slate-500">{label}</dt><dd className="truncate text-right font-medium text-slate-800">{value}</dd></div>)}
                </dl>
              </>
            ) : <p className="flex min-h-32 items-center justify-center text-sm text-slate-500">Checking service status...</p>}
          </div>
          <div className="border-t border-slate-100 px-4 py-3 sm:px-5"><button type="button" onClick={checkHealth} disabled={checkingHealth} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"><LuRefreshCw className={checkingHealth ? "animate-spin" : ""} size={16} />Refresh status</button></div>
        </section>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-rose-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700"><LuShieldCheck size={18} /></span><div><h2 className="font-semibold text-slate-900">Active sessions</h2><p className="mt-1 text-sm leading-5 text-slate-600">Sign out this account on every device, including this one.</p></div></div>
        <button type="button" onClick={() => setLogoutAllDialogOpen(true)} disabled={isLoggingOutAll} className="min-h-10 w-full shrink-0 rounded-lg border border-rose-300 px-4 text-sm font-semibold text-rose-800 transition hover:bg-rose-50 disabled:opacity-50 sm:w-auto">{isLoggingOutAll ? "Signing out..." : "Sign out all devices"}</button>
      </section>
      <ConfirmDialog
        isOpen={logoutAllDialogOpen}
        onClose={() => setLogoutAllDialogOpen(false)}
        onConfirm={logoutAll}
        isLoading={isLoggingOutAll}
        title="Sign out everywhere?"
        message="This will end all active sessions for your account."
        detail="You’ll need to sign in again on this device and any other devices you use."
        confirmLabel="Sign out all devices"
      />
    </div>
  );
};

export default Settings;