import { apiInstance, refreshSession } from "./apiInstance";

export const authApi = {
  login: (credentials) => apiInstance.post("/auth/login", credentials),
  async register(details) {
    await apiInstance.post("/auth/register", details);
    return refreshSession();
  },
  me: () => apiInstance.get("/auth/me"),
  logout: () => apiInstance.post("/auth/logout"),
  logoutAll: () => apiInstance.post("/auth/logout-all"),
  forgotPassword: (email) => apiInstance.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => apiInstance.post("/auth/reset-password", { token, password }),
  changePassword: (currentPassword, newPassword) => apiInstance.post("/auth/change-password", { currentPassword, newPassword }),
  verifyEmail: (token) => apiInstance.get(`/auth/verify-email/${encodeURIComponent(token)}`),
  resendVerification: (email) => apiInstance.post("/auth/resend-verification", { email }),
};
