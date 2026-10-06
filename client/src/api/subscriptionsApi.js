import { apiInstance, onAccessTokenChange } from "./apiInstance";

let statusCache = null;
let statusCacheAt = 0;
let statusRequest = null;
let statusRequestId = 0;

const clearStatusCache = () => {
  statusCache = null;
  statusCacheAt = 0;
  statusRequest = null;
  statusRequestId += 1;
};

onAccessTokenChange(clearStatusCache);

export const subscriptionsApi = {
  get: ({ force = false } = {}) => {
    if (force) clearStatusCache();
    const cachedExpiry = Date.parse(statusCache?.subscription?.expiresAt || "");
    if (statusCache?.premium && Number.isFinite(cachedExpiry) && cachedExpiry <= Date.now()) {
      clearStatusCache();
    }
    if (statusCache && Date.now() - statusCacheAt < 30000) return Promise.resolve(statusCache);
    if (statusRequest) return statusRequest;

    const requestId = statusRequestId;
    const request = apiInstance.get("/subscriptions")
      .then((status) => {
        if (requestId === statusRequestId) {
          statusCache = status;
          statusCacheAt = Date.now();
        }
        return status;
      })
      .finally(() => {
        if (statusRequest === request) statusRequest = null;
      });
    statusRequest = request;
    return request;
  },
  history: (page = 1, limit = 20) => apiInstance.get("/subscriptions/history", { params: { page, limit } }),
  checkout: (plan) => apiInstance.post("/subscriptions/checkout", { plan }),
  cancel: () => apiInstance.post("/subscriptions/cancel"),
  verifyPayment: (payment) => apiInstance.post("/subscriptions/verify-payment", payment),
};
