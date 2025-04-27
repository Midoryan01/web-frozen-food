// app/api/products/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json();

  const { name, price, stock, description } = body;

  // Validasi input
  if (!name || !price || !stock) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  // Membuat produk baru
  const newProduct = await prisma.product.create({
    data: {
      name,
      price,
      stock,
      description, // opsional, tergantung input
    },
  });

  return NextResponse.json(newProduct, { status: 201 });
}

// Method yang tidak diizinkan
export async function METHOD_NOT_ALLOWED(req: Request) {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
