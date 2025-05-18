import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: {
        order: true,
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });
    return NextResponse.json(orderItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching order items:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      orderId, 
      productId, 
      quantity, 
      buyPrice, 
      sellPrice 
    } = await req.json();

    // Validasi input dasar
    if (!orderId || !productId || !quantity || !buyPrice || !sellPrice) {
      return NextResponse.json(
        { error: "All fields are required: orderId, productId, quantity, buyPrice, sellPrice" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    // Verifikasi order dan product ada
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Hitung subtotal
    const subtotal = quantity * Number(sellPrice);

    // Buat order item dengan transaksi untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      // Buat order item
      const orderItem = await tx.orderItem.create({
        data: {
          orderId,
          productId,
          quantity,
          buyPrice,
          sellPrice,
          subtotal,
        },
        include: {
          order: true,
          product: true,
        },
      });

      // Update total amount di order
      const updatedTotalAmount = Number(order.totalAmount) + subtotal;
      await tx.order.update({
        where: { id: orderId },
        data: {
          totalAmount: updatedTotalAmount,
        },
      });

      // Jika order sudah COMPLETED, update stok produk dan buat stockLog
      if (order.status === "COMPLETED") {
        // Update stok produk
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });

        // Buat stock log
        await tx.stockLog.create({
          data: {
            productId,
            quantity: -quantity, // Negatif karena barang keluar
            type: "SALE",
            buyPrice,
            userId: order.cashierId,
            notes: `Sale from order #${order.orderNumber}`,
          },
        });
      }

      return orderItem;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating order item:", error);
    return NextResponse.json(
      { error: "Failed to create order item" },
      { status: 500 }
    );
  }
}