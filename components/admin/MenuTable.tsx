"use client";

import type { Dish } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["all", "starter", "soup", "salad", "main", "side", "dessert", "drink", "other"];

interface Props {
  dishes: Dish[];
}

export default function MenuTable({ dishes }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = filter === "all" ? dishes : dishes.filter((d) => d.category === filter);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    setDeletingId(null);
    router.refresh();
  };

  const handleToggleAvailable = async (dish: Dish) => {
    await fetch(`/api/menu/${dish.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !dish.isAvailable }),
    });
    router.refresh();
  };

  return (
    <div>
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize flex-shrink-0 transition-all ${
              filter === cat
                ? "bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow"
                : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="text-gray-500 font-medium">No dishes in this category.</p>
          <Link
            href="/dashboard/menu/new"
            className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-orange-400 to-rose-500 text-white rounded-xl font-bold text-sm"
          >
            Add First Dish
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((dish) => (
            <div
              key={dish.id}
              className={`bg-white rounded-2xl px-5 py-4 shadow-sm border transition-all ${
                dish.isAvailable ? "border-gray-100" : "border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{dish.nameEn}</span>
                    <span className="text-xs text-gray-400">/</span>
                    <span className="text-xs text-gray-500">{dish.nameRo}</span>
                    {dish.isVegan && (
                      <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                        🌱 Vegan
                      </span>
                    )}
                    {dish.isVegetarian && !dish.isVegan && (
                      <span className="text-xs bg-lime-50 text-lime-600 border border-lime-200 px-2 py-0.5 rounded-full font-semibold">
                        🥦 Veg
                      </span>
                    )}
                    {!dish.isAvailable && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                        Unavailable
                      </span>
                    )}
                  </div>

                  {/* Macros row */}
                  <div className="flex gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-gray-500">🔥 {dish.kcal} kcal</span>
                    <span className="text-xs text-gray-500">💪 {dish.protein}g P</span>
                    <span className="text-xs text-gray-500">🌾 {dish.carbs}g C</span>
                    <span className="text-xs text-gray-500">🧈 {dish.fat}g F</span>
                    <span className="text-xs font-bold text-orange-500">{dish.price.toFixed(2)} RON</span>
                  </div>

                  {/* Category */}
                  <span className="inline-block mt-2 text-xs bg-orange-50 text-orange-500 border border-orange-200 px-2 py-0.5 rounded-full capitalize font-semibold">
                    {dish.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link
                    href={`/dashboard/menu/${dish.id}`}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all text-center"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleToggleAvailable(dish)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all"
                  >
                    {dish.isAvailable ? "⏸️ Hide" : "▶️ Show"}
                  </button>
                  <button
                    onClick={() => handleDelete(dish.id, dish.nameEn)}
                    disabled={deletingId === dish.id}
                    className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    {deletingId === dish.id ? "..." : "🗑️ Del"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
