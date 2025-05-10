import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// GET all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Handle pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Handle search
    const search = searchParams.get('search') || '';
    
    // Handle category filter
    const categoryId = searchParams.get('categoryId');
    
    // Handle sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    // Base query conditions
    const where: any = {
      name: {
        contains: search,
      },
    };
    
    // Add category filter if specified
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    
    // Count total products matching filter
    const total = await prisma.product.count({ where });
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Fetch products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit,
    });
    
    // Format products to exclude binary image data
    const formattedProducts = products.map(product => {
      const { image, ...productWithoutImage } = product;
      return {
        ...productWithoutImage,
        imageUrl: `/api/products/image/${product.id}`
      };
    });
    
    return NextResponse.json({
      data: formattedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages,
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST create new product - handle form-data
export async function POST(request: NextRequest) {
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
    
    // Create product with transaction to include initial stock log if stock > 0
    const newProduct = await prisma.$transaction(async (tx) => {
      // Create the product
      const product = await tx.product.create({
        data: {
          name: name,
          sku: sku || undefined,
          buyPrice: buyPrice,
          sellPrice: sellPrice,
          stock: stock,
          description: description || undefined,
          expiryDate: new Date(expiryDateStr),
          image: imageData || undefined,
          categoryId: categoryId || undefined,
        },
        include: {
          category: true,
        },
      });
      
      // If initial stock is provided and > 0, create a stock log entry
      if (stock > 0) {
        await tx.stockLog.create({
          data: {
            productId: product.id,
            quantity: stock,
            type: 'PURCHASE',
            buyPrice: buyPrice,
            userId: 1, // Default to user ID 1 for form-data uploads, change as needed
            notes: 'Initial stock',
          },
        });
      }
      
      return product;
    });
    
    // Remove binary image data from response
    const { image, ...productWithoutImage } = newProduct;
    
    // Create the final product format with imageUrl
    const formattedProduct = {
      ...productWithoutImage,
      imageUrl: `/api/products/image/${newProduct.id}`
    };
    
    return NextResponse.json(formattedProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error.message
    }, { status: 500 });
  }
}