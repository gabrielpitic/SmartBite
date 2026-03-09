import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const CHUNK_SIZE = 12000; // characters per chunk — safe for token limits

const EXTRACTION_PROMPT = (chunk: string, chunkIndex: number, totalChunks: number) => `
You are extracting menu data from a Romanian restaurant menu text (chunk ${chunkIndex + 1} of ${totalChunks}).

The text uses Romanian nutritional terminology:
- "Valoare Energetică" = calories (kcal)
- "Grăsimi" = fat
- "Glucide" = carbs
- "Proteine" = protein
- "Sare" = salt (ignore this field)
- "Zaharuri" = sugars (part of carbs, ignore separately)
- "Acizi grași saturați" = saturated fat (ignore separately)
- "Alergeni" = allergens
- Romanian allergen names: Lapte=dairy, Ou=eggs, Gluten=gluten, Alune/Nuci=nuts, Arahide=peanuts, Soia=soy, Pește=fish, Crustacee=shellfish, Susan=sesame, Țelină=celery, Muștar=mustard, Dioxid de sulf/Sulfiți=sulphites, Lupin=lupin, Moluște=molluscs

IMPORTANT: Nutritional values in the text are per 100g. You must note this — set a field "_per100g": true so the admin knows to verify portion sizes.

For each dish return a JSON object with EXACTLY these fields:
{
  "nameEn": string (translate from Romanian),
  "nameRo": string (original Romanian name),
  "descriptionEn": string | null,
  "descriptionRo": string | null,
  "price": number | null,
  "category": "starter"|"soup"|"salad"|"main"|"side"|"dessert"|"drink"|"other",
  "kcal": number | null,
  "protein": number | null,
  "carbs": number | null,
  "fat": number | null,
  "fiber": number | null,
  "allergens": string[],
  "isVegan": boolean,
  "isVegetarian": boolean,
  "_confidence": "high"|"medium"|"low",
  "_per100g": boolean,
  "_notes": string | null (any extraction warnings)
}

Return ONLY a raw JSON array. No explanation, no markdown, no code fences. Just [ ... ].

Menu text to extract:
${chunk}
`;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    // Try to split at a newline near the chunk boundary to avoid cutting mid-dish
    let end = Math.min(i + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const lastNewline = text.lastIndexOf("\n", end);
      if (lastNewline > i + CHUNK_SIZE * 0.7) end = lastNewline;
    }
    chunks.push(text.slice(i, end));
    i = end;
  }
  return chunks;
}

function salvageJSON(raw: string): unknown[] {
  let clean = raw.replace(/```json|```/g, "").trim();
  if (!clean.startsWith("[")) {
    const start = clean.indexOf("[");
    if (start !== -1) clean = clean.slice(start);
  }
  if (!clean.endsWith("]")) {
    const lastComplete = clean.lastIndexOf("},");
    if (lastComplete !== -1) clean = clean.slice(0, lastComplete + 1) + "]";
    else {
      const lastObj = clean.lastIndexOf("}");
      if (lastObj !== -1) clean = clean.slice(0, lastObj + 1) + "]";
    }
  }
  return JSON.parse(clean);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return NextResponse.json({ error: "No menu text provided." }, { status: 400 });
    }

    const chunks = chunkText(text.trim());
    console.log(`[import] Processing ${chunks.length} chunks from ${text.length} chars`);

    const allDishes: object[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`[import] Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        messages: [
          {
            role: "user",
            content: EXTRACTION_PROMPT(chunks[i], i, chunks.length),
          },
        ],
      });

      const raw = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");

      try {
        const parsed = salvageJSON(raw);
        if (Array.isArray(parsed)) allDishes.push(...parsed);
        console.log(`[import] Chunk ${i + 1}: extracted ${Array.isArray(parsed) ? parsed.length : 0} dishes`);
      } catch (e) {
        console.error(`[import] Chunk ${i + 1} parse failed:`, e);
        // Continue with remaining chunks instead of failing entirely
      }
    }

    if (allDishes.length === 0) {
      return NextResponse.json(
        { error: "Could not extract any dishes. Please check the text format." },
        { status: 422 }
      );
    }

    // Attach temp IDs for the review UI
    const dishes = allDishes.map((d) => ({ ...d, _tempId: randomUUID() }));
    console.log(`[import] Total extracted: ${dishes.length} dishes`);

    return NextResponse.json({ dishes, chunks: chunks.length });
  } catch (err) {
    console.error("[POST /api/menu/import]", err);
    return NextResponse.json({ error: "Failed to extract menu. Please try again." }, { status: 500 });
  }
}
