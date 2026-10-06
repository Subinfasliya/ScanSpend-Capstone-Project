import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
export const apiInstance = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

let accessToken = sessionStorage.getItem("accessToken");
let refreshRequest = null;
const tokenChangeListeners = new Set();

export const onAccessTokenChange = (listener) => {
  tokenChangeListeners.add(listener);
  return () => tokenChangeListeners.delete(listener);
};

export const setAccessToken = (token) => {
  const nextToken = token || null;
  if (nextToken === accessToken) return;
  accessToken = nextToken;
  if (accessToken) sessionStorage.setItem("accessToken", accessToken);
  else sessionStorage.removeItem("accessToken");
  tokenChangeListeners.forEach((listener) => listener());
};

const createApiError = (message, status, details) => {
  const error = new Error(message || "The request could not be completed");
  error.status = status;
  error.details = details;
  return error;
};

const isPublicAuthRequest = (url = "") => {
  const path = url.split("?")[0];
  return [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/resend-verification",
  ].includes(path) || path.startsWith("/auth/verify-email/");
};

const getErrorBody = async (error) => {
  const body = error.response?.data;
  if (typeof Blob !== "undefined" && body instanceof Blob) {
    try {
      return JSON.parse(await body.text());
    } catch {
      return {};
    }
  }
  return body || {};
};

export const refreshSession = () => {
  if (!refreshRequest) {
    refreshRequest = apiInstance.post("/auth/refresh", null, { skipAuthRefresh: true })
      .then((data) => {
        setAccessToken(data.accessToken);
        return data;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
};

apiInstance.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (typeof config.data === "string" && config.data && !(typeof FormData !== "undefined" && config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

apiInstance.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") return response.data;
    const body = response.data;
    if (body?.success === false) {
      throw createApiError(body.message || body.error?.message, response.status, body.errors);
    }
    return body?.success === true ? body.data : body;
  },
  async (error) => {
    const config = error.config;
    if (error.response?.status === 401 && config && !config._retry && !config.skipAuthRefresh && !isPublicAuthRequest(config.url)) {
      config._retry = true;
      try {
        await refreshSession();
        return apiInstance.request(config);
      } catch {
        setAccessToken(null);
        throw new Error("Your session has expired. Please sign in again.");
      }
    }

    const body = await getErrorBody(error);
    const message = body.message || (typeof body.error === "string" ? body.error : body.error?.message) || error.message;
    throw createApiError(message, error.response?.status, body.errors);
  },
);

export const apiRequest = (path, options = {}, canRefresh = true) => {
  const { body, ...requestOptions } = options;
  return apiInstance.request({ ...requestOptions, url: path, data: body, skipAuthRefresh: !canRefresh });
};
