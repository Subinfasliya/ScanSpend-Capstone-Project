import { useState } from "react";
import { FaChartBar, FaFileAlt, FaHome, FaReceipt, FaRegCalendarAlt, FaWallet } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { LuShieldCheck } from "react-icons/lu";
import SidebarButton from "./SidebarButton";
import { Link } from "react-router";
import { useAuth } from "../../../context/AuthContext";

const workspaceLinks = [
  {
    title: "Dashboard",
    icon: <FaHome size={17} />,
    path: "/app",
    end: true,
  },
  {
    title: "Expenses",
    icon: <FaReceipt size={16} />,
    path: "/app/expenses",
  },
  {
    title: "Budgets",
    icon: <FaWallet size={17} />,
    path: "/app/budgets",
  },
  {
    title: "Recurring expenses",
    icon: <FaRegCalendarAlt size={17} />,
    path: "/app/recurring-expenses",
  },
  {
    title: "Analytics",
    icon: <FaChartBar size={17} />,
    path: "/app/analytics",
  },
  {
    title: "Receipts",
    icon: <FaFileAlt size={17} />,
    path: "/app/receipts",
  },
];

const Sidebar = ({ open, setOpen }) => {
  const { user } = useAuth();
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] md:hidden"
        />
      )}

      <div
        className={`
          fixed left-0 top-0 z-50 h-dvh w-[min(18rem,88vw)] overflow-y-auto border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:translate-x-0 md:shadow-none
        `}
      >
        <div className="flex min-h-full flex-col px-4 py-5 sm:px-5">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/app" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500" aria-label="ScanSpend home">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-700 p-1.5">
                <img src="/Receipt-Logo-transparent.png" alt="" className="h-full w-full object-contain" />
              </span>
              <span className="min-w-0"><span className="block truncate text-lg font-bold leading-tight text-slate-900">ScanSpend</span><span className="mt-0.5 block text-xs text-slate-500">Personal finance</span></span>
            </Link>

            <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 md:hidden">
              <IoClose size={21} />
            </button>
          </div>

          <nav aria-label="Main navigation" className="flex-1">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
            <div className="space-y-1">
              {workspaceLinks.map((button) => (
                <div key={button.title} onClick={() => setOpen(false)}>
                  <SidebarButton {...button} />
                </div>
              ))}
            </div>

            {user.role === "admin" && <div className="mt-7">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Administration</p>
              <div onClick={() => setOpen(false)}>
                <SidebarButton title="Admin" icon={<LuShieldCheck size={18} />} path="/app/admin" />
              </div>
            </div>}
          </nav>

          <div className="mt-7 rounded-xl border border-violet-100 bg-violet-50 p-4">
            <div className="flex items-center gap-2 text-violet-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white"><LuShieldCheck size={17} /></span>
              <p className="text-sm font-semibold">More financial clarity</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">Unlock advanced reports and a longer receipt history.</p>
            <Link to="/app/premium" onClick={() => setOpen(false)} className="mt-3 flex min-h-9 items-center justify-center rounded-lg bg-violet-700 px-3 text-sm font-semibold text-white transition hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">View Premium</Link>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="truncate px-2 text-xs font-medium text-slate-500">Signed in as</p>
            <p className="mt-1 truncate px-2 text-sm font-semibold text-slate-800">{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
