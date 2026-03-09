"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ExtractedDish, Allergen } from "@/types";

const ALLERGENS: { id: Allergen; label: string; emoji: string }[] = [
  { id: "gluten",    label: "Gluten",    emoji: "🌾" },
  { id: "dairy",     label: "Dairy",     emoji: "🥛" },
  { id: "eggs",      label: "Eggs",      emoji: "🥚" },
  { id: "nuts",      label: "Tree Nuts", emoji: "🌰" },
  { id: "peanuts",   label: "Peanuts",   emoji: "🥜" },
  { id: "soy",       label: "Soy",       emoji: "🫘" },
  { id: "fish",      label: "Fish",      emoji: "🐟" },
  { id: "shellfish", label: "Shellfish", emoji: "🦐" },
  { id: "sesame",    label: "Sesame",    emoji: "⚪" },
  { id: "celery",    label: "Celery",    emoji: "🥬" },
  { id: "mustard",   label: "Mustard",   emoji: "🟡" },
  { id: "sulphites", label: "Sulphites", emoji: "🍷" },
  { id: "lupin",     label: "Lupin",     emoji: "🌸" },
  { id: "molluscs",  label: "Molluscs",  emoji: "🐚" },
];

const CATEGORIES = ["starter","soup","salad","main","side","dessert","drink","other"];

interface Props {
  dishes: ExtractedDish[];
  onReset: () => void;
}

