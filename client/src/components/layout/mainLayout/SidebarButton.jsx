import { NavLink } from "react-router";

const SidebarButton = ({ title, icon, path, end }) => {
  return (
    <>
      <NavLink
        className={({ isActive }) =>
          `group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${isActive ? "bg-violet-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`
        }
        to={path}
        end={end ? true : false}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">{icon}</span>
        <span className="truncate">{title}</span>
      </NavLink>
    </>
  );
};
export default SidebarButton;
