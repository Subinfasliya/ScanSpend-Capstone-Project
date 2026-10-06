


import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { LuCloudUpload, LuImage, LuLoaderCircle, LuShieldCheck } from "react-icons/lu";

import { useFormStore } from "../store/expenseStore";
import { receiptsApi } from "../api/receiptsApi";
import { useCategoryStore } from "../store/categoryStore";
import { usePremiumStatus } from "../hooks/usePremiumStatus";

const UploadReceipt = () => {
  const setFormData = useFormStore((state) => state.setFormData);
  const setImage = useFormStore((state) => state.setImage);
  const categories = useCategoryStore((state) => state.categories);
  const { premium } = usePremiumStatus();

  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [isUsageLoading, setIsUsageLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsUsageLoading(true);
    receiptsApi.usage()
      .then((status) => {
        if (active) setUsage(status);
      })
      .catch((error) => { if (active) toast.error(error.message || "Unable to load receipt allowance."); })
      .finally(() => { if (active) setIsUsageLoading(false); });
    return () => { active = false; };
  }, [premium]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];

    if (!f) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 5 * 1024 * 1024) {
      toast.error("Choose a JPEG, PNG, or WebP image smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setFile(f);

    const reader = new FileReader();

    reader.onload = () => setPreview(reader.result);

    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select a receipt.");
      return;
    }

    try {
      setIsUploading(true);
      const receipt = await receiptsApi.upload(file);
      const extracted = receipt.extracted || {};
      const receiptDate = extracted.expenseDate ? new Date(extracted.expenseDate) : new Date();
      const pad = (value) => String(value).padStart(2, "0");
      setImage(receipt.secureUrl);
      setFormData({
        merchant: extracted.merchant || "",
        amount: extracted.amount ?? "",
        category: categories[0]?.value || "others",
        date: `${receiptDate.getFullYear()}-${pad(receiptDate.getMonth() + 1)}-${pad(receiptDate.getDate())}`,
        time: `${pad(receiptDate.getHours())}:${pad(receiptDate.getMinutes())}`,
        note: "",
        rawText: extracted.rawText || "",
        receiptId: receipt._id || receipt.id,
      });
      setUsage((current) => current ? {
        ...current,
        used: current.used + 1,
        remaining: current.remaining === null ? null : Math.max(0, current.remaining - 1),
      } : current);
      toast.success("Receipt securely uploaded and scanned.");
      navigate("/app/review-receipt");
    } catch (error) {
      console.error(error);
      if (error.status === 429) receiptsApi.usage().then(setUsage).catch(() => {});
      toast.error(error.message || "Unable to scan receipt. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-6">
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">Receipt capture</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Upload a receipt</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Add a clear receipt image and we’ll extract the expense details for you to review.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 sm:self-auto">
            <LuShieldCheck size={18} className="shrink-0 text-emerald-300" />
            Secure upload
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Receipt image</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a photo from your device or take one with your camera.</p>
          </div>

          <label className="group flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/70 px-4 py-8 text-center transition hover:border-violet-500 hover:bg-violet-50 sm:min-h-60 sm:px-8">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm transition group-hover:-translate-y-0.5">
              <LuCloudUpload size={28} />
            </span>
            <span className="font-semibold text-slate-800">{file ? "Choose a different image" : "Select a receipt image"}</span>
            <span className="mt-1 text-sm text-slate-500">JPEG, PNG, or WebP · up to 5 MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          {preview ? (
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                    <LuImage size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{file?.name}</p>
                    <p className="text-xs text-slate-500">{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-emerald-700">Ready to scan</span>
              </div>
              <div className="flex h-[min(58vh,420px)] min-h-48 items-center justify-center p-3 sm:p-5">
                <img src={preview} alt="Selected receipt preview" className="block max-h-full max-w-full object-contain" />
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              For best results, make sure the receipt is well lit and all text is visible.
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || isUsageLoading || !usage || usage.remaining === 0}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-violet-600 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {isUploading ? (
              <>
                <LuLoaderCircle size={20} className="animate-spin" />
                Uploading and scanning securely...
              </>
            ) : (
              <>
                <LuCloudUpload size={20} />
                {usage?.remaining === 0 ? "Monthly scan limit reached" : "Upload & scan receipt"}
              </>
            )}
          </button>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Monthly allowance</p>
            {isUsageLoading ? (
              <p className="mt-3 text-sm text-slate-500">Checking your scan allowance...</p>
            ) : usage ? (
              <>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {usage.premium ? "Unlimited" : `${usage.remaining} scans`}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {usage.premium ? "Your Premium plan includes unlimited receipt scans." : `of ${usage.monthlyLimit} scans remaining this month`}
                </p>
                {!usage.premium && (
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all"
                      style={{ width: `${Math.min(100, (usage.used / usage.monthlyLimit) * 100)}%` }}
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Scan allowance is unavailable right now.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Before you upload</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />Use a clear, in-focus image.</li>
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-500" />Include the merchant, date, and total.</li>
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />Keep the full receipt inside the frame.</li>
            </ul>
            <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
              Scanned details can be checked and corrected on the next screen before saving the expense.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default UploadReceipt;