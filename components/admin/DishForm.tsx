"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dish } from "@prisma/client";
import type { Allergen } from "@/types";

const CATEGORIES = ["starter", "soup", "salad", "main", "side", "dessert", "drink", "other"];

const ALLERGENS: { id: Allergen; label: string; emoji: string }[] = [
  { id: "gluten", label: "Gluten", emoji: "🌾" },
  { id: "dairy", label: "Dairy", emoji: "🥛" },
  { id: "eggs", label: "Eggs", emoji: "🥚" },
  { id: "nuts", label: "Tree Nuts", emoji: "🌰" },
  { id: "peanuts", label: "Peanuts", emoji: "🥜" },
  { id: "soy", label: "Soy", emoji: "🫘" },
  { id: "fish", label: "Fish", emoji: "🐟" },
  { id: "shellfish", label: "Shellfish", emoji: "🦐" },
  { id: "sesame", label: "Sesame", emoji: "⚪" },
  { id: "celery", label: "Celery", emoji: "🥬" },
  { id: "mustard", label: "Mustard", emoji: "🟡" },
  { id: "sulphites", label: "Sulphites", emoji: "🍷" },
  { id: "lupin", label: "Lupin", emoji: "🌸" },
  { id: "molluscs", label: "Molluscs", emoji: "🐚" },
];

interface Props {
  dish?: Dish;
  restaurantId: string;
}

export default function DishForm({ dish, restaurantId }: Props) {
  const router = useRouter();
  const isEdit = !!dish;

  const [form, setForm] = useState({
    nameEn: dish?.nameEn ?? "",
    nameRo: dish?.nameRo ?? "",
    descriptionEn: dish?.descriptionEn ?? "",
    descriptionRo: dish?.descriptionRo ?? "",
    price: dish?.price?.toString() ?? "",
    category: dish?.category ?? "main",
    kcal: dish?.kcal?.toString() ?? "",
    protein: dish?.protein?.toString() ?? "",
    carbs: dish?.carbs?.toString() ?? "",
    fat: dish?.fat?.toString() ?? "",
    fiber: dish?.fiber?.toString() ?? "",
    isVegan: dish?.isVegan ?? false,
    isVegetarian: dish?.isVegetarian ?? false,
    isAvailable: dish?.isAvailable ?? true,
    allergens: (dish?.allergens ?? []) as Allergen[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAllergen = (id: Allergen) => {
    setForm((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(id)
        ? prev.allergens.filter((a) => a !== id)
        : [...prev.allergens, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      price: parseFloat(form.price),
      kcal: parseInt(form.kcal),
      protein: parseFloat(form.protein),
      carbs: parseFloat(form.carbs),
      fat: parseFloat(form.fat),
      fiber: form.fiber ? parseFloat(form.fiber) : null,
      restaurantId,
    };

    const url = isEdit ? `/api/menu/${dish!.id}` : "/api/menu";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/dashboard/menu");
    router.refresh();
  };

  const inputClass =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all";
  const labelClass = "text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Names */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Dish Name</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>English 🇬🇧</label>
            <input className={inputClass} value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} placeholder="Grilled Chicken" required />
          </div>
          <div>
            <label className={labelClass}>Romanian 🇷🇴</label>
            <input className={inputClass} value={form.nameRo} onChange={(e) => set("nameRo", e.target.value)} placeholder="Pui la Grătar" required />
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Description</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>English 🇬🇧</label>
            <textarea className={inputClass + " resize-none"} rows={2} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} placeholder="Tender grilled chicken with herbs..." />
          </div>
          <div>
            <label className={labelClass}>Romanian 🇷🇴</label>
            <textarea className={inputClass + " resize-none"} rows={2} value={form.descriptionRo} onChange={(e) => set("descriptionRo", e.target.value)} placeholder="Pui fraged la grătar cu ierburi..." />
          </div>
        </div>
      </div>

      {/* Price & Category */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Price & Category</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price (RON)</label>
            <input className={inputClass} type="number" min="0" step="0.5" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="35.00" required />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-1">Nutritional Values</h3>
        <p className="text-xs text-gray-400 mb-4">Required by Romanian law — per serving</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>🔥 Calories (kcal)</label>
            <input className={inputClass} type="number" min="0" value={form.kcal} onChange={(e) => set("kcal", e.target.value)} placeholder="350" required />
          </div>
          <div>
            <label className={labelClass}>💪 Protein (g)</label>
            <input className={inputClass} type="number" min="0" step="0.1" value={form.protein} onChange={(e) => set("protein", e.target.value)} placeholder="28" required />
          </div>
          <div>
            <label className={labelClass}>🌾 Carbs (g)</label>
            <input className={inputClass} type="number" min="0" step="0.1" value={form.carbs} onChange={(e) => set("carbs", e.target.value)} placeholder="12" required />
          </div>
          <div>
            <label className={labelClass}>🧈 Fat (g)</label>
            <input className={inputClass} type="number" min="0" step="0.1" value={form.fat} onChange={(e) => set("fat", e.target.value)} placeholder="14" required />
          </div>
          <div>
            <label className={labelClass}>🫆 Fiber (g) — optional</label>
            <input className={inputClass} type="number" min="0" step="0.1" value={form.fiber} onChange={(e) => set("fiber", e.target.value)} placeholder="2" />
          </div>
        </div>
      </div>

      {/* Allergens */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-1">Allergens</h3>
        <p className="text-xs text-gray-400 mb-4">Select all that apply</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ALLERGENS.map((a) => {
            const active = form.allergens.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAllergen(a.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  active
                    ? "bg-orange-50 border-orange-300 text-orange-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:border-orange-200"
                }`}
              >
                <span>{a.emoji}</span>
                {a.label}
                {active && <span className="ml-auto text-orange-500">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary flags */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Dietary Flags</h3>
        <div className="flex flex-col gap-3">
          {[
            { key: "isVegan", label: "Vegan", emoji: "🌱", desc: "Contains no animal products" },
            { key: "isVegetarian", label: "Vegetarian", emoji: "🥦", desc: "No meat or fish" },
            { key: "isAvailable", label: "Available on menu", emoji: "✅", desc: "Visible to customers" },
          ].map((flag) => (
            <label key={flag.key} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-10 h-6 rounded-full transition-all flex-shrink-0 relative ${
                  form[flag.key as keyof typeof form] ? "bg-gradient-to-r from-orange-400 to-rose-500" : "bg-gray-200"
                }`}
                onClick={() => set(flag.key, !form[flag.key as keyof typeof form])}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    form[flag.key as keyof typeof form] ? "left-[calc(100%-1.375rem)]" : "left-0.5"
                  }`}
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {flag.emoji} {flag.label}
                </div>
                <div className="text-xs text-gray-400">{flag.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-60"
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Dish"}
        </button>
      </div>
    </form>
  );
}
