import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs' 

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const numericId = Number(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ message: 'Invalid users ID' }, { status: 400 })
  }

  const users = await prisma.user.findUnique({
    where: { id: numericId },
  })

  if (!users) {
    return NextResponse.json({ message: 'users not found' }, { status: 404 })
  }

  return NextResponse.json(users)
}





export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  // Mengambil ID dari URL

  try {
    // Menghapus user berdasarkan ID
    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) },  // Menghapus user berdasarkan ID yang diberikan
    });

    // Mengembalikan response dengan data user yang dihapus
    return NextResponse.json(deletedUser, { status: 200 });
  } catch (error) {
    // Mengembalikan error jika user tidak ditemukan atau gagal menghapus
    return NextResponse.json({ error: 'User not found or failed to delete' }, { status: 404 });
  }
}