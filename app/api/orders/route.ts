import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(req: Request) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        cashier: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerName, cashierId, items } = await request.json();

    if (!cashierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) throw new Error(`Product dengan id ${item.productId} tidak ditemukan`);

        const subtotal = product.sellPrice.toNumber() * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          buyPrice: product.buyPrice,
          sellPrice: product.sellPrice,
          subtotal: new Decimal(subtotal)
        });
      }

      const order = await tx.order.create({
        data: {
          customerName: customerName || null,
          cashierId,
          status: "PENDING",
          totalAmount: new Decimal(totalAmount),
          amountPaid: new Decimal(0), 
          changeAmount: new Decimal(0), 
          paymentMethod: "CASH" 
        }
      });


      const orderNumber = `ORD-${order.id.toString().padStart(3, '0')}`;
      await tx.order.update({
        where: { id: order.id },
        data: { orderNumber }
      });

      for (const item of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            buyPrice: item.buyPrice,
            sellPrice: item.sellPrice,
            subtotal: item.subtotal
          }
        });
      }

      return await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true }
      });
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
