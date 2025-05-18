import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid order item ID" }, { status: 400 });
  }

  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: numericId },
      include: {
        order: true,
        product: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json({ message: "Order item not found" }, { status: 404 });
    }

    return NextResponse.json(orderItem);
  } catch (error) {
    console.error("Error fetching order item:", error);
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
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid order item ID" }, { status: 400 });
  }

  try {
    const { quantity, sellPrice } = await req.json();

    // Validasi
    if (quantity !== undefined && quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    // Mencari order item yang akan diupdate
    const existingOrderItem = await prisma.orderItem.findUnique({
      where: { id: numericId },
      include: {
        order: true,
      },
    });

    if (!existingOrderItem) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    // Cek apakah order masih bisa diupdate (hanya order PENDING yang bisa diupdate)
    if (existingOrderItem.order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cannot update items for non-PENDING orders" },
        { status: 400 }
      );
    }

    // Hitung subtotal baru jika quantity atau price berubah
    const newQuantity = quantity ?? existingOrderItem.quantity;
    const newSellPrice = sellPrice ?? existingOrderItem.sellPrice;
    const newSubtotal = newQuantity * Number(newSellPrice);

    // Hitung selisih dengan subtotal lama untuk update total order
    const subtotalDifference = newSubtotal - Number(existingOrderItem.subtotal);

    // Update order item dengan transaksi untuk menjaga konsistensi data
    const updatedOrderItem = await prisma.$transaction(async (tx) => {
      // Update order item
      const orderItem = await tx.orderItem.update({
        where: { id: numericId },
        data: {
          quantity: newQuantity,
          sellPrice: newSellPrice,
          subtotal: newSubtotal,
        },
        include: {
          order: true,
          product: true,
        },
      });

      // Update total amount di order
      if (subtotalDifference !== 0) {
        await tx.order.update({
          where: { id: existingOrderItem.orderId },
          data: {
            totalAmount: {
              increment: subtotalDifference,
            },
          },
        });
      }

      return orderItem;
    });

    return NextResponse.json(updatedOrderItem, { status: 200 });
  } catch (error) {
    console.error("Error updating order item:", error);
    return NextResponse.json(
      { error: "Failed to update order item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid order item ID" }, { status: 400 });
  }

  try {
    // Cari order item terlebih dahulu untuk mendapatkan informasi yang diperlukan
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: numericId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
      );
    }

    // Cek apakah order masih bisa diupdate (hanya order PENDING yang bisa diupdate itemnya)
    if (orderItem.order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cannot delete items from non-PENDING orders" },
        { status: 400 }
      );
    }

    // Hapus order item dengan transaksi untuk menjaga konsistensi data
    await prisma.$transaction(async (tx) => {
      // Hapus order item
      await tx.orderItem.delete({
        where: { id: numericId },
      });

      // Update total amount di order
      await tx.order.update({
        where: { id: orderItem.orderId },
        data: {
          totalAmount: {
            decrement: orderItem.subtotal,
          },
        },
      });
    });

    return NextResponse.json(
      { message: `Order item with ID ${id} has been successfully deleted` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order item:", error);
    return NextResponse.json(
      { error: "Failed to delete order item" },
      { status: 500 }
    );
  }
}