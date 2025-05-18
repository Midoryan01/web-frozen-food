import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

// PATCH update user
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { username, password, role, fullName } = await req.json(); // Mengambil data dari body request

  // Validasi input jika ada
  if (!username && !password && !role) {
    return NextResponse.json(
      { error: "At least one of username, password, or role is required" },
      { status: 400 }
    );
  }

  try {
    const userId = parseInt(params.id); // Mengambil userId dari URL parameter
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Mencari user yang akan diupdate
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update password jika ada
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Hash password baru
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username || existingUser.username, 
        password: hashedPassword || existingUser.password, 
        role: role || existingUser.role, 
        fullName: fullName || existingUser.fullName,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 }); // Mengirimkan user yang telah diperbarui
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
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

    console.log("User deleted successfully:", deletedUser);

    // Mengirimkan response dengan pesan bahwa user telah berhasil dihapus
    return NextResponse.json(
      { message: `User with ID ${id} has been successfully deleted` },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "User not found or failed to delete" },
      { status: 404 }
    );
  }
}
