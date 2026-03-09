import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const restaurantId = session!.user.restaurantId;

  const [restaurant, totalDishes, availableDishes, veganDishes] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
    prisma.dish.count({ where: { restaurantId } }),
    prisma.dish.count({ where: { restaurantId, isAvailable: true } }),
    prisma.dish.count({ where: { restaurantId, isVegan: true } }),
  ]);

  const stats = [
    { label: "Total Dishes", value: totalDishes, icon: "🍽️", color: "from-orange-400 to-rose-400" },
    { label: "Available", value: availableDishes, icon: "✅", color: "from-green-400 to-emerald-400" },
    { label: "Unavailable", value: totalDishes - availableDishes, icon: "⏸️", color: "from-gray-400 to-slate-400" },
    { label: "Vegan Options", value: veganDishes, icon: "🌱", color: "from-lime-400 to-green-400" },
  ];

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Good day! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Managing <span className="font-semibold text-orange-500">{restaurant?.nameEn}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow`}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-xs font-medium text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/menu/new"
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-400 to-rose-500 text-white rounded-xl font-semibold text-sm shadow active:scale-95 transition-all"
          >
            <span className="text-lg">➕</span>
            Add New Dish
          </Link>
          <Link
            href="/dashboard/menu"
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all"
          >
            <span className="text-lg">📋</span>
            Manage Menu
          </Link>
          <a
            href={`/?r=${session!.user.restaurantSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all"
          >
            <span className="text-lg">📱</span>
            Preview Customer View
          </a>
        </div>
      </div>
    </div>
  );
}
