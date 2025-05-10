import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

// Membuat PrismaClient dengan opsi debug untuk melihat query yang dijalankan
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// GET semua kategori
export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories', details: String(error) }, { status: 500 });
  }
}

// POST kategori baru
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get('name')?.toString();
    const description = formData.get('description')?.toString() || null;

    // Validasi input
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);

    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }

    return NextResponse.json(
      {
        error: 'Failed to create category',
        details: String(error),
        code: error.code || 'UNKNOWN',
      },
      { status: 500 }
    );
  }
}