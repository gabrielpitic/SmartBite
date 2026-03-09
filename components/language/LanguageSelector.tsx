"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
];

interface Props {
  restaurantSlug: string;
}

export default function LanguageSelector({ restaurantSlug }: Props) {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);

  const handleSelect = (code: string) => {
    setSelecting(true);
    router.push(`/chat/${restaurantSlug}?lang=${code}`);
  };

  return (
    <main
      className={`min-h-screen min-h-dvh bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 flex flex-col items-center justify-center px-5 transition-opacity duration-300 ${
        selecting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Card */}
      <div className="w-full max-w-sm bg-white/15 backdrop-blur-sm rounded-3xl p-7 shadow-2xl border border-white/25">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-white/25 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-inner border border-white/30">
            🍽️
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SmartBite</h1>
          <p className="text-white/75 text-sm mt-1 font-medium">Your personal food guide</p>
        </div>

        {/* Divider label */}
        <p className="text-center text-xs font-semibold text-white/60 uppercase tracking-widest mb-4">
          Select language / Selectează limba
        </p>

        {/* Language buttons */}
        <div className="flex flex-col gap-3">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              disabled={selecting}
              className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-lg active:scale-95 transition-all group disabled:opacity-50"
            >
              <span className="text-4xl">{l.flag}</span>
              <span className="text-lg font-bold text-gray-800 group-hover:text-orange-500 transition-colors">
                {l.label}
              </span>
              <span className="ml-auto text-2xl text-orange-400 font-bold">→</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-white/50 mt-8 font-medium">
        Powered by AI · Made for Romania 🇷🇴
      </p>
    </main>
  );
}