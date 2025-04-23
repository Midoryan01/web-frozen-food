import NextAuth from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      username: string;
      role: Role;
    };
  }

  interface User {
    id: number;
    username: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    username: string;
    role: Role;
  }
}
