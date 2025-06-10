import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../lib/prisma"; // Pastikan path ini benar
import bcrypt from "bcryptjs";

// Fungsi untuk memilih field yang aman untuk dikembalikan ke client
const selectUserFields = {
    id: true,
    username: true,
    fullName: true,
    role: true,
    createdAt: true,
    updatedAt: true,
};

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany({
      // ✅ KEAMANAN: Hanya pilih field yang aman, jangan kirim password hash
      select: selectUserFields,
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, password, role, fullName } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Username, password, and role are required" },
        { status: 400 }
      );
    }
    
    // ✅ PENINGKATAN: Cek jika username sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
        return NextResponse.json(
            { error: "Username already exists" },
            { status: 409 } // 409 Conflict lebih cocok
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        fullName: fullName || "",
      },
      // ✅ KEAMANAN: Pilih field yang aman untuk dikembalikan
      select: selectUserFields,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}