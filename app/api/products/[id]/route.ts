import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt'; // Untuk mendapatkan info user

// Helper function untuk membersihkan nama file dari karakter yang tidak aman
function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

// GET handler (tidak diubah, disertakan untuk kelengkapan file)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const numericId = parseInt(params.id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Format ID tidak valid' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: numericId },
      include: {
        category: {select: {id: true, name: true}},
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json(product, { status: 200 });

  } catch (error) {
    console.error('Error mengambil produk:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data produk', error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler untuk memperbarui produk.
 * Menerima 'multipart/form-data' untuk menghandle update data teks dan file gambar.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validasi ID produk dari URL
    const numericId = parseInt(params.id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'ID produk tidak valid' }, { status: 400 });
    }

    // 2. Ambil data sesi pengguna untuk logging
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
        return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 });
    }
    const userId = parseInt(token.id as string, 10);


    // 3. Ambil dan validasi data dari form
    const formData = await request.formData();
    const currentProduct = await prisma.product.findUnique({
      where: { id: numericId },
    });

    if (!currentProduct) {
      return NextResponse.json({ message: 'Produk yang akan diperbarui tidak ditemukan' }, { status: 404 });
    }

    // 4. Siapkan objek data untuk pembaruan
    const updateData: Prisma.ProductUpdateInput = {};

    // Map semua field teks dari FormData ke objek updateData
    if (formData.has('name')) updateData.name = formData.get('name') as string;
    if (formData.has('sku')) updateData.sku = formData.get('sku') as string;
    if (formData.has('buyPrice')) updateData.buyPrice = parseFloat(formData.get('buyPrice') as string);
    if (formData.has('sellPrice')) updateData.sellPrice = parseFloat(formData.get('sellPrice') as string);
    if (formData.has('stock')) updateData.stock = parseInt(formData.get('stock') as string, 10);
    if (formData.has('description')) updateData.description = formData.get('description') as string;
    if (formData.has('supplier')) updateData.supplier = formData.get('supplier') as string;
    if (formData.has('expiryDate')) updateData.expiryDate = new Date(formData.get('expiryDate') as string);

    // Penanganan categoryId yang lebih aman
    if (formData.has('categoryId')) {
      const categoryIdStr = formData.get('categoryId') as string;
      // Jika categoryId ada dan merupakan angka valid, hubungkan.
      if (categoryIdStr && !isNaN(parseInt(categoryIdStr))) {
        updateData.category = { connect: { id: parseInt(categoryIdStr) } };
      } else {
        // Jika categoryId kosong atau tidak valid, putuskan hubungan.
        updateData.category = { disconnect: true };
      }
    }

    // 5. Proses upload dan penghapusan gambar
    const imageFile = formData.get('image') as File | null;
    const removeCurrentImage = formData.get('removeCurrentImage') === 'true';
    
    // Jika ada file gambar baru diupload
    if (imageFile) {
      const relativeUploadDir = "/images/products";
      const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);
      await fs.mkdir(uploadDir, { recursive: true });

      const skuForFilename = (updateData.sku as string) || currentProduct.sku || 'item';
      const uniqueFilename = `product-${numericId}-${sanitizeFilename(skuForFilename)}${path.extname(imageFile.name)}`;
      
      const newPublicImageUrl = path.join(relativeUploadDir, uniqueFilename).replace(/\\/g, "/");
      const filePath = path.join(uploadDir, uniqueFilename);

      // Simpan file baru
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      updateData.imageUrl = newPublicImageUrl;

      // Hapus gambar lama jika ada dan berbeda dari yang baru
      if (currentProduct.imageUrl && currentProduct.imageUrl !== newPublicImageUrl) {
        try {
          await fs.unlink(path.join(process.cwd(), "public", currentProduct.imageUrl));
        } catch (unlinkError: any) {
          if (unlinkError.code !== 'ENOENT') console.warn(`Gagal menghapus gambar lama: ${currentProduct.imageUrl}`);
        }
      }
    } else if (removeCurrentImage) { // Jika user memilih untuk menghapus gambar yang ada
      if (currentProduct.imageUrl) {
        try {
          await fs.unlink(path.join(process.cwd(), "public", currentProduct.imageUrl));
        } catch (unlinkError: any) {
          if (unlinkError.code !== 'ENOENT') console.warn(`Gagal menghapus gambar: ${currentProduct.imageUrl}`);
        }
      }
      updateData.imageUrl = null; // Set URL di database menjadi null
    }

    // 6. Jalankan pembaruan dalam satu transaksi database
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const productAfterUpdate = await tx.product.update({
        where: { id: numericId },
        data: updateData,
        include: { category: true }, // Sertakan kategori dalam respons
      });

      // Buat log stok hanya jika jumlah stok benar-benar berubah
      if (typeof updateData.stock === 'number' && updateData.stock !== currentProduct.stock) {
        const stockDifference = updateData.stock - currentProduct.stock;
        await tx.stockLog.create({
          data: {
            productId: productAfterUpdate.id,
            quantity: stockDifference,
            type: 'ADJUSTMENT',
            buyPrice: productAfterUpdate.buyPrice,
            userId: userId, // Gunakan ID user yang sedang login
            notes: 'Penyesuaian stok dari form edit produk.',
          },
        });
      }
      return productAfterUpdate;
    });

    return NextResponse.json(updatedProduct, { status: 200 });

  } catch (error: any) {
    console.error('Error memperbarui produk:', error);
    // Penanganan error spesifik
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (
          error.code === 'P2002' &&
          Array.isArray(error.meta?.target) &&
          error.meta.target.includes('sku')
        ) {
            return NextResponse.json({ message: 'SKU sudah ada. Gunakan SKU lain.' }, { status: 409 });
        }
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Kategori atau produk yang direferensikan tidak ditemukan.' }, { status: 404 });
        }
    }
    return NextResponse.json(
      { message: 'Gagal memperbarui produk', error: error.message || String(error) },
      { status: 500 }
    );
  }
}


// DELETE handler (tidak diubah, disertakan untuk kelengkapan file)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const numericId = parseInt(params.id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Format ID tidak valid' }, { status: 400 });
    }

    const orderItemsCount = await prisma.orderItem.count({ where: { productId: numericId } });
    if (orderItemsCount > 0) {
      return NextResponse.json(
        { message: 'Produk tidak dapat dihapus karena sudah ada dalam transaksi pesanan. Pertimbangkan untuk menonaktifkan produk.' },
        { status: 400 }
      );
    }

    const productToDelete = await prisma.product.findUnique({
      where: { id: numericId },
      select: { imageUrl: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.stockLog.deleteMany({ where: { productId: numericId } });
      await tx.product.delete({ where: { id: numericId } });

      if (productToDelete && productToDelete.imageUrl) {
        try {
          const imagePath = path.join(process.cwd(), "public", productToDelete.imageUrl);
          await fs.unlink(imagePath);
        } catch (unlinkError: any) {
          if (unlinkError.code !== 'ENOENT') {
            console.warn(`Gagal menghapus file gambar (${productToDelete.imageUrl}):`, unlinkError.message);
          }
        }
      }
    });

    return NextResponse.json({ message: 'Produk berhasil dihapus' });

  } catch (error: any) {
    console.error('Error menghapus produk:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Produk tidak ditemukan untuk dihapus' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Gagal menghapus produk', error: error.message || String(error) },
      { status: 500 }
    );
  }
}
