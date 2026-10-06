import { create } from "zustand";
import { expensesApi } from "../api/expensesApi";

// Add Expense Form Store

export const useFormStore = create((set) => ({
  image: null,
  formData: {
    date: "",
    time: "",
    merchant: "",
    category: "",
    amount: "",
    note: "",
    rawText: "",
    receiptId: null,
  },

  // for Image
  setImage: (image) => set({ image }),

  // for manual entry
  setField: (field, value) =>
    set((state) => ({ formData: { ...state.formData, [field]: value } })),

  // OCR or bulk data load cheyyan
  setFormData: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    })),

  //   for clear form
  resetForm: () =>
    set({
      image: null,
      formData: {
        date: "",
        time: "",
        merchant: "",
        category: "",
        amount: "",
        note: "",
        rawText: "",
        receiptId: null,
      },
    }),
}));

// Expense Store

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  isLoading: false,
  loadExpenses: async () => {
    set({ isLoading: true });
    try {
      const expenses = await expensesApi.list();
      set({ expenses });
      return expenses;
    } finally {
      set({ isLoading: false });
    }
  },
  clearExpenses: () => set({ expenses: [], isLoading: false }),

  // Create

  addExpense: async (expense) => {
    const newExpense = await expensesApi.create(expense);
    set((state) => ({ expenses: [...state.expenses, newExpense] }));
    return newExpense;
  },
  addSavedExpense: (expense) => set((state) => ({
    expenses: [...state.expenses, expense],
  })),

  // Read

  getExpenseById: (id) => {
    return get().expenses.filter((expense) => expense.id === id);
  },

  // Update

  updateExpense: async (updatedData) => {
    const savedExpense = await expensesApi.update(updatedData);
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === savedExpense.id ? savedExpense : expense,
      ),
    }));
    return savedExpense;
  },

  // Delete

  deleteExpense: async (expenseId) => {
    await expensesApi.remove(expenseId);
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== expenseId),
    }));
  },
}));
