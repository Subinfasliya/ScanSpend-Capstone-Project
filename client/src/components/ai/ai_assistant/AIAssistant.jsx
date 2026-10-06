import { useEffect, useRef, useState } from "react";
import { LuBot, LuSend, LuUser } from "react-icons/lu";
import { RiLoader4Line } from "react-icons/ri";
import { useAIChat } from "../../../hooks/ai/useAIChat";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";

const suggestedQuestions = [
  "How much did I spend this month?",
  "What is my highest spending category?",
  "Show my recent expenses.",
  "Give me some saving tips.",
];

const AIAssistant = () => {
  const { messages, sendMessage, isLoading } = useAIChat();

  // const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!messages.length) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages.length]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const text = input.trim();

  //   if (!text || isLoading) return;

  //   setInput("");

  //   await sendMessage(text);
  // };

  return (
    <div className="flex flex-col h-[500px] rounded-2xl bg-white shadow-sm ">
      {/* Header */}
      <div className=" px-5 py-4">
        <div className="flex items-center gap-2">
          <LuBot className="text-violet-600" size={22} />
          <h2 className="font-semibold text-lg">AI Expense Assistant</h2>
        </div>

        <p className="text-sm text-gray-500 mt-1">
          Ask anything about your expenses.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div>
            <div className="bg-violet-50 rounded-xl p-4 mb-5">
              <p className="font-medium mb-2">👋 Hello!</p>

              <p className="text-sm text-gray-600">
                I can help you understand your expenses.
              </p>
            </div>

            <div>
              <p className="font-medium mb-3">Suggested Questions</p>

              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    className="px-3 py-2 rounded-full border text-sm hover:bg-violet-50 transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          // <div
          //   key={message.id}
          //   className={`flex ${
          //     message.role === "user" ? "justify-end" : "justify-start"
          //   }`}
          // >
          //   <div
          //     className={`flex gap-3 max-w-[80%] ${
          //       message.role === "user" ? "flex-row-reverse" : ""
          //     }`}
          //   >
          //     <div className="mt-1">
          //       {message.role === "user" ? (
          //         <LuUser size={20} />
          //       ) : (
          //         <LuBot size={20} className="text-violet-600" />
          //       )}
          //     </div>

          //     <div
          //       className={`rounded-xl px-4 py-3 ${
          //         message.role === "user"
          //           ? "bg-violet-600 text-white"
          //           : "bg-gray-100"
          //       }`}
          //     >
          //       {message.text}
          //     </div>
          //   </div>
          // </div>

          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <LuBot size={20} className="text-violet-600 mt-1" />

            <div className="bg-gray-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <RiLoader4Line className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {/* <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-3">
          <input
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your expenses..."
            className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            disabled={isLoading}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white rounded-xl px-5 flex items-center justify-center"
          >
            <LuSend size={20} />
          </button>
        </div>
      </form> */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
};

export default AIAssistant;
