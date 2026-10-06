const env = require("../config/env");

const createFallbackInsights = ({ totals, categories, months }) => {
  const insights = [];
  if (totals.previousPeriod > 0) {
    const change = Math.round(((totals.currentPeriod - totals.previousPeriod) / totals.previousPeriod) * 100);
    insights.push({
      type: "spending-change",
      message: `Spending is ${Math.abs(change)}% ${change >= 0 ? "higher" : "lower"} than the previous period.`,
    });
  }
  const leadingCategory = categories[0];
  if (leadingCategory && totals.currentPeriod > 0) {
    insights.push({
      type: "top-category",
      message: `${leadingCategory.category} is your largest category at ${Math.round((leadingCategory.amount / totals.currentPeriod) * 100)}% of spending.`,
    });
  }
  if (months.length >= 2 && months.at(-1).amount > months.at(-2).amount * 1.5) {
    insights.push({ type: "spending-spike", message: "Your latest month is more than 50% above the preceding month." });
  }
  return insights;
};

const generateInsights = async (data, ai = env.ai, fetchImpl = fetch) => {
  const fallback = () => ({
    source: "statistical",
    insights: createFallbackInsights(data),
  });

  if (!ai.apiKey || !ai.endpoint || !ai.model) return fallback();

  try {
    const response = await fetchImpl(ai.endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${ai.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ai.model,
        messages: [
          { role: "system", content: "Give at most 5 concise, factual personal-finance observations. Return JSON: {\"insights\":[{\"type\":string,\"message\":string}]}. Do not give investment advice." },
          { role: "user", content: JSON.stringify(data) },
        ],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return fallback();

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.insights)) return fallback();
    return {
      source: "ai",
      insights: parsed.insights.slice(0, 5).map((item) => ({
        type: String(item.type || "observation").slice(0, 40),
        message: String(item.message || "").slice(0, 300),
      })),
    };
  } catch {
    return fallback();
  }
};

module.exports = { generateInsights };