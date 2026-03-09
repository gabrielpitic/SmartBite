export type Language = "en" | "ro";

export type Allergen =
  | "gluten"
  | "dairy"
  | "eggs"
  | "nuts"
  | "peanuts"
  | "soy"
  | "fish"
  | "shellfish"
  | "sesame"
  | "celery"
  | "mustard"
  | "sulphites"
  | "lupin"
  | "molluscs";

export type DietaryGoal =
  | "lose_weight"
  | "gain_muscle"
  | "maintain"
  | "high_energy"
  | "low_carb"
  | "keto"
  | "vegan";

export type MealCategory =
  | "starter"
  | "soup"
  | "salad"
  | "main"
  | "side"
  | "dessert"
  | "drink"
  | "other";

export interface Macros {
  kcal: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
  fiber?: number;  // grams
}

export interface MenuItem {
  id: string;
  nameEn: string;
  nameRo: string;
  descriptionEn?: string | null;
  descriptionRo?: string | null;
  price: number;        // RON
  category: string;
  macros: Macros;
  allergens: Allergen[];
  isVegan: boolean;
  isVegetarian: boolean;
  isAvailable: boolean;
}

export interface UserProfile {
  lang: Language;
  goal?: DietaryGoal;
  allergens?: Allergen[];
  isVegan?: boolean;
  isVegetarian?: boolean;
  budgetMax?: number;   // RON
  maxKcal?: number;
  minProtein?: number;
  // extended later as flows are built
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  nameEn: string;
  nameRo: string;
}

export interface RestaurantWithMenu extends Restaurant {
  menu: MenuItem[];
}

// Chat option card shown to the user
export interface ChatOption {
  id: string;
  icon: string;
  label: string;
  desc: string;
}

// Dish shape returned by the PDF extraction API, before DB insert
export interface ExtractedDish {
  _tempId: string;       // client-side only, not saved to DB
  _confidence: "high" | "medium" | "low";
  _per100g: boolean;     // true if macros are per 100g rather than per portion
  _notes: string | null; // extraction warnings from AI
  nameEn: string;
  nameRo: string;
  descriptionEn?: string | null;
  descriptionRo?: string | null;
  price: number | null;
  category: string;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  allergens: Allergen[];
  isVegan: boolean;
  isVegetarian: boolean;
}

// What the AI chat API route receives
export interface ChatRequest {
  messages: ChatMessage[];
  userProfile: UserProfile;
  menu: MenuItem[];
  restaurantSlug: string;
}
