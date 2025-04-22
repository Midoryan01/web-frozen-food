import { NextResponse } from 'next/server'
import prisma from '../../lib/prisma'

export async function GET(req: Request) {
  const payments = await prisma.payment.findMany()
  return NextResponse.json(payments, { status: 200 })
}