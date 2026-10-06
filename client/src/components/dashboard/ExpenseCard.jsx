import { LuWallet } from "react-icons/lu";

const ExpenseCard = ({ title, total, description, icon, iconBg, iconColor }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{total}</p>
          <p className="mt-2 text-xs font-medium text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
