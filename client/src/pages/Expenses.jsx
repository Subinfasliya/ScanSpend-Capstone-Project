import { useEffect, useMemo, useState } from "react";
import Dropdown from "../components/common/Dropdown";
import SearchInput from "../components/common/SearchInput";
import { filterExpenses } from "../utils/expensesUtils/filterExpenses";
import { useExpenseStore } from "../store/expenseStore";
import { FaEye } from "react-icons/fa";
import { BiPencil, BiTrash } from "react-icons/bi";
import ExpenseRow from "../components/common/ExpenseRow";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import EditExpenseModal from "../components/expense/EditExpenseModal";
import Modal from "../components/common/Modal";
import { useCategoryStore } from "../store/categoryStore";
import { usePremiumStatus } from "../hooks/usePremiumStatus";
import ViewExpenseModal from "../components/expense/ViewExpenseModal";
import { ExpenseRowsSkeleton } from "../components/common/LoadingSkeleton";

const Expenses = () => {
  const { user } = useAuth();

  const allExpenses = useExpenseStore((state) => state.expenses);
  const isLoading = useExpenseStore((state) => state.isLoading);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const categories = useCategoryStore((state) => state.categories);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    dateRange: "",
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const { premium: hasPremium } = usePremiumStatus();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filteredExpenses = useMemo(() => {
    return filterExpenses({
      expenses: allExpenses,
      userId: user.id,
      search: filters.search,
      dateRange: filters.dateRange,
      category: filters.category,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      fromDate: hasPremium ? filters.fromDate : "",
      toDate: hasPremium ? filters.toDate : "",
    });
  }, [
    allExpenses,
    user.id,
    filters.search,
    filters.category,
    filters.dateRange,
    filters.minAmount,
    filters.maxAmount,
    filters.fromDate,
    filters.toDate,
    hasPremium,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const pageExpenses = filteredExpenses.slice((activePage - 1) * pageSize, activePage * pageSize);
  const firstVisibleExpense = filteredExpenses.length ? (activePage - 1) * pageSize + 1 : 0;
  const lastVisibleExpense = Math.min(activePage * pageSize, filteredExpenses.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const expenseStats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const highest = filteredExpenses.reduce((max, expense) => Number(expense.amount || 0) > Number(max.amount || 0) ? expense : max, { amount: 0 });
    const topCategory = filteredExpenses.reduce((map, expense) => {
      const key = expense.category || "Uncategorized";
      map[key] = (map[key] || 0) + Number(expense.amount || 0);
      return map;
    }, {});
    const categoryName = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    return {
      total,
      count: filteredExpenses.length,
      highest: highest.amount || 0,
      categoryName,
    };
  }, [filteredExpenses]);

  const PRESETS = [
    { value: "", label: "All Dates" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
  ];

  const formatMoney = (value) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setIsViewOpen(true);
  };

  const editExpense = (expense) => {
    setSelectedExpense(expense);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      toast.success("Expense Deleted Successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeViewModal = () => {
    setSelectedExpense(null);
    setIsViewOpen(false);
  };

  return (
    <div className="space-y-6 p-3 sm:p-5 lg:p-6">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Overview</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Expenses</h2>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Total</p>
            <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">{formatMoney(expenseStats.total)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Transactions", value: expenseStats.count.toString(), tone: "bg-white/8" },
            { label: "Largest spend", value: formatMoney(expenseStats.highest), tone: "bg-emerald-500/15" },
            { label: "Top category", value: expenseStats.categoryName, tone: "bg-blue-500/15" },
            { label: "Average", value: formatMoney(expenseStats.count ? expenseStats.total / expenseStats.count : 0), tone: "bg-amber-500/15" },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl border border-white/10 ${item.tone} p-4`}>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-300">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          <button
            type="button"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
            onClick={() => setFilters({ search: "", category: "", dateRange: "", minAmount: "", maxAmount: "", fromDate: "", toDate: "" })}
          >
            Reset
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SearchInput
              placeholder="Search expenses or merchants..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <div>
            <Dropdown
              options={PRESETS}
              value={filters.dateRange}
              onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
              placeholder="Date Range"
            />
          </div>

          <div className="xl:col-span-3">
            <Dropdown
              options={categories}
              value={filters.category}
              onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
              placeholder="Category"
            />
          </div>
        </div>

        {hasPremium && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">Minimum amount</span>
              <input type="number" min="0" step="0.01" value={filters.minAmount || ""} onChange={(event) => setFilters((prev) => ({ ...prev, minAmount: event.target.value }))} className="block w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">Maximum amount</span>
              <input type="number" min="0" step="0.01" value={filters.maxAmount || ""} onChange={(event) => setFilters((prev) => ({ ...prev, maxAmount: event.target.value }))} className="block w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">From date</span>
              <input type="date" value={filters.fromDate || ""} max={filters.toDate || undefined} onChange={(event) => setFilters((prev) => ({ ...prev, fromDate: event.target.value }))} className="block w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block">To date</span>
              <input type="date" value={filters.toDate || ""} min={filters.fromDate || undefined} onChange={(event) => setFilters((prev) => ({ ...prev, toDate: event.target.value }))} className="block w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">All Expenses</h3>
            <p className="text-sm text-slate-500">{filteredExpenses.length} item{filteredExpenses.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="hidden min-w-[760px] w-full text-left text-sm md:table">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Merchant</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <ExpenseRowsSkeleton />
              ) : (
                pageExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onView={handleView}
                    onEdit={editExpense}
                    onDelete={handleDelete}
                  />
                ))
              )}
              {!isLoading && filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-sm text-slate-500">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-3 md:hidden">
          {isLoading ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
                <div className="mb-2 h-5 w-2/3 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
              </div>
            ))
          ) : pageExpenses.length ? (
            pageExpenses.map((expense) => (
              <div key={expense.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{expense.date}</p>
                    <h4 className="mt-1 text-base font-semibold text-slate-900">{expense.merchant}</h4>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{expense.category || "Uncategorized"}</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-lg font-bold text-slate-900">{formatMoney(expense.amount)}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="View expense" onClick={() => handleView(expense)} className="rounded-md border border-blue-200 bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"> <FaEye size={16} /> </button>
                    <button type="button" aria-label="Edit expense" onClick={() => editExpense(expense)} className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"> <BiPencil size={16} /> </button>
                    <button type="button" aria-label="Delete expense" onClick={() => handleDelete(expense.id)} className="rounded-md border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"> <BiTrash size={16} /> </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              No expenses found.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{firstVisibleExpense}-{lastVisibleExpense}</span> of <span className="font-semibold text-slate-700">{filteredExpenses.length}</span> expenses
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              Rows per page
              <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
                {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <span className="text-xs text-slate-500">Page {activePage} of {totalPages}</span>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous expense page" disabled={activePage <= 1 || isLoading} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <button type="button" aria-label="Next expense page" disabled={activePage >= totalPages || isLoading} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      </section>

      <Modal isOpen={isEditOpen} onClose={closeEditModal} title="Edit Expense">
        {selectedExpense && <EditExpenseModal expense={selectedExpense} onClose={closeEditModal} />}
      </Modal>

      <Modal isOpen={isViewOpen} onClose={closeViewModal} title="Expense Details">
        {selectedExpense && <ViewExpenseModal expense={selectedExpense} onClose={closeViewModal} />}
      </Modal>
    </div>
  );
};
export default Expenses;
