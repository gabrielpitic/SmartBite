import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { invalidateMenuCache } from "@/lib/redis";
import type { ExtractedDish } from "@/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { dishes }: { dishes: ExtractedDish[] } = await req.json();

    if (!Array.isArray(dishes) || dishes.length === 0) {
      return NextResponse.json({ error: "No dishes provided." }, { status: 400 });
    }

    const restaurantId = session.user.restaurantId;

    // Get restaurant slug for cache invalidation
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { slug: true },
    });
    if (!restaurant) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });

    // Full replace in a single transaction
    await prisma.$transaction([
      // 1. Delete all existing dishes
      prisma.dish.deleteMany({ where: { restaurantId } }),

      // 2. Insert all new dishes
      prisma.dish.createMany({
        data: dishes.map((d) => ({
          restaurantId,
          nameEn: d.nameEn?.trim() || "Unnamed Dish",
          nameRo: d.nameRo?.trim() || d.nameEn?.trim() || "Unnamed Dish",
          descriptionEn: d.descriptionEn?.trim() || null,
          descriptionRo: d.descriptionRo?.trim() || null,
          price: d.price ?? 0,
          category: d.category ?? "other",
          kcal: d.kcal ?? 0,
          protein: d.protein ?? 0,
          carbs: d.carbs ?? 0,
          fat: d.fat ?? 0,
          fiber: d.fiber ?? null,
          allergens: d.allergens ?? [],
          isVegan: d.isVegan ?? false,
          isVegetarian: d.isVegetarian ?? false,
          isAvailable: true,
        })),
      }),
    ]);

    // Invalidate Redis cache
    await invalidateMenuCache(restaurant.slug);

    return NextResponse.json({ success: true, count: dishes.length });
  } catch (err) {
    console.error("[POST /api/menu/batch]", err);
    return NextResponse.json({ error: "Failed to save menu." }, { status: 500 });
  }
}
