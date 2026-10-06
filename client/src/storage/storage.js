import { defaultCategories } from "../constants/defaultCategories";

// Expense storage
export const loadExpenses = () => {
  return JSON.parse(localStorage.getItem("expenses")) || [];
};

export const saveExpenses = (expenses) => {
    localStorage.setItem("expenses", JSON.stringify(expenses))
}

// Category Storage
export const loadCategories = () =>
  JSON.parse(localStorage.getItem("categories")) ?? defaultCategories;

export const saveCategories = (categories) =>
  localStorage.setItem("categories", JSON.stringify(categories));