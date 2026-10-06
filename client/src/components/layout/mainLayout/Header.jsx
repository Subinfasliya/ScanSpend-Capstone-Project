import { Link, useMatches, useNavigate } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuLogOut, LuMenu, LuSettings, LuX } from "react-icons/lu";
import Modal from "../../common/Modal";
import LogoutModal from "../../common/LogoutModal";
import { toast } from "react-toastify";

const Header = ({ setOpen, navOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const accountMenuRef = useRef(null);
  const navigate = useNavigate();
  const matches = useMatches();
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "My account";
  const title = matches[matches.length - 1]?.handle?.title || "ScanSpend";
  const subtitle = matches[matches.length - 1]?.handle?.subtitle || "";

  useEffect(() => {
    if (!dropdownOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setDropdownOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutOpen(false);
      setDropdownOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6">
        <div className="flex min-h-[72px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur sm:min-h-[80px] sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={navOpen}
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 md:hidden"
          >
            {navOpen ? <LuX size={21} /> : <LuMenu size={21} />}
          </button>

            <div className="min-w-0">
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-700 sm:block">ScanSpend workspace</p>
              <h1 className="truncate text-base font-bold leading-tight text-slate-900 sm:mt-0.5 sm:text-xl">{title}</h1>
              {subtitle && <p className="mt-1 hidden max-w-[50vw] truncate text-xs text-slate-500 sm:block sm:text-sm">{subtitle === "Welcome Back" ? `${subtitle}, ${displayName}` : subtitle}</p>}
            </div>
          </div>

          <div className="relative shrink-0" ref={accountMenuRef}>
          <button
            type="button"
            aria-label={`Account menu for ${displayName}`}
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex min-h-11 max-w-[48vw] items-center gap-2 rounded-lg border border-transparent py-1 pl-1 pr-2 transition hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:gap-2.5 sm:pl-2 sm:pr-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800 sm:h-10 sm:w-10">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-36 truncate text-sm font-semibold text-slate-800">{displayName}</span>
              <span className="block text-xs text-slate-500">Account</span>
            </span>
            <LuChevronDown className={`hidden shrink-0 text-slate-500 transition-transform sm:block ${dropdownOpen ? "rotate-180" : ""}`} size={16} />
          </button>

          {dropdownOpen && (
            <div role="menu" className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-60 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2.5 sm:hidden">
                <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <Link
                to="/app/settings"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
                className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <LuSettings size={17} className="text-slate-500" />Settings
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); setIsLogoutOpen(true); }}
                className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <LuLogOut size={17} />Log out
              </button>
            </div>
          )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        title="Confirm Logout"
      >
        <LogoutModal
          onClose={() => setIsLogoutOpen(false)}
          onLogout={handleLogout}
          isLoading={isLoggingOut}
        />
      </Modal>
    </>
  );
};

export default Header;
