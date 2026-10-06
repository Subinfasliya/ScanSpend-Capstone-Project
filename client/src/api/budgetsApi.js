import { apiInstance } from "./apiInstance";

export const budgetsApi = {
  list: (year, month) => apiInstance.get("/budgets", { params: { year, month } }),
  save: (budget) => apiInstance.put("/budgets", budget),
  remove: ({ category, year, month }) => apiInstance.delete("/budgets", { data: { category, year, month } }),
};
