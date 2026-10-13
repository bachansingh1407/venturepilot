import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [CredentialsProvider({
    name: "Email and password",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;
      const user = await db.user.findUnique({ where: { email: credentials.email.toLowerCase().trim() } });
      if (!user || !(await compare(credentials.password, user.passwordHash))) return null;
      return { id: user.id, email: user.email, name: user.name };
    }
  })],
  callbacks: {
    async jwt({ token, user }) { if (user) token.id = user.id; return token; },
    async session({ session, token }) { if (session.user && token.id) (session.user as { id: string }).id = String(token.id); return session; }
  }
};
