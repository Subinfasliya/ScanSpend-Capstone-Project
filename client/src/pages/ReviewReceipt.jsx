import { useState } from "react";
import { useExpenseStore, useFormStore } from "../store/expenseStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import InputField from "../components/common/InputField";
import Dropdown from "../components/common/Dropdown";
import ExpenseForm from "../components/common/ExpenseForm";
import { expenseSchema } from "../validation/expenseSchema";
import { validateExpense } from "../validation/validateExpense";
import { validateExpenseField } from "../validation/validateField";
import { useCategoryStore } from "../store/categoryStore";
import { receiptsApi } from "../api/receiptsApi";



const ReviewReceipt = () => {
  const [errors, setErrors] = useState({});

  const formData = useFormStore((state) => state.formData);
  const setField = useFormStore((state) => state.setField);
  const resetForm = useFormStore((state) => state.resetForm);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const addSavedExpense = useExpenseStore((state) => state.addSavedExpense);
  const image = useFormStore((state) => state.image);
  const receiptId = useFormStore((state) => state.formData.receiptId);
  const categories = useCategoryStore((state) => state.categories)

  const navigate = useNavigate();

  const hasImage = Boolean(image);


  const handleFieldChange = async (field, value) => {
    setField(field, value);
    const error = await validateExpenseField(
    field,
    value,
    formData
  );

  setErrors((prev) => ({
    ...prev,
    [field]: error,
  }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const result = await validateExpense(formData)

    if(!result.isValid){
      setErrors(result.errors);
      return
    }

    try {
      let savedExpense;
      if (receiptId) {
        savedExpense = await receiptsApi.createExpense(receiptId, formData);
        addSavedExpense(savedExpense);
      } else {
        savedExpense = await addExpense(formData);
      }
      toast.success("Expense Added");
      if (savedExpense.budgetAlert) toast.warning(savedExpense.budgetAlert.message);
      resetForm();
      navigate("/app/expenses");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancel = () => {
    resetForm();
    navigate("/app/upload-receipt");
  };

  return (
    <div className="space-y-6 p-3 sm:p-5 lg:p-6">
      <header className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-600 via-violet-600 to-fuchsia-500 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">Expense entry</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{hasImage ? "Review Receipt" : "Add Expense"}</h1>
        <p className="mt-2 text-sm text-violet-100">
          {hasImage ? "Verify the extracted details before saving this expense." : "Create a new expense manually with all the details you need."}
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className={`grid gap-6 ${hasImage ? "xl:grid-cols-2" : "lg:grid-cols-[minmax(0,1fr)]"}`}>
          {hasImage && (
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Receipt preview</h3>
              <div className="flex h-[min(65vh,520px)] min-h-[280px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-3 sm:p-5">
                <img src={image} alt="Receipt preview" className="block max-h-full max-w-full rounded-lg object-contain" />
              </div>
            </div>
          )}

          <div className={`${!hasImage ? "mx-auto w-full max-w-3xl" : ""}`}>
            <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 sm:p-5">
              <h3 className="text-xl font-semibold text-slate-900">
                {hasImage ? "Extracted details" : "Expense details"}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{hasImage ? "Correct the detected merchant, date, and total before saving." : "Check each field before saving."}</p>

              <form onSubmit={handleFormSubmit} className="mt-5">
                <ExpenseForm
                  formData={formData}
                  errors={errors}
                  onChange={handleFieldChange}
                  categoryOptions={categories}
                />

                {hasImage && (
                  <details className="mt-5 rounded-lg border border-slate-200 bg-white">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800 marker:text-violet-700">
                      View or correct scanned receipt text
                    </summary>
                    <div className="border-t border-slate-200 p-3 sm:p-4">
                      <label htmlFor="receipt-raw-text" className="mb-2 block text-xs font-medium text-slate-600">
                        OCR source text
                      </label>
                      <textarea
                        id="receipt-raw-text"
                        name="rawText"
                        rows={8}
                        maxLength={50000}
                        value={formData.rawText || ""}
                        onChange={(event) => setField("rawText", event.target.value)}
                        className="w-full resize-y rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs leading-5 text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      />
                      <p className="mt-2 text-xs text-slate-500">Edits are saved with this receipt. You can still change any expense field above.</p>
                    </div>
                  </details>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReviewReceipt;
