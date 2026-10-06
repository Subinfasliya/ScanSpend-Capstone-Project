import { BiPencil, BiTrash } from "react-icons/bi";
import { FaEye } from "react-icons/fa";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const ExpenseRow = ({ expense, onView, onEdit, onDelete }) => {
  return (
    <tr className="border-b border-slate-200 bg-white transition-colors hover:bg-slate-50">
      <td className="px-4 py-4 text-sm text-slate-700">{expense.date}</td>
      <td className="px-4 py-4 text-sm font-medium text-slate-900">{expense.merchant}</td>
      <td className="px-4 py-4 text-sm text-slate-700">{expense.category || "Uncategorized"}</td>
      <td className="px-4 py-4 text-sm font-semibold text-slate-900">{formatMoney(expense.amount)}</td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <button type="button" aria-label="View expense" title="View expense" onClick={() => onView(expense)} className="rounded-md border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100 hover:text-blue-700">
            <FaEye size={16} />
          </button>
          <button type="button" aria-label="Edit expense" title="Edit expense" onClick={() => onEdit(expense)} className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100 hover:text-amber-700">
            <BiPencil size={16} />
          </button>
          <button type="button" aria-label="Delete expense" title="Delete expense" onClick={() => onDelete(expense.id)} className="rounded-md border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700">
            <BiTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
export default ExpenseRow;
