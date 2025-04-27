import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid order item ID" }, { status: 400 });
  }

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: numericId },
    include: { product: true },
  });

  if (!orderItem) {
    return NextResponse.json({ message: "Order item not found" }, { status: 404 });
  }

  return NextResponse.json(orderItem);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid OrderItem ID" }, { status: 400 });
  }

  try {
    const body = await req.json();

    const updatedOrderItem = await prisma.orderItem.update({
      where: { id: numericId },
      data: {
        orderId: body.orderId,
        productId: body.productId,
        quantity: body.quantity,
        price: body.price,
      },
    });

    return NextResponse.json(updatedOrderItem, { status: 200 });
  } catch (error) {
    console.error("Error updating order item:", error);
    return NextResponse.json(
      { message: "Failed to update or OrderItem not found" },
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
    const deletedOrderItem = await prisma.orderItem.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedOrderItem, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Order item not found or failed to delete" },
      { status: 404 }
    );
  }
}
