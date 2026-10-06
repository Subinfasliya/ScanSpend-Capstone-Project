import { useId } from "react";
import { LuX } from "react-icons/lu";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

const Modal = ({ isOpen, onClose, title, children }) => {
  const titleId = useId();
  useEscapeKey(isOpen, onClose);
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <h2 id={titleId} className="min-w-0 text-lg font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
            <LuX size={19} />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </section>
    </div>
  );
};
export default Modal;
