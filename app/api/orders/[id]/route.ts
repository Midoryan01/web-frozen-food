import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: numericId },
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

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const {
      customerName,
      status,
      amountPaid,
      paymentMethod,
    } = await req.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id: numericId },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isCompletingOrder = existingOrder.status !== "COMPLETED" && status === "COMPLETED";
    const isCancellingCompletedOrder = existingOrder.status === "COMPLETED" && status === "CANCELLED";

    if (isCompletingOrder) {
      if (typeof amountPaid !== 'number' || amountPaid < existingOrder.totalAmount.toNumber()) {
        return NextResponse.json(
          { error: "Amount paid must be at least equal to total amount" },
          { status: 400 }
        );
      }
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (isCompletingOrder) {
        for (const item of existingOrder.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!product) throw new Error(`Product dengan id ${item.productId} tidak ditemukan`);
          if (product.stock < item.quantity) throw new Error(`Stok product ${product.name} tidak mencukupi`);

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });

          await tx.stockLog.create({
            data: {
              productId: item.productId,
              quantity: -item.quantity,
              type: "SALE",
              buyPrice: item.buyPrice,
              userId: existingOrder.cashierId,
              notes: `Sale from order #${existingOrder.orderNumber}`,
            },
          });
        }
      }

      if (isCancellingCompletedOrder) {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });

          await tx.stockLog.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: "ADJUSTMENT",
              buyPrice: item.buyPrice,
              userId: existingOrder.cashierId,
              notes: `Cancelled order #${existingOrder.orderNumber}`,
            },
          });
        }
      }

      return await tx.order.update({
        where: { id: numericId },
        data: {
          customerName: customerName ?? existingOrder.customerName,
          status: status ?? existingOrder.status,
          amountPaid: amountPaid ?? existingOrder.amountPaid,
          changeAmount: amountPaid
            ? new Decimal(amountPaid).minus(existingOrder.totalAmount)
            : existingOrder.changeAmount,
          paymentMethod: paymentMethod ?? existingOrder.paymentMethod,
        },
        include: {
          items: { include: { product: true } },
          cashier: true
        }
      });
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}



export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
  }

  try {
    // Cari order terlebih dahulu untuk memastikan ada
    const existingOrder = await prisma.order.findUnique({
      where: { id: numericId },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Hapus order dengan transaksi untuk menjaga konsistensi data
    await prisma.$transaction(async (tx) => {
      // Hapus order items terlebih dahulu (sebenarnya tidak perlu karena onDelete: Cascade)
      await tx.orderItem.deleteMany({
        where: { orderId: numericId },
      });

      // Kemudian hapus order
      await tx.order.delete({
        where: { id: numericId },
      });
      
      // Jika order status COMPLETED, kembalikan stok
      if (existingOrder.status === "COMPLETED") {
        for (const item of existingOrder.items) {
          // Buat stock log untuk setiap item
          await tx.stockLog.create({
            data: {
              productId: item.productId,
              quantity: item.quantity, // Positif karena barang kembali
              type: "ADJUSTMENT",
              buyPrice: item.buyPrice,
              userId: existingOrder.cashierId,
              notes: `Deleted order #${existingOrder.orderNumber}`,
            },
          });

          // Update stok produk
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    });

    return NextResponse.json(
      { message: `Order with ID ${id} has been successfully deleted` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}