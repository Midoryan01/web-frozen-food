import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Menggunakan instance Prisma bersama
import path from 'path';
import fs from 'fs/promises'; // Untuk operasi file async
import { Prisma } from '@prisma/client'; // Untuk tipe input Prisma

// Helper function untuk sanitasi nama file (jika belum ada di scope ini)
function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

// GET product by ID (tetap sama seperti sebelumnya)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
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

// PATCH update product with form-data (and optional file upload)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'ID produk tidak valid' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { message: 'Format request tidak valid', details: 'Diharapkan multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const currentProduct = await prisma.product.findUnique({
      where: { id: numericId },
      select: { imageUrl: true, sku: true, stock: true, categoryId: true }, // Ambil categoryId saat ini jika perlu
    });

    if (!currentProduct) {
      return NextResponse.json({ message: 'Produk tidak ditemukan untuk diperbarui' }, { status: 404 });
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if (formData.has('name')) updateData.name = formData.get('name') as string;
    if (formData.has('sku')) updateData.sku = formData.get('sku') as string;
    if (formData.has('buyPrice')) updateData.buyPrice = parseFloat(formData.get('buyPrice') as string);
    if (formData.has('sellPrice')) updateData.sellPrice = parseFloat(formData.get('sellPrice') as string);
    if (formData.has('stock')) updateData.stock = parseInt(formData.get('stock') as string, 10);
    if (formData.has('description')) updateData.description = formData.get('description') as string;
    if (formData.has('expiryDate')) updateData.expiryDate = new Date(formData.get('expiryDate') as string);

    // --- KOREKSI UNTUK categoryId ---
    if (formData.has('categoryId')) {
      const categoryIdStr = formData.get('categoryId') as string;
      if (categoryIdStr && categoryIdStr.trim() !== "") {
        const newCategoryId = parseInt(categoryIdStr, 10);
        if (!isNaN(newCategoryId)) {
          updateData.category = { connect: { id: newCategoryId } };
        } else {
          // Handle jika categoryIdStr tidak valid (bukan angka)
          return NextResponse.json({ message: 'Format ID Kategori tidak valid.' }, { status: 400 });
        }
      } else {
        // Jika categoryId dikirim sebagai string kosong, berarti ingin menghapus relasi kategori
        // Pastikan relasi category di model Product bersifat opsional (categoryId Int?)
        if (currentProduct.categoryId !== null) { // Hanya disconnect jika ada relasi sebelumnya
            updateData.category = { disconnect: true };
        }
      }
    }
    // --- END KOREKSI categoryId ---

    if (updateData.name === '') {
        return NextResponse.json({ message: 'Nama produk tidak boleh kosong' }, { status: 400 });
    }
    // Validasi lainnya bisa ditambahkan di sini


    let newPublicImageUrl: string | undefined = undefined;
    const imageFile = formData.get('image') as File | null;

    if (imageFile) {
      const relativeUploadDir = "/images/products";
      const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);
      await fs.mkdir(uploadDir, { recursive: true });

      const originalFilename = sanitizeFilename(imageFile.name);
      const fileExtension = path.extname(originalFilename);
      
      const skuForFilename = (updateData.sku as string) || currentProduct.sku || 'item';
      const uniqueFilename = `product-${numericId}-${sanitizeFilename(skuForFilename)}${fileExtension}`;
      
      newPublicImageUrl = path.join(relativeUploadDir, uniqueFilename).replace(/\\/g, "/");
      const filePath = path.join(uploadDir, uniqueFilename);

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      updateData.imageUrl = newPublicImageUrl;

      if (currentProduct.imageUrl && currentProduct.imageUrl !== newPublicImageUrl) {
        try {
          const oldImagePath = path.join(process.cwd(), "public", currentProduct.imageUrl);
          await fs.unlink(oldImagePath);
        } catch (unlinkError: any) {
          if (unlinkError.code !== 'ENOENT') {
            console.warn(`Gagal menghapus gambar lama (${currentProduct.imageUrl}):`, unlinkError.message);
          }
        }
      }
    } else if (formData.has('removeImage') && formData.get('removeImage') === 'true') {
        if (currentProduct.imageUrl) {
            try {
                const oldImagePath = path.join(process.cwd(), "public", currentProduct.imageUrl);
                await fs.unlink(oldImagePath);
                updateData.imageUrl = null; 
            } catch (unlinkError: any) {
                if (unlinkError.code !== 'ENOENT') {
                    console.warn(`Gagal menghapus gambar (${currentProduct.imageUrl}):`, unlinkError.message);
                } else {
                    updateData.imageUrl = null;
                }
            }
        } else {
            updateData.imageUrl = null; 
        }
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const productAfterUpdate = await tx.product.update({
        where: { id: numericId },
        data: updateData,
        include: {
          category: true,
        },
      });

      if (typeof updateData.stock === 'number' && updateData.stock !== currentProduct.stock) {
        const stockDifference = updateData.stock - currentProduct.stock;
        await tx.stockLog.create({
          data: {
            productId: productAfterUpdate.id,
            quantity: stockDifference,
            // --- KOREKSI UNTUK StockLogType ---
            type: 'ADJUSTMENT', // Gunakan nilai enum yang valid. Kuantitas akan menunjukkan arah.
            // --- END KOREKSI StockLogType ---
            buyPrice: productAfterUpdate.buyPrice, 
            userId: 1, // Ganti dengan ID user yang login
            notes: 'Penyesuaian stok melalui pembaruan produk',
          },
        });
      }
      return productAfterUpdate;
    });

    return NextResponse.json(updatedProduct, { status: 200 });

  } catch (error: any) {
    console.error('Error memperbarui produk:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('sku')) {
      return NextResponse.json({ message: 'SKU sudah ada. Gunakan SKU lain.' }, { status: 409 });
    }
    if (error.code === 'P2025') { 
        return NextResponse.json({ message: 'Produk tidak ditemukan untuk diperbarui' }, { status: 404 });
    }
    // Tangani error spesifik dari Prisma jika categoryId yang di-connect tidak ada
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025' && error.message.includes('connect')) {
            return NextResponse.json({ message: 'Kategori yang dipilih tidak ditemukan.' }, { status: 400 });
        }
    }
    return NextResponse.json(
      { message: 'Gagal memperbarui produk', error: error.message || String(error) },
      { status: 500 }
    );
  }
}

// DELETE product (tetap sama seperti sebelumnya, sudah cukup baik)
export async function DELETE(
  request: NextRequest,
    { params }: { params: Promise<{ id: string }> }

) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
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
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Produk tidak ditemukan untuk dihapus' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Gagal menghapus produk', error: error.message || String(error) },
      { status: 500 }
    );
  }
}