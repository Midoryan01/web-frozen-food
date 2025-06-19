import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const stockLogs = await prisma.stockLog.findMany({
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
    return NextResponse.json(stockLogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching stock logs:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productId, quantity, type, buyPrice, userId, notes } = await req.json();

    // Validasi input dasar
    if (!productId || quantity === undefined || !type || !userId) {
      return NextResponse.json(
        { error: "Required fields: productId, quantity, type, userId" },
        { status: 400 }
      );
    }

    // Validasi tipe
    const validTypes = ["PURCHASE", "SALE", "ADJUSTMENT"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Type must be one of: PURCHASE, SALE, ADJUSTMENT" },
        { status: 400 }
      );
    }

    // Verifikasi product dan user ada
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Validasi khusus untuk tipe tertentu
    if (type === "PURCHASE" && !buyPrice) {
      return NextResponse.json(
        { error: "Buy price is required for PURCHASE type" },
        { status: 400 }
      );
    }

    // Verifikasi stok tidak akan negatif
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      return NextResponse.json(
        { error: "Not enough stock. Current stock: " + product.stock },
        { status: 400 }
      );
    }

    // Buat stock log dengan transaksi untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      // Buat stock log
      const stockLog = await tx.stockLog.create({
        data: {
          productId,
          quantity,
          type,
          buyPrice: buyPrice || null,
          userId,
          notes: notes || null,
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

      // Update stok produk
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
          // Jika PURCHASE, update harga beli terbaru
          ...(type === "PURCHASE" && { buyPrice }),
        },
      });

      return stockLog;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating stock log:", error);
    return NextResponse.json(
      { error: "Failed to create stock log" },
      { status: 500 }
    );
  }
}