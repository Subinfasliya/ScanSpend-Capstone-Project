import { useState } from "react";
import { LuSend } from "react-icons/lu";

const ChatInput = ({
  onSend,
  isLoading,
  placeholder = "Ask about your expenses...",
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = input.trim();

    if (!message || isLoading) return;

    setInput("");

    await onSend(message);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t p-4 bg-white rounded-b-2xl"
    >
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          disabled={isLoading}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl border px-4 py-3 outline-none
                     focus:ring-2 focus:ring-violet-500
                     disabled:bg-gray-100"
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-violet-600 hover:bg-violet-700
                     disabled:bg-gray-300
                     disabled:cursor-not-allowed
                     text-white rounded-xl px-5
                     flex items-center justify-center"
        >
          <LuSend size={20} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
