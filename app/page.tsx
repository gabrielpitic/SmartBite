import { redirect } from "next/navigation";
import LanguageSelector from "@/components/language/LanguageSelector";

interface Props {
  searchParams: Promise<{ r?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { r } = await searchParams;

  // If no restaurant slug, show a generic "invalid QR" message
  if (!r) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">SmartBite</h1>
          <p className="text-gray-500 text-sm">
            Please scan the QR code at your table to get started.
          </p>
        </div>
      </main>
    );
  }

  return <LanguageSelector restaurantSlug={r} />;
}