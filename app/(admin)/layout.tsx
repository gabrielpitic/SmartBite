import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartBite Admin",
  description: "Restaurant management dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
