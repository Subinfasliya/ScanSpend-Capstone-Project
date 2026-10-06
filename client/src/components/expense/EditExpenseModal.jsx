import { useEffect, useState } from "react";
import InputField from "../common/InputField";
import Dropdown from "../common/Dropdown";
import { useExpenseStore } from "../../store/expenseStore";
import { toast } from "react-toastify";
import ExpenseForm from "../common/ExpenseForm";
import { validateExpense } from "../../validation/validateExpense";
import { validateExpenseField } from "../../validation/validateField";

const categoryOptions = [
  { value: "medicines", label: "Medicines" },
  { value: "food", label: "Food" },
  { value: "grocery", label: "Grocery" },
  { value: "personalCare", label: "Personal Care" },
  { value: "travel", label: "Travel" },
  { value: "others", label: "Others" },
];

const EditExpenseModal = ({ expense, onClose }) => {
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    merchant: "",
    date: "",
    time: "",
    amount: "",
    category: "",
  });

  useEffect(() => {
    if (expense) {
      setFormData(expense);
    }
  }, [expense]);

  const handleFieldChange = async (field, value) => {

    const updatedForm = {
      ...formData,
      [field]: value,
    };

    setFormData(updatedForm);

    const error = await validateExpenseField(field, value, updatedForm);

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const result = await validateExpense(formData);

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    try {
      const savedExpense = await updateExpense(formData);
      toast.success("Successfully Updated Expense");
      if (savedExpense.budgetAlert) toast.warning(savedExpense.budgetAlert.message);
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleEditSubmit}>
          {/* Expense Form */}
          <ExpenseForm
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            categoryOptions={categoryOptions}
          />

          <div className="flex justify-between">
            <button
              className="border px-3 py-2 rounded-lg cursor-pointer font-semibold hover:bg-gray-500 hover:border-white hover:text-white "
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border px-3 py-2 rounded-lg cursor-pointer font-semibold hover:bg-[#7C3AED] hover:border-white hover:text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
export default EditExpenseModal;
