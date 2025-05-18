import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';


const prisma = new PrismaClient();

// GET category by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: numericId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            sellPrice: true,
            stock: true,
            supplier: true,
            sku: true,
          }
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Transform the data to ensure proper formatting
    const transformedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      products: category.products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        sellPrice: product.sellPrice,
        stock: product.stock,
        supplier: product.supplier,
        sku: product.sku,
      }))
    };

    return NextResponse.json(transformedCategory);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { name, description } = await req.json();
  
  try {
    const categoryId = parseInt((await params).id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Validasi input minimal (sesuai kebutuhan)
    if (!name && !description) {
      return NextResponse.json(
        { error: 'At least one of name or description is required' },
        { status: 400 }
      );
    }

    // Mencari category yang akan diupdate
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name || existingCategory.name,
        description: description || existingCategory.description,
      },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error: any) {
    console.error('Error updating category:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE category
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    if (isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Cannot delete category with associated products' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}