import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          console.log('❌ credentials kosong');
          return null;
        }
      
        console.log("📥 credentials:", credentials);
      
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
      
        if (!user) {
          console.log("❌ User tidak ditemukan");
          return null;
        }
      
        const isValid = await compare(credentials.password, user.password ?? '');
        console.log("🔐 valid password:", isValid);
      
        if (!isValid) return null;
      
        return {
          id: user.id,
          username: user.username,
          role: user.role,
        };
      }           
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // pastikan ada di .env
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
