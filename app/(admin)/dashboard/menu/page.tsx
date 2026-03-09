import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import MenuTable from "@/components/admin/MenuTable";

export default async function MenuPage() {
  const session = await auth();
  const restaurantId = session!.user.restaurantId;

  const dishes = await prisma.dish.findMany({
    where: { restaurantId },
    orderBy: [{ category: "asc" }, { nameEn: "asc" }],
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Menu</h1>
          <p className="text-gray-500 text-sm mt-0.5">{dishes.length} dishes total</p>
        </div>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/menu/import"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
        >
          <span>📄</span> Import PDF
        </Link>
        <Link
          href="/dashboard/menu/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-400 to-rose-500 text-white rounded-xl font-bold text-sm shadow active:scale-95 transition-all"
        >
          <span>➕</span> Add Dish
        </Link>
      </div>
      </div>

      <MenuTable dishes={dishes} />
    </div>
  );
}
