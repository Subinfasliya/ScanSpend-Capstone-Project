import { apiInstance } from "./apiInstance";

export const analyticsApi = {
  summary: (from, to) => apiInstance.get("/analytics/summary", { params: { from, to } }),
  insights: () => apiInstance.get("/analytics/insights"),
  export: (format, from, to) => apiInstance.get(
    format === "csv" ? "/analytics/export" : `/analytics/export/${format}`,
    { params: { from, to }, responseType: "blob" },
  ),
  exportCsv: (from, to) => analyticsApi.export("csv", from, to),
  exportExcel: (from, to) => analyticsApi.export("excel", from, to),
  exportPdf: (from, to) => analyticsApi.export("pdf", from, to),
};
