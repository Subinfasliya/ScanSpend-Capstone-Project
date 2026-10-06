import { useState } from "react";
import { useCategoryStore } from "../../store/categoryStore";
import InputField from "../common/InputField";
import { toast } from "react-toastify";

const AddCategoryModal = ({ onClose, onCategoryAdded }) => {
  const [category, setCategory] = useState("");
  const addCategory = useCategoryStore((state) => state.addCategory);

const handleAddNewCategory = () => {
  const value = category.trim();

  if (!value) {
    toast.error("Category is required");
    return;
  }

  const result = addCategory(value);

  if (!result.success) {
    toast.error(result.message);
    return;
  }

  toast.success(result.message);

  onCategoryAdded(result.category.value);

  setCategory("");

  onClose();
};

  return (
    <>
      <InputField
        type="text"
        label="Category"
        name="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <div className="flex justify-between">
        <button
          className="border px-3 py-2 rounded-lg cursor-pointer font-semibold hover:bg-gray-500 hover:border-white hover:text-white "
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          onClick={handleAddNewCategory}
          className="border px-3 py-2 rounded-lg cursor-pointer font-semibold hover:bg-[#7C3AED] hover:border-white hover:text-white"
        >
          Save
        </button>
      </div>
    </>
  );
};

export default AddCategoryModal;
