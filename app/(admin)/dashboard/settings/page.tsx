import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session!.user.restaurantId },
  });

  const admin = await prisma.admin.findFirst({
    where: { restaurantId: session!.user.restaurantId },
    select: { email: true },
  });

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your restaurant profile and account</p>
      </div>

      <SettingsForm restaurant={restaurant!} adminEmail={admin?.email ?? ""} />
    </div>
  );
}
