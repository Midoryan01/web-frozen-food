import NextAuth from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma"; // Pastikan path ini benar

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        // Pastikan pengguna ada dan memiliki password
        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        // Jika berhasil, kembalikan objek yang akan digunakan di token/sesi
        return {
          id: user.id.toString(),
          name: user.fullName, 
          role: user.role,
          username: user.username,
          fullName: user.fullName,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Saat login, pindahkan semua data kustom dari 'user' ke 'token'
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.fullName = (user as any).fullName;
        // 'name' sudah otomatis ditangani oleh NextAuth jika ada di objek user
      }
      return token;
    },
    async session({ session, token }) {
      // Saat sesi diakses, pindahkan data kustom dari 'token' ke 'session.user'
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.fullName = token.fullName as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
