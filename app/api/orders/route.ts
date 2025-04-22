import { NextResponse } from 'next/server'
import prisma from '../../lib/prisma'

export async function GET(req: Request) {
  const orders = await prisma.product.findMany()
  return NextResponse.json(orders, { status: 200 })
}