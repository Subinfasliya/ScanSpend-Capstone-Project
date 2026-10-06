import { Outlet } from "react-router";
import receiptIllustration from "../../../assets/images/receipt-illustration.png";

const AuthLayout = () => {
  return (
    <div className="h-dvh overflow-hidden bg-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_25%)] p-2 sm:p-4">
      <div className="mx-auto flex h-full max-w-7xl items-stretch">
        <div className="flex min-h-0 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:rounded-[24px]">
          <aside className="hidden min-h-0 w-1/2 overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 p-5 text-white lg:flex lg:items-center lg:justify-center xl:p-8">
            <div className="w-full max-w-lg">
              <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm xl:mb-6 xl:text-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Smart expense tracker
              </div>

              <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
                Smart Expense Management <span className="text-violet-100">Made Simple</span>
              </h2>

              <p className="mt-3 text-sm text-violet-100/90 xl:mt-4 xl:text-base">
                Scan receipts, track spending, and unlock AI-driven financial clarity in one place.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2 xl:mt-6 xl:gap-3">
                {[
                  { label: "Receipts", value: "24/7" },
                  { label: "Insights", value: "AI" },
                  { label: "Budget", value: "Live" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/15 bg-white/5 p-2 text-center backdrop-blur-sm xl:p-3">
                    <p className="text-base font-bold xl:text-lg">{item.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-violet-100/80 xl:text-xs">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex h-40 justify-center xl:mt-6 xl:h-52">
                <img src={receiptIllustration} alt="Expense tracking dashboard" className="h-full w-full rounded-2xl border border-white/15 bg-white/5 p-2 object-contain shadow-2xl xl:p-3" />
              </div>
            </div>
          </aside>

          <main className="flex min-h-0 w-full items-center justify-center overflow-y-auto bg-white px-4 py-3 sm:px-8 sm:py-4 lg:w-1/2 lg:px-8 xl:px-10">
            <div className="my-auto w-full max-w-md py-1 sm:py-2">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;