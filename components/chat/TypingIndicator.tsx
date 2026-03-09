export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-sm flex-shrink-0 shadow-md">
        🍽️
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-orange-100">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-2 h-2 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}