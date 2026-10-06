import { apiInstance } from "../api/apiInstance";

export const askAssistant = async (prompt) => {
  const result = await apiInstance.post("/ai/chat", { prompt });
  return result.reply;
};