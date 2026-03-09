"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊", exact: true },
  { href: "/dashboard/menu", label: "Menu", icon: "🍽️", exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️", exact: false },
];

interface Props {
  restaurantSlug: string;
}

export default function Sidebar({ restaurantSlug }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center text-lg shadow">
            🍽️
          </div>
          <div>
            <div className="font-extrabold text-gray-900 text-sm">SmartBite</div>
            <div className="text-xs text-gray-400 font-medium">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive(item.href, item.exact)
                ? "bg-gradient-to-r from-orange-50 to-rose-50 text-orange-600 border border-orange-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {/* QR preview link */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <a
            href={`/?r=${restaurantSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <span className="text-base">📱</span>
            Preview Menu
          </a>
        </div>
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <span className="text-base">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
