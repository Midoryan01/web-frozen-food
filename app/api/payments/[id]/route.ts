import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid payment ID" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: numericId },
  });

  if (!payment) {
    return NextResponse.json({ message: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json(payment);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await req.json();

    // Misal: update Payment
    const updatedPayment = await prisma.payment.update({
      where: { id: numericId },
      data: {
        orderId: body.orderId,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
        amount: body.amount,
        method: body.method,
        status: body.status,
      },
    });

    return NextResponse.json(updatedPayment, { status: 200 });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { message: "Failed to update or payment not found" },
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
    const deletedPayment = await prisma.payment.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedPayment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Payment not found or failed to delete" },
      { status: 404 }
    );
  }
}
