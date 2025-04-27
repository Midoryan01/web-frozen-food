import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const orderItems = await prisma.orderItem.findMany({
      select: {
        id: true,
        orderId: true,
        productId: true,
        quantity: true,
        price: true,
        product: {
          select: {
            id: true,
            name: true,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newOrderItem = await prisma.orderItem.create({
      data: {
        orderId: body.orderId,
        productId: body.productId,
        quantity: body.quantity,
        price: body.price,
      },
    });

    return NextResponse.json(newOrderItem, { status: 201 });
  } catch (error) {
    console.error("Error creating order item:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}