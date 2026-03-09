import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import DishForm from "@/components/admin/DishForm";

interface Props {
  params: Promise<{ dishId: string }>;
}

export default async function EditDishPage({ params }: Props) {
  const { dishId } = await params;
  const session = await auth();

  const dish = await prisma.dish.findFirst({
    where: {
      id: dishId,
      restaurantId: session!.user.restaurantId, // scoped to this admin's restaurant
    },
  });

  if (!dish) notFound();

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
          <h1 className="text-2xl font-extrabold text-gray-900">Edit Dish</h1>
          <p className="text-gray-500 text-sm">{dish.nameEn}</p>
        </div>
      </div>

      <DishForm dish={dish} restaurantId={session!.user.restaurantId} />
    </div>
  );
}
