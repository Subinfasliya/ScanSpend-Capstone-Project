import { create } from "zustand";
import { defaultCategories } from "../constants/defaultCategories";
import {
  normalizeCategory,
  toTitleCase,
} from "../utils/category/categoryUtils";
import { loadCategories, saveCategories } from "../storage/storage";

export const useCategoryStore = create((set, get) => ({
  categories: loadCategories(),

  addCategory: (name) => {
    const normalized = normalizeCategory(name);

    if (!normalized) {
      return {
        success: false,
        message: "Category cannot be empty",
      };
    }

    const exists = get().categories.some(
      (category) => category.value === normalized,
    );

    if (exists) {
      return {
        success: false,
        message: "Category already exists",
      };
    }

    const newCategory = {
      id: crypto.randomUUID(),
      value: normalized,
      label: toTitleCase(name),
    };

    const updatedCategories = [...get().categories, newCategory];

    saveCategories(updatedCategories);

    set((state) => ({
      categories: [...state.categories, newCategory],
    }));

    return {
      success: true,
      message: "Category Added",
      category: newCategory,
    };
  },


}));
