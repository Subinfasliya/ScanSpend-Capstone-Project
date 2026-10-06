import { useEffect, useState } from "react";
import { LuArrowLeft, LuArrowRight, LuBadgeCheck, LuCrown, LuLoaderCircle, LuShieldCheck } from "react-icons/lu";
import { toast } from "react-toastify";
import { subscriptionsApi } from "../api/subscriptionsApi";
import { usePremiumStatus } from "../hooks/usePremiumStatus";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/common/ConfirmDialog";

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(Boolean(window.Razorpay));
  script.onerror = () => reject(new Error("Could not load secure checkout."));
  document.body.appendChild(script);
});

const formatPrice = (paise) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(paise / 100);

const Premium = () => {
  const { user } = useAuth();
  const { status: subscription, premium, isLoading: loading, error: subscriptionError, refresh: refreshStatus } = usePremiumStatus();
  const [processingPlan, setProcessingPlan] = useState("");
  const [notice, setNotice] = useState("");
  const [alternateRetryPlan, setAlternateRetryPlan] = useState("");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (subscriptionError) setNotice(subscriptionError);
  }, [subscriptionError]);

  useEffect(() => {
    subscriptionsApi.history(historyPage, 10)
      .then((result) => {
        setPaymentHistory(result.items);
        setHistoryTotal(result.total);
      })
      .catch((error) => setNotice(error.message));
  }, [historyPage]);

  const startCheckout = async (plan, useAlternateMethods = false) => {
    setNotice("");
    setAlternateRetryPlan("");
    setProcessingPlan(plan);
    try {
      const ready = await loadRazorpay();
      if (!ready) throw new Error("Secure checkout is unavailable right now.");
      const order = await subscriptionsApi.checkout(plan);
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ScanSpend",
        description: `${plan === "annual" ? "Annual" : "Monthly"} Premium plan`,
        order_id: order.orderId,
        ...(useAlternateMethods && {
          method: { card: false, upi: true, netbanking: true, wallet: false },
        }),
        prefill: { name: user.name, email: user.email },
        theme: { color: "#6d5b45" },
        modal: { ondismiss: () => setProcessingPlan("") },
        handler: async (payment) => {
          setNotice("Payment received. Verifying it securely...");
          try {
            await subscriptionsApi.verifyPayment({
              orderId: payment.razorpay_order_id,
              paymentId: payment.razorpay_payment_id,
              signature: payment.razorpay_signature,
            });
            const current = await refreshStatus(true);
            setNotice(current.premium
              ? "Premium is active. Your premium tools are ready."
              : "Payment was verified. Refresh your subscription status in a moment.");
          } catch (error) {
            setNotice(error.message);
          } finally {
            setProcessingPlan("");
          }
        },
      });
      checkout.on("payment.failed", (event) => {
        const description = event.error?.description || "Payment was not completed. Please try again.";
        const isInternationalCardRejection = /international cards are not supported/i.test(description);
        setAlternateRetryPlan(isInternationalCardRejection ? plan : "");
        setNotice(isInternationalCardRejection
          ? "Razorpay has not enabled international-card payments for this account. Retry with UPI or netbanking, or ask the merchant account owner to enable international cards with Razorpay."
          : description);
        setProcessingPlan("");
      });
      checkout.open();
    } catch (error) {
      setNotice(error.message);
      setProcessingPlan("");
    }
  };

  const cancelAtPeriodEnd = async () => {
    setCancelling(true);
    setNotice("");
    try {
      await subscriptionsApi.cancel();
      await refreshStatus(true);
      toast.success("Premium cancellation scheduled");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl animate-pulse space-y-5 p-3 sm:p-5 lg:p-6" aria-label="Loading membership details"><div className="h-40 rounded-2xl bg-slate-200" /><div className="grid gap-4 md:grid-cols-2"><div className="h-72 rounded-xl bg-slate-200" /><div className="h-72 rounded-xl bg-slate-200" /></div><div className="h-48 rounded-xl bg-slate-200" /></div>;
  }

  const plans = subscription?.plans;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><LuCrown size={22} /></span>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">ScanSpend Plus</p>
            </div>
            <h1 className="mt-5 text-2xl font-bold text-slate-950 sm:text-3xl">Premium membership</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">More control over receipt capture, spending reports, and recurring expenses.</p>
          </div>
          <div className="flex items-center border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7 lg:border-l lg:border-t-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your plan</p>
              <p className={`mt-1 text-lg font-bold ${premium ? "text-emerald-800" : "text-slate-800"}`}>{premium ? "Premium active" : "Free plan"}</p>
              <p className="mt-1 text-xs text-slate-500">{premium ? `${subscription.subscription?.plan || "Premium"} membership` : "Choose a plan to unlock premium tools"}</p>
            </div>
          </div>
        </div>
      </section>

      {notice && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-6">{notice}</p>
        {alternateRetryPlan && <button type="button" onClick={() => startCheckout(alternateRetryPlan, true)} disabled={Boolean(processingPlan)} className="min-h-10 shrink-0 rounded-lg border border-amber-800 px-3 font-semibold text-amber-950 transition hover:bg-amber-100 disabled:opacity-50">{processingPlan ? "Opening checkout..." : "Retry with UPI or netbanking"}</button>}
      </div>}

      {premium ? (
        <section className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-l-4 border-emerald-600 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <LuBadgeCheck className="mt-0.5 shrink-0 text-emerald-700" size={23} />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-emerald-950">Premium is active</h2>
                <p className="mt-1 text-sm text-emerald-900">{subscription.subscription?.expiresAt ? `Access through ${new Date(subscription.subscription.expiresAt).toLocaleDateString()}` : "Your premium features are ready to use."}</p>
                {subscription.subscription?.cancelAtPeriodEnd && <p className="mt-2 text-sm font-medium text-amber-800">Cancellation is scheduled. Your access remains active through the paid period.</p>}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
              <button type="button" onClick={() => refreshStatus(true).catch((error) => setNotice(error.message))} className="min-h-10 rounded-lg border border-emerald-800 bg-white px-4 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100">Refresh status</button>
              {!subscription.subscription?.cancelAtPeriodEnd && <button type="button" onClick={() => setCancelDialogOpen(true)} disabled={cancelling} className="min-h-10 rounded-lg px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50">{cancelling ? "Scheduling cancellation..." : "Cancel at period end"}</button>}
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            {[
              ["Plan", subscription.subscription?.plan || "Premium"],
              ["Status", subscription.subscription?.cancelAtPeriodEnd ? "Ends at period close" : "In good standing"],
              ["Renewal", "Manual payment"],
            ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 px-3 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-semibold capitalize text-slate-900">{value}</p></div>)}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div><h2 className="text-xl font-semibold text-slate-900">Choose a plan</h2><p className="mt-1 text-sm text-slate-500">Secure one-time payment · access for the selected term</p></div>
            <p className="text-xs text-slate-500">Prices shown in Indian rupees</p>
          </div>
          <div className="grid items-stretch gap-4 lg:grid-cols-2">
            {[
              { id: "monthly", title: "Monthly", detail: "30 days of Premium access", period: "One-time payment" },
              { id: "annual", title: "Annual", detail: "12 months of Premium access", period: "One-time payment" },
            ].map((plan) => (
              <article key={plan.id} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                <div className="border-b border-slate-100 bg-slate-50/80 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{plan.title}</p><p className="mt-1 text-sm text-slate-600">{plan.detail}</p></div><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">{plan.period}</span></div>
                  <p className="mt-5 text-3xl font-bold text-slate-950 sm:text-4xl">{plans ? formatPrice(plans[plan.id].amount) : "Price unavailable"}</p>
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Included features</p>
                  <ul className="mt-4 grid flex-1 gap-x-4 gap-y-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <li className="flex items-start gap-2"><LuShieldCheck className="mt-0.5 shrink-0 text-emerald-700" />Unlimited receipt scans with advanced OCR</li>
                    <li className="flex items-start gap-2"><LuShieldCheck className="mt-0.5 shrink-0 text-emerald-700" />AI insights and advanced analytics</li>
                    <li className="flex items-start gap-2"><LuShieldCheck className="mt-0.5 shrink-0 text-emerald-700" />CSV, Excel, and PDF reports</li>
                    <li className="flex items-start gap-2"><LuShieldCheck className="mt-0.5 shrink-0 text-emerald-700" />Advanced filters and date ranges</li>
                    <li className="flex items-start gap-2"><LuShieldCheck className="mt-0.5 shrink-0 text-emerald-700" />Budgets, alerts, and recurring expenses</li>
                    <li className="flex items-start gap-2"><LuShieldCheck className="mt-0.5 shrink-0 text-emerald-700" />History for up to 500 receipts</li>
                  </ul>
                <button
                  type="button"
                  onClick={() => startCheckout(plan.id)}
                  disabled={!subscription?.paymentConfigured || Boolean(processingPlan)}
                  className="mt-6 min-h-11 w-full rounded-lg bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {processingPlan === plan.id ? "Opening secure checkout..." : "Continue to secure checkout"}
                </button>
                </div>
              </article>
            ))}
          </div>
          {!subscription?.paymentConfigured && <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Payments are not configured on this server yet. Contact the administrator to enable checkout.</p>}
          <p className="text-xs leading-5 text-slate-500">Premium activates after the payment provider confirms payment. Plans do not auto-renew; purchase another term when you want to continue.</p>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div><h2 className="text-lg font-semibold text-slate-900">Payment history</h2><p className="mt-1 text-sm text-slate-500">Orders, payment references, and subscription status</p></div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{historyTotal} record{historyTotal === 1 ? "" : "s"}</span>
        </div>
        {paymentHistory.length ? <div className="divide-y divide-slate-100">
          {paymentHistory.map((payment) => (
            <article key={payment._id} className="grid min-w-0 gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
              <div className="min-w-0"><p className="font-semibold capitalize text-slate-900">{payment.plan} plan · {formatPrice(payment.amount)}</p><p className="mt-1 break-all font-mono text-xs text-slate-500">{payment.paymentId || payment.orderId}</p><p className="mt-1 text-xs text-slate-500">{new Date(payment.createdAt).toLocaleDateString()}</p></div>
              <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${payment.status === "active" ? "bg-emerald-50 text-emerald-800" : payment.status === "failed" ? "bg-rose-50 text-rose-700" : payment.status === "expired" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-800"}`}>{payment.cancelAtPeriodEnd && payment.status === "active" ? "Cancellation scheduled" : payment.status}</span>{payment.expiresAt && <span className="text-xs text-slate-500">Until {new Date(payment.expiresAt).toLocaleDateString()}</span>}</div>
            </article>
          ))}
        </div> : <p className="px-4 py-8 text-sm text-slate-500 sm:px-5">No payment records yet.</p>}
        {historyTotal > 10 && <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:px-5"><p className="text-xs text-slate-500">Page {historyPage} of {Math.ceil(historyTotal / 10)}</p><div className="flex gap-2"><button type="button" aria-label="Previous payment history page" disabled={historyPage <= 1} onClick={() => setHistoryPage((page) => page - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"><LuArrowLeft size={16} /></button><button type="button" aria-label="Next payment history page" disabled={historyPage >= Math.ceil(historyTotal / 10)} onClick={() => setHistoryPage((page) => page + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"><LuArrowRight size={16} /></button></div></div>}
      </section>
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={cancelAtPeriodEnd}
        isLoading={cancelling}
        title="Cancel Premium?"
        message="Your plan will end after the current paid period."
        detail={`You’ll keep Premium access until ${subscription?.subscription?.expiresAt ? new Date(subscription.subscription.expiresAt).toLocaleDateString() : "your current period ends"}. This does not issue a refund.`}
        confirmLabel="Schedule cancellation"
      />
    </div>
  );
};

export default Premium;