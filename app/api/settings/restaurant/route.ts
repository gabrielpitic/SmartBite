import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { nameEn, nameRo } = await req.json();

    if (!nameEn?.trim() || !nameRo?.trim()) {
      return NextResponse.json({ error: "Both names are required." }, { status: 400 });
    }

    const updated = await prisma.restaurant.update({
      where: { id: session.user.restaurantId },
      data: { nameEn: nameEn.trim(), nameRo: nameRo.trim() },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/settings/restaurant]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
