// next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

import NextAuth, { DefaultSession } from "next-auth";

    // this process is know as module augmentation
    declare module "next-auth" {
      interface Session {
        user: {
          id: string;
        } & DefaultSession["user"];
      }
    }

export declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      role?: string | null;
    } & DefaultSession["user"]
  }

  // Menambahkan role ke tipe User
  interface User {
    role?: string | null;
  }
}

export declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    role?: string | null;
  }
}

export declare module 'next-auth' {}