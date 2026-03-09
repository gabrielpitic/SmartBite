"use client";

import type { ChatOption } from "@/types";
import OptionCards from "./OptionCards";

interface Props {
  content: string;
  options?: ChatOption[];
  onOptionSelect: (opt: ChatOption) => void;
  isStreaming?: boolean;
}

export default function AIMessage({ content, options, onOptionSelect, isStreaming }: Props) {
  return (
    <div className="flex items-end gap-2 mb-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-sm flex-shrink-0 shadow-md">
        🍽️
      </div>

      <div className="flex flex-col gap-2.5 max-w-[82%]">
        {/* Bubble */}
        {content && (
          <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-md text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words border border-orange-100">
            {content}
            {isStreaming && (
              <span className="inline-block w-[2px] h-[14px] bg-orange-400 ml-0.5 align-middle animate-pulse" />
            )}
          </div>
        )}

        {/* Option cards */}
        {!isStreaming && options && options.length > 0 && (
          <OptionCards options={options} onSelect={onOptionSelect} />
        )}
      </div>
    </div>
  );
}