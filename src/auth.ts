import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const credentialsSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(googleClientId && googleClientSecret
      ? [Google({ clientId: googleClientId, clientSecret: googleClientSecret })]
      : []),
    Credentials({
      name: "Password",
      credentials: { identifier: {}, password: {} },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const identifier = parsed.data.identifier.toLowerCase();
        const user = await prisma.user.findFirst({
          where: { OR: [{ email: identifier }, { username: identifier }] },
        });
        if (!user?.passwordHash || !(await compare(parsed.data.password, user.passwordHash))) return null;

        return { id: user.id, email: user.email, name: user.name ?? user.username };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      await prisma.user.upsert({ where: { email: user.email }, update: { name: user.name, image: user.image }, create: { email: user.email, name: user.name, image: user.image } });
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        token.role = dbUser?.role ?? "PENULIS";
        token.userId = dbUser?.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.userId as string; session.user.role = token.role as "PENULIS" | "REVIEWER" | "ADMIN"; }
      return session;
    },
  },
});
