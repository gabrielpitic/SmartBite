import Anthropic from "@anthropic-ai/sdk";
import type { MenuItem, UserProfile, ChatMessage, Language } from "@/types";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

export function buildSystemPrompt(
  menu: MenuItem[],
  userProfile: UserProfile,
  lang: Language
): string {
  const availableMenu = menu.filter((d) => d.isAvailable);

  const menuText = availableMenu
    .map((dish) => {
      const name = lang === "ro" ? dish.nameRo : dish.nameEn;
      const desc =
        lang === "ro" ? dish.descriptionRo : dish.descriptionEn;
      const allergenList =
        dish.allergens.length > 0 ? dish.allergens.join(", ") : "none";
      const flags = [
        dish.isVegan ? "vegan" : null,
        dish.isVegetarian ? "vegetarian" : null,
      ]
        .filter(Boolean)
        .join(", ");

      return [
        `- [${dish.category.toUpperCase()}] ${name} | ${dish.price.toFixed(2)} RON`,
        `  ${desc ?? ""}`,
        `  Macros: ${dish.macros.kcal} kcal | ${dish.macros.protein}g protein | ${dish.macros.carbs}g carbs | ${dish.macros.fat}g fat${dish.macros.fiber != null ? ` | ${dish.macros.fiber}g fiber` : ""}`,
        `  Allergens: ${allergenList}`,
        flags ? `  Dietary: ${flags}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const profileLines: string[] = [];
  if (userProfile.goal) profileLines.push(`Goal: ${userProfile.goal}`);
  if (userProfile.allergens?.length)
    profileLines.push(`Allergies to avoid: ${userProfile.allergens.join(", ")}`);
  if (userProfile.isVegan) profileLines.push("Preference: vegan only");
  if (userProfile.isVegetarian) profileLines.push("Preference: vegetarian only");
  if (userProfile.budgetMax != null)
    profileLines.push(`Max budget: ${userProfile.budgetMax} RON`);
  if (userProfile.maxKcal != null)
    profileLines.push(`Max calories per meal: ${userProfile.maxKcal} kcal`);
  if (userProfile.minProtein != null)
    profileLines.push(`Min protein per meal: ${userProfile.minProtein}g`);

  const profileText =
    profileLines.length > 0
      ? profileLines.join("\n")
      : "No specific constraints provided yet.";

  if (lang === "ro") {
    return `Ești un asistent de meniu prietenos și util pentru un restaurant. Ajuți clienții să aleagă mâncarea potrivită în funcție de preferințele, obiectivele și restricțiile lor.

PROFILUL CLIENTULUI:
${profileText}

MENIUL DISPONIBIL:
${menuText}

REGULI:
- Răspunde ÎNTOTDEAUNA în română.
- Recomandă numai preparate din meniu — nu inventa niciodată preparate.
- Dacă un preparat conține un alergen al clientului, nu îl recomanda niciodată.
- Respectă bugetul clientului dacă este specificat.
- Fii concis, prietenos și util. Răspunsurile lungi trebuie evitate.
- Când recomanzi preparate, menționează întotdeauna prețul și macronutrienții relevanți.
- Dacă clientul nu a specificat obiective sau restricții, pune întrebări clarificatoare înainte de a recomanda.`;
  }

  return `You are a friendly and helpful menu assistant for a restaurant. You help customers choose the right food based on their preferences, goals, and restrictions.

CUSTOMER PROFILE:
${profileText}

AVAILABLE MENU:
${menuText}

RULES:
- ALWAYS respond in English.
- Only recommend dishes from the menu — never invent dishes.
- If a dish contains one of the customer's allergens, never recommend it.
- Respect the customer's budget if specified.
- Be concise, friendly, and helpful. Avoid long responses.
- When recommending dishes, always mention the price and relevant macros.
- If the customer has not specified goals or restrictions yet, ask clarifying questions before recommending.`;
}

// ---------------------------------------------------------------------------
// Streaming chat
// ---------------------------------------------------------------------------

export async function streamChatResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}