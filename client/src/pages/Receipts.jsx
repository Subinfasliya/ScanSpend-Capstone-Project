import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { LuImage, LuSearch, LuTrash2, LuUpload } from "react-icons/lu";
import { toast } from "react-toastify";
import { receiptsApi } from "../api/receiptsApi";
import { usePremiumStatus } from "../hooks/usePremiumStatus";
import ConfirmDialog from "../components/common/ConfirmDialog";

const Receipts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { premium: hasPremium } = usePremiumStatus();
  const [search, setSearch] = useState("");
  const [receiptToDelete, setReceiptToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReceipts = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await receiptsApi.list());
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReceipts(); }, [loadReceipts]);
  const visibleItems = hasPremium ? items : items.slice(0, 10);
  const filteredItems = visibleItems.filter((receipt) => {
    const merchant = receipt.extracted?.merchant || "Scanned receipt";
    return merchant.toLowerCase().includes(search.trim().toLowerCase());
  });

  const deleteReceipt = async () => {
    if (!receiptToDelete) return;
    setIsDeleting(true);
    try {
      await receiptsApi.remove(receiptToDelete._id || receiptToDelete.id);
      setItems((current) => current.filter((item) => (item._id || item.id) !== (receiptToDelete._id || receiptToDelete.id)));
      toast.success("Receipt deleted");
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setIsDeleting(false);
      setReceiptToDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-6">
      <header className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Your files</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Receipt history</h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">Review scanned receipts and their linked expenses.</p>
          </div>
          <Link to="/app/upload-receipt" className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 sm:self-auto"><LuUpload size={17} />Upload receipt</Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <label className="relative block min-w-0">
          <span className="sr-only">Search receipts by merchant</span>
          <LuSearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search receipts by merchant..." className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
        </label>
        <p className="text-sm text-slate-500">{loading ? "Loading history..." : `${filteredItems.length} of ${visibleItems.length} receipts`} <span className="hidden text-slate-300 sm:inline">/</span> <span className="block sm:inline">{hasPremium ? "Up to 500 stored" : "Latest 10 stored"}</span></p>
      </section>

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><p>{error}</p><button type="button" onClick={loadReceipts} className="self-start font-semibold underline underline-offset-2 sm:self-auto">Try again</button></div>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading receipts">
          {[0, 1, 2].map((item) => <div key={item} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="aspect-[4/3] bg-slate-200" /><div className="space-y-3 p-4"><div className="h-4 w-2/3 rounded bg-slate-200" /><div className="h-3 w-1/2 rounded bg-slate-100" /></div></div>)}
        </div>
      ) : filteredItems.length ? (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((receipt) => {
            const merchant = receipt.extracted?.merchant || "Scanned receipt";
            const receiptDate = receipt.extracted?.expenseDate ? new Date(receipt.extracted.expenseDate) : null;
            return (
              <article key={receipt._id || receipt.id} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <a href={receipt.secureUrl} target="_blank" rel="noreferrer" className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500" aria-label={`Open receipt image for ${merchant}`}>
                  <img src={receipt.secureUrl} alt={`${merchant} receipt`} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">{receipt.expenseId ? "Expense linked" : "Unlinked"}</span>
                </a>
                <div className="p-4">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-slate-900" title={merchant}>{merchant}</h2>
                      <p className="mt-1 text-sm text-slate-500">{receiptDate && !Number.isNaN(receiptDate.getTime()) ? receiptDate.toLocaleDateString() : "Date not detected"}</p>
                    </div>
                    <button type="button" onClick={() => setReceiptToDelete(receipt)} aria-label={`Delete ${merchant} receipt`} title="Delete receipt" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"><LuTrash2 size={18} /></button>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                    <p className="truncate text-lg font-bold text-slate-900">{receipt.extracted?.amount != null ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(receipt.extracted.amount) : <span className="text-sm font-medium text-slate-400">Amount not detected</span>}</p>
                    <p className="shrink-0 text-xs text-slate-500">{(Number(receipt.bytes || 0) / 1024).toFixed(0)} KB</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Uploaded {new Date(receipt.createdAt).toLocaleDateString()}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center shadow-sm sm:px-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><LuImage size={24} /></span>
          <h2 className="mt-4 font-semibold text-slate-900">{visibleItems.length ? "No matching receipts" : "No receipts yet"}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{visibleItems.length ? "Try another merchant name or clear your search." : "Uploaded receipts will appear here after scanning."}</p>
          {visibleItems.length ? <button type="button" onClick={() => setSearch("")} className="mt-4 text-sm font-semibold text-violet-700 hover:text-violet-900">Clear search</button> : <Link to="/app/upload-receipt" className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"><LuUpload size={16} />Upload your first receipt</Link>}
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(receiptToDelete)}
        onClose={() => setReceiptToDelete(null)}
        onConfirm={deleteReceipt}
        isLoading={isDeleting}
        title="Delete receipt?"
        message={`Delete the receipt${receiptToDelete?.extracted?.merchant ? ` from ${receiptToDelete.extracted.merchant}` : " image"}?`}
        detail="This cannot be undone. Any linked expense will remain in your expense records."
        confirmLabel="Delete receipt"
      />
    </div>
  );
};

export default Receipts;