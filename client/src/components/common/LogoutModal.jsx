import { LuLoaderCircle, LuLogOut } from "react-icons/lu";

const LogoutModal = ({ onClose, onLogout, isLoading = false }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 rounded-xl border border-rose-100 bg-rose-50 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-rose-700"><LuLogOut size={21} /></span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">End this session?</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">You will need to sign in again to access your account.</p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:min-w-28"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-36"
        >
          {isLoading ? (
            <>
              <LuLoaderCircle className="animate-spin" size={17} />Signing out...
            </>
          ) : (
            <>
              <LuLogOut size={18} />
              Sign out
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LogoutModal;