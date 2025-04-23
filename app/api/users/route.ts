import { NextResponse, NextRequest } from 'next/server'
import prisma from '../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
  const users = await prisma.user.findMany()
  return NextResponse.json(users, { status: 200 })
}

export async function POST(req: NextRequest) {
  const { username, password, role } = await req.json(); // Mengambil data dari body request

  // Validasi input
  if (!username || !password || !role) {
    return NextResponse.json({ error: 'Username, password, and role are required' }, { status: 400 });
  }

  try {
    // Hash password sebelum menyimpannya
    const hashedPassword = await bcrypt.hash(password, 10); // 10 adalah salt rounds

    // Membuat user baru dengan password yang sudah di-hash
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,  // Menyimpan password yang sudah di-hash
        role, // ADMIN atau KASIR
      },
    });

    return NextResponse.json(newUser, { status: 201 });  // Mengirimkan user yang baru dibuat
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}