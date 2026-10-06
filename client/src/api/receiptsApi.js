import { apiInstance } from "./apiInstance";
import { toFrontendExpense } from "./expenseMapper";

export const receiptsApi = {
  usage: () => apiInstance.get("/receipts/usage"),
  upload: (file) => {
    const formData = new FormData();
    formData.append("receipt", file);
    return apiInstance.post("/receipts", formData);
  },
  async createExpense(receiptId, expense) {
    const saved = await apiInstance.post(`/receipts/${receiptId}/expense`, {
      merchant: expense.merchant,
      amount: Number(expense.amount),
      category: expense.category,
      expenseDate: new Date(`${expense.date}T${expense.time || "12:00"}`).toISOString(),
      rawText: expense.rawText,
    });
    return toFrontendExpense(saved);
  },
  list: () => apiInstance.get("/receipts"),
  remove: (id) => apiInstance.delete(`/receipts/${id}`),
};
