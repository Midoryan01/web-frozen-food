import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { put } from '@vercel/blob'; 
import path from 'path'; 

// Helper function untuk sanitasi nama file
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

// GET all products 
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Handle pagination, search, filter, dan sort
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const categoryIdParam = searchParams.get('categoryId');
    const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const where: any = {
      name: {
        contains: search,
        mode: 'insensitive', // Pencarian tidak case-sensitive
      },
    };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const total = await prisma.product.count({ where });
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: products,
      meta: { total, page, limit, totalPages },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data produk', error: String(error) },
      { status: 500 }
    );
  }
}

// POST create new product 
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Mengambil semua data dari form
    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string | null;
    const buyPriceStr = formData.get('buyPrice') as string;
    const sellPriceStr = formData.get('sellPrice') as string;
    const stockStr = formData.get('stock') as string | null;
    const description = formData.get('description') as string | null;
    const expiryDateStr = formData.get('expiryDate') as string;
    const categoryIdStr = formData.get('categoryId') as string | null;
    const imageFile = formData.get('image') as File | null;

    // Validasi input
    if (!name || !buyPriceStr || !sellPriceStr || !expiryDateStr) {
      return NextResponse.json({ message: 'Data wajib tidak boleh kosong.' }, { status: 400 });
    }

    // Konversi tipe data dan validasi
    const buyPrice = parseFloat(buyPriceStr);
    const sellPrice = parseFloat(sellPriceStr);
    const stock = stockStr ? parseInt(stockStr, 10) : 0;
    const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : null;
    if (isNaN(buyPrice) || isNaN(sellPrice) || isNaN(stock) || (categoryIdStr && isNaN(categoryId!))) {
      return NextResponse.json({ message: 'Input angka tidak valid.' }, { status: 400 });
    }

    let imageUrl: string | null = null;

    // --- LOGIKA UPLOAD VERCEL BLOB DIMULAI DI SINI ---
    if (imageFile && imageFile.size > 0) {
      const sanitizedFilename = sanitizeFilename(imageFile.name);
      const fileExtension = path.extname(sanitizedFilename);
      const blobFilename = `products/${Date.now()}-${sku || 'item'}${fileExtension}`;

      // Upload file ke Vercel Blob
      const blob = await put(blobFilename, imageFile, {
        access: 'public',
      });
      // Simpan URL publiknya
      imageUrl = blob.url;
    }
    // --- AKHIR DARI LOGIKA UPLOAD VERCEL BLOB ---

    // Buat produk di database dengan SEMUA data dalam satu kali operasi
    const newProduct = await prisma.product.create({
      data: {
        name,
        sku: sku || undefined,
        buyPrice,
        sellPrice,
        stock,
        description: description || undefined,
        expiryDate: new Date(expiryDateStr),
        categoryId: categoryId || undefined,
        imageUrl: imageUrl,
      },
      include: {
        category: true,
      },
    });

    // Buat log stok jika ada stok awal
    if (stock > 0) {
      await prisma.stockLog.create({
        data: {
          productId: newProduct.id,
          quantity: stock,
          type: 'PURCHASE',
          buyPrice: buyPrice,
          userId: 1, 
          notes: 'Stok awal produk baru',
        },
      });
    }

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      return NextResponse.json({ message: 'SKU atau data unik lainnya sudah ada.', details: String(target) }, { status: 409 });
    }
    return NextResponse.json(
      { message: 'Gagal membuat produk', error: error.message || String(error) },
      { status: 500 }
    );
  }
}