export default function ImportReview({ dishes: initial, onReset }: Props) {
  const router = useRouter();
  const [dishes, setDishes] = useState<ExtractedDish[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (idx: number, key: keyof ExtractedDish, value: unknown) => {
    setDishes((prev) => prev.map((d, i) => i === idx ? { ...d, [key]: value } : d));
  };

  const remove = (idx: number) => {
    setDishes((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleAllergen = (idx: number, allergen: Allergen) => {
    const dish = dishes[idx];
    const current = dish.allergens ?? [];
    const next = current.includes(allergen)
      ? current.filter((a) => a !== allergen)
      : [...current, allergen];
    update(idx, "allergens", next);
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError("");

    const res = await fetch("/api/menu/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dishes }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save. Please try again.");
      return;
    }

    router.push("/dashboard/menu");
    router.refresh();
  };

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300 transition-all";
  const labelCls = "text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block";

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="bg-gradient-to-r from-orange-400 to-rose-500 rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg">
        <div>
          <p className="font-extrabold text-white">
            {dishes.length} dishes extracted
          </p>
          <p className="text-white/70 text-xs mt-0.5">
            Review each dish, edit if needed, then confirm
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="px-3 py-2 bg-white/20 border border-white/30 text-white rounded-xl text-xs font-bold hover:bg-white/30 transition-all"
          >
            ↩ Re-upload
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || dishes.length === 0}
            className="px-4 py-2 bg-white text-orange-500 rounded-xl text-xs font-extrabold shadow hover:shadow-md active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? "Saving..." : "✓ Confirm All"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* Dish cards */}
      {dishes.map((dish, idx) => {
        const isOpen = expandedId === dish._tempId;
        return (
          <div key={dish._tempId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Card header — always visible */}
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-all"
              onClick={() => setExpandedId(isOpen ? null : dish._tempId)}
            >
              {/* Confidence indicator */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                dish._confidence === "high" ? "bg-green-400" :
                dish._confidence === "medium" ? "bg-amber-400" : "bg-red-400"
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900 text-sm">{dish.nameEn || <span className="text-red-400 italic">Missing name</span>}</span>
                  {dish.nameRo && <span className="text-xs text-gray-400">/ {dish.nameRo}</span>}
                  <span className="text-xs bg-orange-50 border border-orange-200 text-orange-500 px-2 py-0.5 rounded-full capitalize font-semibold">
                    {dish.category}
                  </span>
                </div>
                <div className="flex gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500">🔥 {dish.kcal ?? "?"} kcal</span>
                  <span className="text-xs text-gray-500">💪 {dish.protein ?? "?"}g P</span>
                  <span className="text-xs text-gray-500">🌾 {dish.carbs ?? "?"}g C</span>
                  <span className="text-xs text-gray-500">🧈 {dish.fat ?? "?"}g F</span>
                  <span className="text-xs font-bold text-orange-500">{dish.price ? `${dish.price} RON` : "? RON"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {dish._per100g && (
                  <span className="text-xs bg-blue-50 border border-blue-200 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                    per 100g
                  </span>
                )}
                {dish._confidence !== "high" && (
                  <span className="text-xs bg-amber-50 border border-amber-200 text-amber-600 px-2 py-0.5 rounded-full font-semibold">
                    {dish._confidence === "medium" ? "⚠ Review" : "✕ Check"}
                  </span>
                )}
                <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Expanded edit form */}
            {isOpen && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 flex flex-col gap-4">

                {/* Names */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Name EN 🇬🇧</label>
                    <input className={inputCls} value={dish.nameEn} onChange={(e) => update(idx, "nameEn", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Name RO 🇷🇴</label>
                    <input className={inputCls} value={dish.nameRo} onChange={(e) => update(idx, "nameRo", e.target.value)} />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Description EN</label>
                    <textarea className={inputCls + " resize-none"} rows={2} value={dish.descriptionEn ?? ""} onChange={(e) => update(idx, "descriptionEn", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Description RO</label>
                    <textarea className={inputCls + " resize-none"} rows={2} value={dish.descriptionRo ?? ""} onChange={(e) => update(idx, "descriptionRo", e.target.value)} />
                  </div>
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Price (RON)</label>
                    <input className={inputCls} type="number" min="0" step="0.5" value={dish.price ?? ""} onChange={(e) => update(idx, "price", parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select className={inputCls} value={dish.category} onChange={(e) => update(idx, "category", e.target.value)}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "kcal", label: "🔥 Kcal", step: "1" },
                    { key: "protein", label: "💪 Protein (g)", step: "0.1" },
                    { key: "carbs", label: "🌾 Carbs (g)", step: "0.1" },
                    { key: "fat", label: "🧈 Fat (g)", step: "0.1" },
                    { key: "fiber", label: "🫆 Fiber (g)", step: "0.1" },
                  ].map(({ key, label, step }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <input
                        className={inputCls}
                        type="number" min="0" step={step}
                        value={(dish as any)[key] ?? ""}
                        onChange={(e) => update(idx, key as keyof ExtractedDish, e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                  ))}
                </div>

                {/* Allergens */}
                <div>
                  <label className={labelCls}>Allergens</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ALLERGENS.map((a) => {
                      const active = (dish.allergens ?? []).includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleAllergen(idx, a.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            active ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-gray-50 border-gray-200 text-gray-500"
                          }`}
                        >
                          <span>{a.emoji}</span>{a.label}
                          {active && <span className="ml-auto">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Flags */}
                <div className="flex gap-3 flex-wrap">
                  {[
                    { key: "isVegan", label: "🌱 Vegan" },
                    { key: "isVegetarian", label: "🥦 Vegetarian" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => update(idx, key as keyof ExtractedDish, !(dish as any)[key])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        (dish as any)[key]
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "bg-gray-50 border-gray-200 text-gray-500"
                      }`}
                    >
                      {label} {(dish as any)[key] ? "✓" : ""}
                    </button>
                  ))}
                </div>

                {/* AI notes */}
                {dish._notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
                    ⚠ {dish._notes}
                  </div>
                )}

                {/* per 100g warning */}
                {dish._per100g && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700 font-medium">
                    ℹ Macros shown are per 100g — adjust to your actual portion size before confirming.
                  </div>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => { remove(idx); setExpandedId(null); }}
                  className="w-full py-2 bg-red-50 border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                >
                  🗑️ Remove this dish from import
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom confirm */}
      {dishes.length > 0 && (
        <div className="sticky bottom-4">
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-500 text-white rounded-2xl font-extrabold shadow-xl active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? "Saving menu..." : `✓ Confirm & Save ${dishes.length} Dishes`}
          </button>
        </div>
      )}
    </div>
  );
}
