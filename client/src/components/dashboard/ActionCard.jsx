import { Link } from "react-router";

const ActionCard = ({ icon, title, description, onClick, bgColor, iconBg }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${bgColor} w-full rounded-2xl border border-slate-200 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300`}
    >
      <div className="flex items-center gap-4">
        <div className={`${iconBg} flex h-12 w-12 items-center justify-center rounded-2xl border border-current/10`}>{icon}</div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-700">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default ActionCard;
