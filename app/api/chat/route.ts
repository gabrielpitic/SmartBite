import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, streamChatResponse } from "@/lib/claude";
import type { ChatRequest } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, userProfile, menu } = body;

    if (!messages || !userProfile || !menu) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(menu, userProfile, userProfile.lang);
    const stream = await streamChatResponse(messages, systemPrompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
