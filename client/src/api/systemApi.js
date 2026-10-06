import { apiInstance } from "./apiInstance";

export const systemApi = {
  async health() {
    try {
      const status = await apiInstance.get("/health");
      return { ...status, httpHealthy: true };
    } catch (error) {
      return { status: "error", api: "Unavailable", message: error.message, httpHealthy: false };
    }
  },
};
