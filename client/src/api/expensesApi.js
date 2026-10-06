import { apiInstance } from "./apiInstance";
import { toBackendExpense, toFrontendExpense } from "./expenseMapper";

export const expensesApi = {
  async list() {
    const expenses = [];
    let page = 1;
    let pages = 1;
    while (page <= pages) {
      const result = await apiInstance.get("/expenses", { params: { page, limit: 100 } });
      expenses.push(...result.items.map(toFrontendExpense));
      pages = result.pages;
      page += 1;
    }
    return expenses;
  },
  async create(expense) {
    return toFrontendExpense(await apiInstance.post("/expenses", toBackendExpense(expense)));
  },
  async update(expense) {
    return toFrontendExpense(await apiInstance.patch(`/expenses/${expense.id}`, toBackendExpense(expense)));
  },
  remove: (id) => apiInstance.delete(`/expenses/${id}`),
};
