import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; 
import path from 'path';
import fs from 'fs/promises';

// Helper function untuk sanitasi nama file (opsional tapi direkomendasikan)
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

// GET all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Handle pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Handle search
    const search = searchParams.get('search') || '';

    // Handle category filter
    const categoryIdParam = searchParams.get('categoryId');
    const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;

    // Handle sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'; 

    // Base query conditions
    const where: any = {
      name: {
        contains: search 
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
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit,
    });



    return NextResponse.json({
      data: products, // Langsung kirim produk karena imageUrl sudah string
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data produk', error: String(error) },
      { status: 500 }
    );
  }
}

// POST create new product - handle form-data and image upload to filesystem
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { message: 'Format request tidak valid', details: 'Diharapkan multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string | null;
    const buyPriceStr = formData.get('buyPrice') as string;
    const sellPriceStr = formData.get('sellPrice') as string;
    const stockStr = formData.get('stock') as string | null;
    const description = formData.get('description') as string | null;
    const expiryDateStr = formData.get('expiryDate') as string;
    const categoryIdStr = formData.get('categoryId') as string | null;
    const imageFile = formData.get('image') as File | null; // 'image' adalah nama field dari form

    if (!name || !buyPriceStr || !sellPriceStr || !expiryDateStr) {
      return NextResponse.json(
        { message: 'Nama, harga beli, harga jual, dan tanggal kedaluwarsa wajib diisi.' },
        { status: 400 }
      );
    }

    const buyPrice = parseFloat(buyPriceStr);
    const sellPrice = parseFloat(sellPriceStr);
    const stock = stockStr ? parseInt(stockStr, 10) : 0;
    const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : null;

    if (isNaN(buyPrice) || isNaN(sellPrice)) {
      return NextResponse.json(
        { message: 'Harga beli dan harga jual harus angka yang valid.' },
        { status: 400 }
      );
    }
    if (stockStr && isNaN(stock)) {
        return NextResponse.json(
            { message: 'Stok harus angka yang valid.' },
            { status: 400 }
        );
    }
    if (categoryIdStr && isNaN(categoryId!)) { // Pemeriksaan NaN jika categoryIdStr ada tapi tidak valid
        return NextResponse.json(
            { message: 'ID Kategori tidak valid.' },
            { status: 400 }
        );
    }


    // Data produk awal (tanpa imageUrl, akan diupdate setelah gambar disimpan)
    const productData: any = {
      name,
      sku: sku || undefined,
      buyPrice,
      sellPrice,
      stock, // Stok awal akan dicatat di StockLog
      description: description || undefined,
      expiryDate: new Date(expiryDateStr),
      categoryId: categoryId || undefined,
      imageUrl: null, // Default null, akan diisi jika ada gambar
    };

    const newProduct = await prisma.$transaction(async (tx) => {
      // 1. Buat produk di database (tanpa imageUrl dulu)
      const product = await tx.product.create({
        data: productData,
        include: { // Include relasi yang mungkin dibutuhkan setelah create
          category: true,
        },
      });

      let finalImageUrl: string | null = null;

      // 2. Jika ada file gambar, simpan ke filesystem dan update produk
      if (imageFile) {
        const relativeUploadDir = "/images/products"; 
        const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);

        await fs.mkdir(uploadDir, { recursive: true });

        const skuPartForFilename = product.sku ? sanitizeFilename(product.sku) : 'item';
        const originalFilename = sanitizeFilename(imageFile.name);
        const fileExtension = path.extname(originalFilename);
        const uniqueFilename = `product-${product.id}-${skuPartForFilename}${fileExtension}`;
        const filePath = path.join(uploadDir, uniqueFilename);
        finalImageUrl = path.join(relativeUploadDir, uniqueFilename).replace(/\\/g, "/"); // Path untuk URL

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        // Update produk dengan imageUrl
        const updatedProductWithImage = await tx.product.update({
          where: { id: product.id },
          data: { imageUrl: finalImageUrl },
          include: { // Re-include relasi jika perlu
            category: true,
          },
        });

         // Jika stok awal > 0, buat entri StockLog
        if (stock > 0) {
            await tx.stockLog.create({
            data: {
                productId: product.id,
                quantity: stock,
                type: 'PURCHASE', // Gunakan enum jika sudah didefinisikan
                buyPrice: buyPrice,
                // TODO: Dapatkan userId dari sesi atau token autentikasi
                userId: 1, // Placeholder, ganti dengan ID user yang login
                notes: 'Stok awal produk baru',
            },
            });
        }
        return updatedProductWithImage; // Kembalikan produk yang sudah diupdate dengan imageUrl
      }


      // Jika tidak ada gambar, tapi ada stok awal > 0, tetap buat entri StockLog
      if (stock > 0) {
        await tx.stockLog.create({
          data: {
            productId: product.id,
            quantity: stock,
            type: 'PURCHASE',
            buyPrice: buyPrice,
            userId: 1, // Placeholder
            notes: 'Stok awal produk baru (tanpa gambar)',
          },
        });
      }
      // Jika tidak ada gambar, kembalikan produk yang dibuat tanpa imageUrl
      return product;
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') { // Kode error Prisma untuk unique constraint violation
      // Cek field mana yang menyebabkan error (misal, SKU)
      const target = error.meta?.target;
      if (target && target.includes('sku')) {
        return NextResponse.json({ message: 'SKU sudah ada. Gunakan SKU lain.' }, { status: 409 }); // 409 Conflict
      }
      return NextResponse.json({ message: 'Data duplikat.', details: String(target) }, { status: 409 });
    }
    return NextResponse.json(
      { message: 'Gagal membuat produk', error: error.message || String(error) },
      { status: 500 }
    );
  }
}