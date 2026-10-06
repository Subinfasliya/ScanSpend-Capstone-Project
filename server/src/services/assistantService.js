const env = require("../config/env");
const createError = require("../utils/createError");

const createAssistantError = (statusCode, message) => {
  const error = createError(statusCode, message);
  error.safeForClient = true;
  return error;
};

const providerErrorMessage = (status) => {
  if (status === 401 || status === 403) {
    return "The AI provider rejected the server API key. Check that AI_API_KEY is valid and enabled.";
  }
  if (status === 402 || status === 429) {
    return "The AI provider quota or billing limit has been reached. Check provider usage and billing.";
  }
  if (status === 404) {
    return "The AI provider endpoint or model was not found. Check AI_API_URL and AI_MODEL.";
  }
  if (status === 400) {
    return "The AI provider rejected the request. Check that AI_MODEL supports chat completions.";
  }
  return `The AI provider returned HTTP ${status}. Check provider status and server AI settings.`;
};

const askAssistant = async (prompt, ai = env.ai, fetchImpl = fetch) => {
  if (!ai.apiKey || !ai.endpoint || !ai.model) {
    throw createAssistantError(503, "AI assistant is not configured on the server.");
  }

  const baseUrl = ai.endpoint.replace(/\/+$/, "");
  const endpoint = baseUrl.endsWith("/chat/completions")
    ? baseUrl
    : `${baseUrl}/chat/completions`;

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${ai.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ai.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      throw createAssistantError(502, providerErrorMessage(response.status));
    }

    const payload = await response.json();
    const reply = payload.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      throw createAssistantError(502, "The AI provider returned an empty response.");
    }

    return reply.trim();
  } catch (error) {
    if (error.statusCode) throw error;
    throw createAssistantError(502, "Unable to contact the AI provider. Please try again.");
  }
};

module.exports = { askAssistant };