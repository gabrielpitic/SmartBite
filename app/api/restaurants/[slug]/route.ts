import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMenuCache, setMenuCache } from "@/lib/redis";
import { dishToMenuItem } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Try cache first
  const cached = await getMenuCache(slug);
  if (cached) {
    return NextResponse.json({ menu: cached });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      dishes: {
        where: { isAvailable: true },
        orderBy: { category: "asc" },
      },
    },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const menu = restaurant.dishes.map(dishToMenuItem);
  await setMenuCache(slug, menu);

  return NextResponse.json({
    restaurant: {
      id: restaurant.id,
      slug: restaurant.slug,
      nameEn: restaurant.nameEn,
      nameRo: restaurant.nameRo,
    },
    menu,
  });
}
