import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Sesuaikan path ke prisma client Anda
import { startOfDay, endOfDay, subDays } from 'date-fns';

export async function GET(request: Request) {
  try {
    // --- 1. Kalkulasi Data Ringkasan Utama ---
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: 'COMPLETED',
      },
    });
    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

    const totalTransactions = await prisma.order.count({
        where: {
            status: 'COMPLETED',
        },
    });

    // --- 2. Kalkulasi Tren Penjualan Harian (Contoh: 7 hari terakhir) ---
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(today, i);
        return {
            date,
            start: startOfDay(date),
            end: endOfDay(date),
        };
    }).reverse();

    const salesTrend = await Promise.all(last7Days.map(async (day) => {
        const dailySales = await prisma.order.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                status: 'COMPLETED',
                orderDate: {
                    gte: day.start,
                    lte: day.end,
                },
            },
        });
        return {
            date: day.date.toISOString().split('T')[0], // Format YYYY-MM-DD
            totalSales: Number(dailySales._sum.totalAmount) || 0,
        };
    }));

    // --- 3. Kalkulasi Produk Terlaris (Contoh: 5 produk teratas) ---
    const topProductsSold = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
            quantity: true,
        },
        where: {
            order: {
                status: 'COMPLETED',
            },
        },
        orderBy: {
            _sum: {
                quantity: 'desc',
            },
        },
        take: 5,
    });

    // Ambil detail nama produk untuk produk terlaris
    const productIds = topProductsSold.map(item => item.productId);
    const productDetails = await prisma.product.findMany({
        where: {
            id: {
                in: productIds,
            },
        },
        select: {
            id: true,
            name: true,
        },
    });

    // Gabungkan data kuantitas dengan nama produk
    const topProducts = topProductsSold.map(item => {
        const product = productDetails.find(p => p.id === item.productId);
        return {
            name: product?.name || 'Produk Tidak Ditemukan',
            quantitySold: item._sum.quantity || 0,
        };
    });

    // --- 4. Mengembalikan semua data dalam satu respons ---
    return NextResponse.json({
        data: {
            summary: {
                totalRevenue: Number(totalRevenue),
                totalTransactions,
            },
            salesTrend,
            topProducts,
        },
    });

  } catch (error: any) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data ringkasan", error: error.message },
      { status: 500 }
    );
  }
}
