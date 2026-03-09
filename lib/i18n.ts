import type { ChatOption, Language } from "@/types";

export function getWelcomeMessage(lang: Language): string {
  if (lang === "ro") {
    return `Bună ziua! 👋 Sunt asistentul tău SmartBite.\n\nSunt aici să te ajut să găsești preparatul perfect din meniu. Cum te pot ajuta astăzi?`;
  }
  return `Hello! 👋 I'm your SmartBite assistant.\n\nI'm here to help you find the perfect dish from the menu. How can I help you today?`;
}

export function getOptions(lang: Language): ChatOption[] {
  if (lang === "ro") {
    return [
      { id: "nutrition", icon: "🥗", label: "Valori Nutriționale", desc: "Filtrează după calorii, proteine, carbohidrați" },
      { id: "objective", icon: "🎯", label: "Obiectivul Meu", desc: "Slăbit, masă musculară, menținerea energiei..." },
      { id: "vegan", icon: "🌱", label: "Vegan / Vegetarian", desc: "Opțiuni pe bază de plante" },
      { id: "allergies", icon: "⚠️", label: "Alergii", desc: "Evită ingrediente sau alergeni specifici" },
      { id: "pairing", icon: "🍷", label: "Combinații", desc: "Preparate care se potrivesc perfect împreună" },
      { id: "budget", icon: "💰", label: "Buget", desc: "Cele mai bune preparate în limita prețului tău" },
    ];
  }
  return [
    { id: "nutrition", icon: "🥗", label: "Nutritional Goals", desc: "Filter by calories, protein, carbs & more" },
    { id: "objective", icon: "🎯", label: "My Objective", desc: "Lose weight, gain muscle, maintain energy..." },
    { id: "vegan", icon: "🌱", label: "Vegan / Vegetarian", desc: "Plant-based and vegetarian options" },
    { id: "allergies", icon: "⚠️", label: "Allergies", desc: "Avoid specific ingredients or allergens" },
    { id: "pairing", icon: "🍷", label: "Meal Pairing", desc: "Dishes that go perfectly together" },
    { id: "budget", icon: "💰", label: "Budget", desc: "Best meals within your price range" },
  ];
}
