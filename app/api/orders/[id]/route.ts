import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: numericId },
    include: { items: true, payment: true },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid Order ID" }, { status: 400 });
  }

  try {
    const body = await req.json();

    const updatedOrder = await prisma.order.update({
      where: { id: numericId },
      data: {
        customerId: body.customerId,
        orderDate: body.orderDate ? new Date(body.orderDate) : undefined,
        status: body.status,
        totalAmount: body.totalAmount,
      },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Failed to update or Order not found" },
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
    const deletedOrder = await prisma.order.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedOrder, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Order not found or failed to delete" },
      { status: 404 }
    );
  }
}
