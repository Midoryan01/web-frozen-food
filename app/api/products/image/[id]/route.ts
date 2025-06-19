import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Sesuaikan path jika berbeda
import path from "path";
import fs from "fs/promises";


// Helper function untuk sanitasi nama file (jika belum ada di file ini)
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

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
    const imageFile = formData.get('image') as File | null;

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

    const productData: any = {
      name,
      sku: sku || undefined,
      buyPrice,
      sellPrice,
      stock,
      description: description || undefined,
      expiryDate: new Date(expiryDateStr),
      categoryId: categoryId || undefined,
      imageUrl: null, 
    };

    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: productData,
        include: {
          category: true,
        },
      });

      let finalImageUrl: string | null = null;

      if (imageFile) {
        const relativeUploadDir = "/images/products"; 
        const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);

        await fs.mkdir(uploadDir, { recursive: true }); // Memastikan /public/images/products ada

        const originalFilename = sanitizeFilename(imageFile.name);
        const fileExtension = path.extname(originalFilename);
        

        const skuPartForFilename = product.sku ? sanitizeFilename(product.sku) : 'item';
        const uniqueFilename = `product-${product.id}-${skuPartForFilename}${fileExtension}`;

        const filePath = path.join(uploadDir, uniqueFilename);
        finalImageUrl = path.join(relativeUploadDir, uniqueFilename).replace(/\\/g, "/");

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        const updatedProductWithImage = await tx.product.update({
          where: { id: product.id },
          data: { imageUrl: finalImageUrl },
          include: {
            category: true,
          },
        });

        if (stock > 0) {
          await tx.stockLog.create({
            data: {
              productId: product.id,
              quantity: stock,
              type: 'PURCHASE',
              buyPrice: buyPrice,
              userId: 1, 
              notes: 'Stok awal produk baru',
            },
          });
        }
        return updatedProductWithImage;
      }

      // Jika tidak ada gambar, tapi ada stok awal
      if (stock > 0) {
        await tx.stockLog.create({
          data: {
            productId: product.id,
            quantity: stock,
            type: 'PURCHASE',
            buyPrice: buyPrice,
            userId: 1, 
            notes: 'Stok awal produk baru (tanpa gambar)',
          },
        });
      }
      return product; // Kembalikan produk (mungkin tanpa imageUrl jika tidak ada file)
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && (target as string[]).includes('sku')) {
        return NextResponse.json({ message: 'SKU sudah ada. Gunakan SKU lain.' }, { status: 409 });
      }
      return NextResponse.json({ message: 'Data duplikat.', details: String(target) }, { status: 409 });
    }
    return NextResponse.json(
      { message: 'Gagal membuat produk', error: error.message || String(error) },
      { status: 500 }
    );
  }
}