import { LuBot, LuUser } from "react-icons/lu";

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex gap-3 max-w-[80%] ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        {/* Avatar */}
        <div className="mt-1 flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center">
              <LuUser size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
              <LuBot size={18} />
            </div>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 whitespace-pre-wrap break-words ${
            isUser
              ? "bg-violet-600 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
