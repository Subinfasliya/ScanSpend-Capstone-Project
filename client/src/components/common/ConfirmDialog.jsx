import { LuCircleAlert, LuLoaderCircle } from "react-icons/lu";
import Modal from "./Modal";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  detail,
  confirmLabel = "Confirm",
  isLoading = false,
  tone = "danger",
}) => {
  const destructive = tone === "danger";

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title={title}>
      <div className="space-y-5">
        <div className={`flex items-start gap-3 rounded-xl border p-4 ${destructive ? "border-rose-100 bg-rose-50" : "border-amber-100 bg-amber-50"}`}>
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ${destructive ? "text-rose-700" : "text-amber-700"}`}><LuCircleAlert size={19} /></span>
          <div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{message}</p>{detail && <p className="mt-1 text-sm leading-5 text-slate-600">{detail}</p>}</div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={isLoading} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:min-w-28">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isLoading} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-60 sm:min-w-36 ${destructive ? "bg-rose-700 hover:bg-rose-800" : "bg-slate-900 hover:bg-slate-800"}`}>
            {isLoading && <LuLoaderCircle size={16} className="animate-spin" />}
            {isLoading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;