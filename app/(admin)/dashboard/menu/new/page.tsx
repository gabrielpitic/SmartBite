import { auth } from "@/lib/auth";
import Link from "next/link";
import DishForm from "@/components/admin/DishForm";

export default async function NewDishPage() {
  const session = await auth();

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/menu"
          className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-bold"
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Add Dish</h1>
          <p className="text-gray-500 text-sm">Fill in the details below</p>
        </div>
      </div>

      <DishForm restaurantId={session!.user.restaurantId} />
    </div>
  );
}
