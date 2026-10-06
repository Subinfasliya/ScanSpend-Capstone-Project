import React, { useState } from "react";
import InputField from "./InputField";
import Dropdown from "./Dropdown";
import { useCategoryStore } from "../../store/categoryStore";
import { LuPlus } from "react-icons/lu";
import Modal from "./Modal";
import AddCategoryModal from "../categoryModal/AddCategoryModal";

const ExpenseForm = ({ formData, onChange, categoryOptions, errors }) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const categories = useCategoryStore((state) => state.categories);

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <InputField
        label="Merchant Name"
        name="merchant"
        error={errors.merchant}
        value={formData.merchant}
        onChange={(e) => onChange("merchant", e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          type="date"
          label="Date"
          name="date"
          error={errors.date}
          value={formData.date}
          onChange={(e) => onChange("date", e.target.value)}
        />

        <InputField
          type="time"
          label="Time"
          name="time"
          error={errors.time}
          value={formData.time}
          onChange={(e) => onChange("time", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Category</label>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Dropdown
              options={categories}
              value={formData.category}
              error={errors.category}
              onChange={(value) => onChange("category", value)}
            />
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-700 transition hover:bg-violet-100"
            onClick={() => setIsCategoryModalOpen(true)}
            aria-label="Add category"
            title="Add category"
          >
            <LuPlus size={18} />
          </button>
        </div>
        {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
      </div>

      <InputField
        label="Total Amount"
        type="number"
        name="amount"
        error={errors.amount}
        value={formData.amount}
        onChange={(e) => onChange("amount", Number(e.target.value))}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          name="notes"
          rows={4}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          placeholder="Add a note about this expense..."
          value={formData.note}
          onChange={(e) => onChange("note", e.target.value)}
        />
      </div>

      <Modal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} title="Add New Category">
        <AddCategoryModal
          onClose={closeCategoryModal}
          onCategoryAdded={(categoryValue) => {
            onChange("category", categoryValue);
          }}
        />
      </Modal>
    </div>
  );
};

export default ExpenseForm;
