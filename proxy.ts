export { auth as middleware } from "@/lib/auth";

export const config = {
  // Protect all dashboard routes
  matcher: ["/dashboard/:path*"],
};