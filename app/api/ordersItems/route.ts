import prisma from '../../lib/prisma'
import { NextResponse } from "next/server";
type OrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  quantity: number;
  price: number;
};

type Product = {
  id: string;
  name: string;
};

type OrderItemWithProduct = OrderItem & {
  product: Product | null;
};

export async function GET(req: Request) {
  const orderItems = await prisma.orderItem.findMany({
    include: {
      product: {
        select: {
          name: true
        }
      }
    }
  });

  const formatted = orderItems.map((item: OrderItemWithProduct) => ({
    id: item.id,
    orderId: item.orderId,
    productName: item.product?.name,
    quantity: item.quantity,
    price: item.price
  }));

  return NextResponse.json(formatted, { status: 200 });
}
