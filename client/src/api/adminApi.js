import { apiInstance } from "./apiInstance";

export const adminApi = {
  async users() {
    return (await apiInstance.get("/admin/users")).users;
  },
  updateUserStatus: (userId, isActive) => apiInstance.patch(`/admin/users/${userId}/status`, { isActive }),
  stats: () => apiInstance.get("/admin/stats"),
  subscriptions: (page = 1, limit = 25) => apiInstance.get("/admin/subscriptions", { params: { page, limit } }),
  settings: () => apiInstance.get("/admin/settings"),
  updateSettings: (settings) => apiInstance.patch("/admin/settings", settings),
  auditLogs: (page = 1) => apiInstance.get("/admin/audit-logs", { params: { page, limit: 50 } }),
};
