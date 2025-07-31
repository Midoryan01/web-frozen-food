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
    const {
      customerName,
      cashierId,
      items,
      paymentMethod,
      amountPaid
    } = await request.json();

    // Validasi input
    if (!cashierId || !Array.isArray(items) || items.length === 0 || !paymentMethod || !amountPaid) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    // Mulai transaksi
    const newOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = new Decimal(0);

      // Hitung total belanja
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Produk ID ${item.productId} tidak ditemukan.`);
        if (product.stock < item.quantity) throw new Error(`Stok tidak cukup untuk produk ${product.name}.`);

        const subtotal = product.sellPrice.mul(new Decimal(item.quantity));
        totalAmount = totalAmount.add(subtotal);
      }

      // Hitung kembalian
      const changeAmount = new Decimal(amountPaid).sub(totalAmount);
      if (changeAmount.lessThan(0)) throw new Error("Jumlah pembayaran kurang dari total belanja.");

      // Buat Order
      const order = await tx.order.create({
        data: {
          customerName: customerName || "Walk-in",
          cashierId: parseInt(cashierId),
          status: "COMPLETED",
          totalAmount,
          amountPaid: new Decimal(amountPaid),
          changeAmount,
          paymentMethod
        }
      });

      // Buat nomor order
      const orderNumber = `ORD-${order.id.toString().padStart(5, "0")}`;
      await tx.order.update({ where: { id: order.id }, data: { orderNumber } });

      // Tambahkan OrderItem & StockLog per item
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        const subtotal = product.sellPrice.mul(new Decimal(item.quantity));

        // OrderItem
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity,
            buyPrice: product.buyPrice,
            sellPrice: product.sellPrice,
            subtotal
          }
        });

        // Update stok produk
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        // Buat StockLog
        await tx.stockLog.create({
          data: {
            productId: product.id,
            quantity: -item.quantity,
            type: "SALE",
            userId: parseInt(cashierId),
            buyPrice: product.buyPrice,
            notes: `Penjualan melalui order #${orderNumber}`
          }
        });
      }

      return await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true }
      });
    }, {
      maxWait: 10000, 
      timeout: 15000  
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Gagal membuat pesanan:", error);
    return NextResponse.json({ error: error.message || "Server error." }, { status: 500 });
  }
}