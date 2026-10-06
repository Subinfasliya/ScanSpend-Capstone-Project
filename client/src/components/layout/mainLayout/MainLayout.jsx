

import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../../../context/AuthContext";
import { useExpenseStore } from "../../../store/expenseStore";
import { toast } from "react-toastify";

const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const loadExpenses = useExpenseStore((state) => state.loadExpenses);
  const clearExpenses = useExpenseStore((state) => state.clearExpenses);

  useEffect(() => {
    clearExpenses();
    loadExpenses().catch((error) => toast.error(error.message));
  }, [user.id, clearExpenses, loadExpenses]);

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside>
        <Sidebar open={open} setOpen={setOpen} />
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">

        {/* Header gets control */}
        <Header setOpen={setOpen} navOpen={open} />

        <main className="p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default MainLayout;