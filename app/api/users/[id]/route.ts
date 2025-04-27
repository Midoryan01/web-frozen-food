import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid users ID" }, { status: 400 });
  }

  const users = await prisma.user.findUnique({
    where: { id: numericId },
  });

  if (!users) {
    return NextResponse.json({ message: "users not found" }, { status: 404 });
  }

  return NextResponse.json(users);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { username, password, role } = body;

    let updatedData: any = { username, role };

    if (password) {
      // Kalau password ada di body, hash dulu
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: numericId },
      data: updatedData,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update or User not found" },
      { status: 404 }
    );
  }
}


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // Menghapus user berdasarkan ID
    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) }, // Menghapus user berdasarkan ID yang diberikan
    });

    // Mengembalikan response dengan data user yang dihapus
    return NextResponse.json(deletedUser, { status: 200 });
  } catch (error) {
    // Mengembalikan error jika user tidak ditemukan atau gagal menghapus
    return NextResponse.json(
      { error: "User not found or failed to delete" },
      { status: 404 }
    );
  }
}
