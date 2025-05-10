import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany();
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
  const { username, password, role, fullName } = await req.json(); // Mengambil data dari body request

  // Validasi input
  if (!username || !password || !role) {
    return NextResponse.json(
      { error: "Username, password, and role are required" },
      { status: 400 }
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); 

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword, 
        role, // ADMIN atau KASIR
        fullName: fullName || "", 
      },
    });

    return NextResponse.json(newUser, { status: 201 }); // Mengirimkan user yang baru dibuat
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
