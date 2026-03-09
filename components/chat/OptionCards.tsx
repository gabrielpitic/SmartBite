"use client";

import type { ChatOption } from "@/types";

interface Props {
  options: ChatOption[];
  onSelect: (opt: ChatOption) => void;
}

export default function OptionCards({ options, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2 w-full">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt)}
          className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-200 rounded-2xl px-4 py-3 text-left shadow-sm active:scale-95 transition-all hover:from-orange-100 hover:to-rose-100 hover:border-orange-300 hover:shadow-md group"
        >
          <span className="text-2xl flex-shrink-0 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-orange-100">
            {opt.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">
              {opt.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.desc}</div>
          </div>
          <span className="text-orange-300 group-hover:text-orange-500 transition-colors font-bold flex-shrink-0">›</span>
        </button>
      ))}
    </div>
  );
}