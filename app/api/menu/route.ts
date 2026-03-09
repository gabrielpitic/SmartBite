import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { invalidateMenuCache } from "@/lib/redis";

// POST /api/menu — create a new dish
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { restaurantId, nameEn, nameRo, descriptionEn, descriptionRo,
            price, category, kcal, protein, carbs, fat, fiber,
            allergens, isVegan, isVegetarian, isAvailable } = body;

    // Ensure admin can only create dishes for their own restaurant
    if (restaurantId !== session.user.restaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const dish = await prisma.dish.create({
      data: {
        restaurantId,
        nameEn, nameRo,
        descriptionEn: descriptionEn || null,
        descriptionRo: descriptionRo || null,
        price, category,
        kcal, protein, carbs, fat,
        fiber: fiber ?? null,
        allergens: allergens ?? [],
        isVegan: isVegan ?? false,
        isVegetarian: isVegetarian ?? false,
        isAvailable: isAvailable ?? true,
      },
    });

    // Invalidate menu cache so customers see the new dish
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { slug: true },
    });
    if (restaurant) await invalidateMenuCache(restaurant.slug);

    return NextResponse.json(dish, { status: 201 });
  } catch (err) {
    console.error("[POST /api/menu]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
