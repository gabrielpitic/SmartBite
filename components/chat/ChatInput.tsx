"use client";

import { useState } from "react";
import type { Language } from "@/types";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  lang: Language;
}

export default function ChatInput({ onSend, disabled, lang }: Props) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="flex-shrink-0 px-4 pb-5 pt-2">
      <div className="flex gap-2 items-center bg-white rounded-2xl shadow-lg border border-orange-100 px-3 py-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={lang === "ro" ? "Scrie un mesaj..." : "Type a message..."}
          disabled={disabled}
          className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="w-9 h-9 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}