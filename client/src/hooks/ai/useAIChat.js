import { useState, useCallback } from "react";
import { useExpenseAnalytics } from "../expenseHooks/useExpenseAnalytics";
import { buildPrompt } from "../../utils/ai/buildPrompt";
import { askAssistant } from "../../services/aiAssistantService";
import { useAuth } from "../../context/AuthContext";

export const useAIChat = () => {
  const analytics = useExpenseAnalytics();
   const { user } = useAuth();

   

  const [messages, setMessages] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  const sendMessage = useCallback(
    async (question) => {
      if (!question.trim()) return;

      setError("");

      // Add user message
      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text: question,
      };

      setMessages((prev) => [...prev, userMessage]);

      setIsLoading(true);

      try {
        // Build AI prompt
        const prompt = buildPrompt({
          user,
          analytics,
          question,
        });

        // Ask Gemini
        const reply = await askAssistant(prompt);

        const aiMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: reply,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        console.error(err);

        setError(err.message || "Unable to get an AI response.");

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: err.message || "Sorry, something went wrong while contacting the AI.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [analytics, user]
  );

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    error,
  };
};