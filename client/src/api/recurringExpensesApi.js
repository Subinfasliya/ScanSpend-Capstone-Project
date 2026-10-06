import { apiInstance } from "./apiInstance";

export const recurringExpensesApi = {
  async list() {
    return (await apiInstance.get("/recurring-expenses")).map((item) => ({ ...item, id: item._id || item.id }));
  },
  create: (item) => apiInstance.post("/recurring-expenses", item),
  setActive: (id, active) => apiInstance.patch(`/recurring-expenses/${id}`, { active }),
  remove: (id) => apiInstance.delete(`/recurring-expenses/${id}`),
};
