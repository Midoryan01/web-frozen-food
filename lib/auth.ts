// lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "./prisma";
import type { NextAuthOptions } from "next-auth"; // Menggunakan tipe yang sesuai dengan v4

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Pastikan kredensial username dan password ada
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        // Cari pengguna berdasarkan username unik
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        // Periksa apakah pengguna ada, memiliki password, dan akunnya aktif
        if (!user || !user.password || !user.isActive) {
          return null;
        }

        // Verifikasi password
        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        // Jika semua valid, kembalikan objek user untuk sesi
        // Pastikan field ini ada di model Prisma dan tipe User di next-auth.d.ts
        return {
          id: user.id.toString(),
          username: user.username,
          role: user.role,
          fullName: user.fullName,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Callback jwt dipanggil saat token dibuat (saat login)
    async jwt({ token, user }) {
      // Objek `user` hanya tersedia saat pertama kali login
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = user.role;
        token.fullName = (user as any).fullName;
      }
      return token;
    },
    // Callback session dipanggil saat sesi diakses oleh client
    async session({ session, token }) {
      // Pindahkan data dari token ke objek sesi agar tersedia di client
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.fullName = token.fullName as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
