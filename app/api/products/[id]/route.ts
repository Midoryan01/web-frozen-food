import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

// GET /api/products/:id
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const numericId = Number(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id: numericId },
  })

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}
// PUT /api/products/:id
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const numericId = Number(id)
  const body = await req.json()

  if (isNaN(numericId)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 })
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: numericId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.price && { price: body.price }),
        ...(body.stock && { stock: body.stock }),
        ...(body.description !== undefined && { description: body.description }),
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    return NextResponse.json({ message: 'Update failed or product not found', error }, { status: 404 })
  }
}

// DELETE /api/products/:id
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const numericId = Number(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 })
  }

  try {
    await prisma.product.delete({
      where: { id: numericId },
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Delete failed or product not found', error }, { status: 404 })
  }
}
