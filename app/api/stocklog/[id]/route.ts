import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid stock log ID" }, { status: 400 });
  }

  try {
    const stockLog = await prisma.stockLog.findUnique({
      where: { id: numericId },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    if (!stockLog) {
      return NextResponse.json({ message: "Stock log not found" }, { status: 404 });
    }

    return NextResponse.json(stockLog);
  } catch (error) {
    console.error("Error fetching stock log:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid stock log ID" }, { status: 400 });
  }

  try {
    const { notes } = await req.json();

    // Mencari stock log yang akan diupdate
    const existingStockLog = await prisma.stockLog.findUnique({
      where: { id: numericId },
    });

    if (!existingStockLog) {
      return NextResponse.json({ error: "Stock log not found" }, { status: 404 });
    }

    // Hal ini untuk mencegah inkonsistensi data stok
    const updatedStockLog = await prisma.stockLog.update({
      where: { id: numericId },
      data: {
        notes: notes ?? existingStockLog.notes,
      },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(updatedStockLog, { status: 200 });
  } catch (error) {
    console.error("Error updating stock log:", error);
    return NextResponse.json(
      { error: "Failed to update stock log" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid stock log ID" }, { status: 400 });
  }

  try {
    // Cari stock log terlebih dahulu untuk mendapatkan informasi yang diperlukan
    const stockLog = await prisma.stockLog.findUnique({
      where: { id: numericId },
      include: {
        product: true,
      },
    });

    if (!stockLog) {
      return NextResponse.json(
        { error: "Stock log not found" },
        { status: 404 }
      );
    }

    // Hapus stock log dengan transaksi untuk menjaga konsistensi data
    await prisma.$transaction(async (tx) => {
      // Hapus stock log
      await tx.stockLog.delete({
        where: { id: numericId },
      });

      // Kembalikan stok ke kondisi sebelumnya (balikkan quantity)
      await tx.product.update({
        where: { id: stockLog.productId },
        data: {
          stock: {
            decrement: stockLog.quantity, // Karena kita ingin membalikkan efek
          },
        },
      });

      // Tambahkan log baru untuk pencatatan pembalikan ini
      await tx.stockLog.create({
        data: {
          productId: stockLog.productId,
          quantity: -stockLog.quantity, // Membalikkan quantity
          type: "ADJUSTMENT",
          userId: stockLog.userId,
          notes: `Reversal of deleted stock log #${stockLog.id}`,
        },
      });
    });

    return NextResponse.json(
      { message: `Stock log with ID ${id} has been successfully deleted and reversed` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting stock log:", error);
    return NextResponse.json(
      { error: "Failed to delete stock log" },
      { status: 500 }
    );
  }
}