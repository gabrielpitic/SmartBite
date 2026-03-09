import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { invalidateMenuCache } from "@/lib/redis";

type Params = { params: Promise<{ dishId: string }> };

async function getRestaurantSlug(restaurantId: string): Promise<string | null> {
  const r = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { slug: true } });
  return r?.slug ?? null;
}

// PUT /api/menu/[dishId] — update a dish
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dishId } = await params;

  const dish = await prisma.dish.findFirst({
    where: { id: dishId, restaurantId: session.user.restaurantId },
  });
  if (!dish) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const updated = await prisma.dish.update({
      where: { id: dishId },
      data: {
        nameEn: body.nameEn ?? dish.nameEn,
        nameRo: body.nameRo ?? dish.nameRo,
        descriptionEn: body.descriptionEn !== undefined ? body.descriptionEn || null : dish.descriptionEn,
        descriptionRo: body.descriptionRo !== undefined ? body.descriptionRo || null : dish.descriptionRo,
        price: body.price ?? dish.price,
        category: body.category ?? dish.category,
        kcal: body.kcal ?? dish.kcal,
        protein: body.protein ?? dish.protein,
        carbs: body.carbs ?? dish.carbs,
        fat: body.fat ?? dish.fat,
        fiber: body.fiber !== undefined ? body.fiber : dish.fiber,
        allergens: body.allergens ?? dish.allergens,
        isVegan: body.isVegan ?? dish.isVegan,
        isVegetarian: body.isVegetarian ?? dish.isVegetarian,
        isAvailable: body.isAvailable ?? dish.isAvailable,
      },
    });

    const slug = await getRestaurantSlug(session.user.restaurantId);
    if (slug) await invalidateMenuCache(slug);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/menu/[dishId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/menu/[dishId] — delete a dish
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dishId } = await params;

  const dish = await prisma.dish.findFirst({
    where: { id: dishId, restaurantId: session.user.restaurantId },
  });
  if (!dish) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.dish.delete({ where: { id: dishId } });

  const slug = await getRestaurantSlug(session.user.restaurantId);
  if (slug) await invalidateMenuCache(slug);

  return NextResponse.json({ success: true });
}
