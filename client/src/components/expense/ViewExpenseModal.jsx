import { LuCalendarDays, LuClock3, LuReceipt, LuTag } from "react-icons/lu";

const DetailItem = ({ label, children }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <div className="font-medium text-gray-800">{children}</div>
  </div>
);

const ViewExpenseModal = ({ expense, onClose }) => {
  if (!expense) return null;

  return (
    <div className="space-y-6">
      {/* Merchant */}
      <div className="border rounded-xl p-4 bg-violet-50">
        <p className="text-sm text-gray-500">Merchant</p>

        <h2 className="text-2xl font-bold text-gray-800 mt-1">
          {expense.merchant}
        </h2>

        <p className="text-3xl font-bold text-violet-600 mt-4">
          ₹
          {Number(expense.amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4">
        <DetailItem label="Date">
          <div className="flex items-center gap-2">
            <LuCalendarDays className="text-violet-600" />
            {expense.date}
          </div>
        </DetailItem>

        <DetailItem label="Time">
          <div className="flex items-center gap-2">
            <LuClock3 className="text-violet-600" />
            {expense.time || "--"}
          </div>
        </DetailItem>

        <DetailItem label="Category">
          <div className="flex items-center gap-2">
            <LuTag className="text-violet-600" />
            <span className="capitalize">{expense.category}</span>
          </div>
        </DetailItem>

        <DetailItem label="Receipt">
          <div className="flex items-center gap-2">
            <LuReceipt className="text-violet-600" />
            {expense.receipt ? "Available" : "Not Available"}
          </div>
        </DetailItem>
      </div>

      {/* Notes */}
      <div>
        <p className="text-sm text-gray-500 mb-2">Notes</p>

        <div className="border rounded-xl p-4 bg-gray-50 min-h-24 whitespace-pre-wrap">
          {expense.note?.trim() ? expense.note : "No notes added."}
        </div>
      </div>

      {/* Receipt Preview */}
      {expense.receipt && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Receipt</p>

          <img
            src={expense.receipt}
            alt="Receipt"
            className="rounded-xl border max-h-72 object-contain w-full"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewExpenseModal;
