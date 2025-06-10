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

// Handler untuk membuat pesanan baru
export async function POST(request: NextRequest) {
  try {
    const { customerName, cashierId, items, totalAmount, paymentMethod, amountPaid, changeAmount } = await request.json();

    // Validasi data input
    if (!cashierId || !items || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
      return NextResponse.json({ error: "Data permintaan tidak valid atau tidak lengkap." }, { status: 400 });
    }

    // Memulai transaksi database untuk memastikan konsistensi data
    const newOrder = await prisma.$transaction(async (tx) => {
      // Langkah 1: Buat entri Order utama
      const order = await tx.order.create({
        data: {
          customerName: customerName || 'Walk-in', // Default customer name
          cashierId,
          status: "COMPLETED", // Langsung set status COMPLETED karena pembayaran terjadi saat ini juga
          totalAmount: new Decimal(totalAmount),
          amountPaid: new Decimal(amountPaid || 0), 
          changeAmount: new Decimal(changeAmount || 0), 
          paymentMethod: paymentMethod,
        }
      });

      // Langkah 2: Buat nomor pesanan yang mudah dibaca
      const orderNumber = `ORD-${order.id.toString().padStart(5, '0')}`;
      await tx.order.update({
        where: { id: order.id },
        data: { orderNumber }
      });

      // Langkah 3: Iterasi setiap item, buat OrderItem, dan kurangi stok produk
      for (const item of items) {
        // Ambil data produk terbaru untuk memastikan harga dan stok akurat
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
        if (product.stock < item.quantity) throw new Error(`Stok untuk produk "${product.name}" tidak mencukupi.`);
        
        // Buat OrderItem
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            buyPrice: product.buyPrice,   // Simpan harga beli saat transaksi
            sellPrice: product.sellPrice, // Simpan harga jual saat transaksi
            subtotal: new Decimal(product.sellPrice.toNumber() * item.quantity)
          }
        });

        // Kurangi stok produk
        await tx.product.update({
            where: { id: item.productId },
            data: {
                stock: {
                    decrement: item.quantity
                }
            }
        });
      }

      // Langkah 4: Kembalikan data pesanan yang sudah lengkap
      return await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true } // Sertakan item yang baru dibuat dalam respons
      });
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Gagal membuat pesanan:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses pesanan di server." }, { status: 500 });
  }
}