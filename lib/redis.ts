import Redis from "ioredis";
import type { MenuItem } from "@/types";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// TTL in seconds
const MENU_TTL = 60 * 10; // 10 minutes
const menuKey = (slug: string) => `menu:${slug}`;

export async function getMenuCache(slug: string): Promise<MenuItem[] | null> {
  try {
    const data = await redis.get(menuKey(slug));
    if (!data) return null;
    return JSON.parse(data) as MenuItem[];
  } catch {
    // Redis failure should never crash the app — just fetch from DB
    return null;
  }
}

export async function setMenuCache(slug: string, menu: MenuItem[]): Promise<void> {
  try {
    await redis.set(menuKey(slug), JSON.stringify(menu), "EX", MENU_TTL);
  } catch {
    // Silently fail — caching is an optimisation, not a requirement
  }
}

export async function invalidateMenuCache(slug: string): Promise<void> {
  try {
    await redis.del(menuKey(slug));
  } catch {
    // Silently fail
  }
}