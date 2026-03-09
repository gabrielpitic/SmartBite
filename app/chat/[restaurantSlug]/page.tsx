import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getMenuCache, setMenuCache } from "@/lib/redis";
import { dishToMenuItem } from "@/lib/utils";
import ChatScreen from "@/components/chat/ChatScreen";
import type { Language, MenuItem } from "@/types";

interface Props {
  params: Promise<{ restaurantSlug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function ChatPage({ params, searchParams }: Props) {
  const { restaurantSlug } = await params;
  const { lang } = await searchParams;

  // Validate language — default to "en" if missing or invalid
  const language: Language =
    lang === "ro" || lang === "en" ? lang : "en";

  // Try Redis cache first
  let menu: MenuItem[] | null = await getMenuCache(restaurantSlug);

  if (!menu) {
    // Fetch restaurant + dishes from DB
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
      include: {
        dishes: {
          where: { isAvailable: true },
          orderBy: { category: "asc" },
        },
      },
    });

    if (!restaurant) notFound();

    menu = restaurant.dishes.map(dishToMenuItem);
    await setMenuCache(restaurantSlug, menu);
  }

  return (
    <ChatScreen
      restaurantSlug={restaurantSlug}
      initialMenu={menu}
      lang={language}
    />
  );
}