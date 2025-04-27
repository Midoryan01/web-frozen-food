import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const orders = await prisma.product.findMany();
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newOrder = await prisma.order.create({
      data: {
        customerId: body.customerId,
        orderDate: body.orderDate ? new Date(body.orderDate) : undefined,
        status: body.status || "Pending",
        totalAmount: body.totalAmount,
        items: {
          create: body.items, // Menambahkan OrderItems terkait
        },
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}