import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email as string },
          include: { restaurant: true },
        });

        if (!admin) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          admin.passwordHash
        );
        if (!valid) return null;

        return {
          id: admin.id,
          email: admin.email,
          restaurantId: admin.restaurantId,
          restaurantSlug: admin.restaurant.slug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, persist restaurant info into the token
      if (user) {
        token.restaurantId = (user as any).restaurantId;
        token.restaurantSlug = (user as any).restaurantSlug;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose restaurant info to the client session
      session.user.restaurantId = token.restaurantId as string;
      session.user.restaurantSlug = token.restaurantSlug as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});

// Extend next-auth types
declare module "next-auth" {
  interface User {
    restaurantId?: string;
    restaurantSlug?: string;
  }
  interface Session {
    user: {
      restaurantId: string;
      restaurantSlug: string;
    } & DefaultSession["user"];
  }
}
