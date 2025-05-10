import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// GET product by ID
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { image, ...productWithoutImage } = product;
    const formattedProduct = {
      ...productWithoutImage,
      imageUrl: `/api/products/image/${product.id}`
    };

    return NextResponse.json(formattedProduct, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

  // PATCH update product with form-data (file upload)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Receiving form data request');
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    // Check if this is a multipart form request
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ 
        error: 'Invalid request format', 
        details: 'Expected multipart/form-data'
      }, { status: 400 });
    }

    // Parse the form data
    const formData = await request.formData();
    console.log('Form data keys:', [...formData.keys()]);

    // Get form fields
    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const buyPriceStr = formData.get('buyPrice') as string;
    const sellPriceStr = formData.get('sellPrice') as string;
    const stockStr = formData.get('stock') as string;
    const description = formData.get('description') as string;
    const expiryDateStr = formData.get('expiryDate') as string;
    const categoryIdStr = formData.get('categoryId') as string;
    const imageFile = formData.get('image') as File | null;

    // Validate required fields
    if (!name || !buyPriceStr || !sellPriceStr || !expiryDateStr) {
      return NextResponse.json(
        { error: 'Name, buy price, sell price, and expiry date are required' },
        { status: 400 }
      );
    }

    // Convert and validate numeric values
    const buyPrice = parseFloat(buyPriceStr);
    const sellPrice = parseFloat(sellPriceStr);
    const stock = stockStr ? parseInt(stockStr) : 0;
    const categoryId = categoryIdStr ? parseInt(categoryIdStr) : null;

    if (isNaN(buyPrice) || isNaN(sellPrice)) {
      return NextResponse.json(
        { error: 'Buy price and sell price must be valid numbers' },
        { status: 400 }
      );
    }

    // Process image file if present
    let imageData: Buffer | null = null;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imageData = Buffer.from(arrayBuffer);
    }

    // Get the current product to update
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product with transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          name: name,
          sku: sku || undefined,
          buyPrice: buyPrice,
          sellPrice: sellPrice,
          stock: stock,
          description: description || undefined,
          expiryDate: new Date(expiryDateStr),
          image: imageData || currentProduct.image, // Use existing image if no new image is uploaded
          categoryId: categoryId || undefined,
        },
        include: {
          category: true,
        },
      });

      // If stock is updated, create a stock log
      if (stock !== currentProduct.stock) {
        const stockDifference = stock - currentProduct.stock;

        await tx.stockLog.create({
          data: {
            productId: product.id,
            quantity: stockDifference,
            type: 'ADJUSTMENT',
            buyPrice: buyPrice,
            userId: 1, // Default to user ID 1 for form-data uploads, change as needed
            notes: 'Stock adjustment via product update',
          },
        });
      }

      return product;
    });

    // Remove binary image data from response
    const { image, ...productWithoutImage } = updatedProduct;

    // Create the final product format with imageUrl
    const formattedProduct = {
      ...productWithoutImage,
      imageUrl: `/api/products/image/${updatedProduct.id}`,
    };

    return NextResponse.json(formattedProduct, { status: 200 });
  } catch (error: any) {
    console.error('Error updating product:', error);

    return NextResponse.json({ 
      error: 'Failed to update product', 
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const orderItems = await prisma.orderItem.findFirst({ where: { productId: id } });
    if (orderItems) {
      return NextResponse.json(
        { error: 'Cannot delete product that has been ordered. Consider making it inactive instead.' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.stockLog.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
