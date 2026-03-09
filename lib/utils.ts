import type { Dish } from "@prisma/client";
import type { MenuItem, Allergen } from "@/types";

// Convert a Prisma Dish row into the MenuItem shape used everywhere in the app
export function dishToMenuItem(dish: Dish): MenuItem {
  return {
    id: dish.id,
    nameEn: dish.nameEn,
    nameRo: dish.nameRo,
    descriptionEn: dish.descriptionEn,
    descriptionRo: dish.descriptionRo,
    price: dish.price,
    category: dish.category,
    macros: {
      kcal: dish.kcal,
      protein: dish.protein,
      carbs: dish.carbs,
      fat: dish.fat,
      fiber: dish.fiber ?? undefined,
    },
    allergens: dish.allergens as Allergen[],
    isVegan: dish.isVegan,
    isVegetarian: dish.isVegetarian,
    isAvailable: dish.isAvailable,
  };
}

// Simple URL-safe slug generator
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics (ă, â, î, ș, ț)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Format price in RON
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 2,
  }).format(price);
}