import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Clear existing data
  await cleanDatabase();

  // Seed users first
  const admin = await createUsers();
  
  // Seed categories
  const categories = await createCategories();

  // Seed products with their categories
  await createProducts(categories, admin.id);

  console.log('Seeding completed successfully!');
}

async function cleanDatabase() {
  console.log('Cleaning database...');
  
  // Delete in correct order to handle foreign key constraints
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.stockLog.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
}

async function createUsers() {
  console.log('Creating users...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      fullName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });
  
  // Create cashier user
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  await prisma.user.create({
    data: {
      username: 'cashier',
      password: cashierPassword,
      fullName: 'Sample Cashier',
      role: 'KASIR',
      isActive: true,
    },
  });
  
  console.log('Created users');
  
  return admin;
}

async function createCategories() {
  console.log('Creating categories...');
  
  const categoryNames = [
    'Snacks',
    'Beverages',
    'Dairy',
    'Bakery',
    'Canned Goods',
    'Frozen Foods',
    'Personal Care',
    'Cleaning Supplies',
    'Stationery'
  ];
  
  const categories = [];
  
  for (const name of categoryNames) {
    const category = await prisma.category.create({
      data: {
        name,
      },
    });
    categories.push(category);
  }
  
  console.log(`Created ${categories.length} categories`);
  
  return categories;
}

async function createProducts(categories: any[], adminId: number) {
  console.log('Creating products...');
  
  // Get sample product image as buffer
  const imagePath = path.join(__dirname, 'sampleProductImage.jpg');
  let sampleImageBuffer: Buffer | undefined;
  
  try {
    if (fs.existsSync(imagePath)) {
      sampleImageBuffer = fs.readFileSync(imagePath);
    } else {
      console.log('Sample image not found. Products will be created without images.');
    }
  } catch (error) {
    console.error('Error reading sample image:', error);
  }
  
  // Sample products data
  const products = [
    {
      name: 'Chocolate Chip Cookies',
      sku: 'SNK001',
      description: 'Delicious chocolate chip cookies, perfect for snacking.',
      buyPrice: 15000,
      sellPrice: 20000,
      stock: 50,
      categoryId: categories.find(c => c.name === 'Snacks')?.id,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
    {
      name: 'Bottled Water 600ml',
      sku: 'BEV001',
      description: 'Refreshing mineral water in a convenient bottle.',
      buyPrice: 2000,
      sellPrice: 4000,
      stock: 100,
      categoryId: categories.find(c => c.name === 'Beverages')?.id,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
    {
      name: 'Fresh Milk 1L',
      sku: 'DRY001',
      description: 'Farm fresh milk, pasteurized and ready to drink.',
      buyPrice: 12000,
      sellPrice: 15000,
      stock: 30,
      categoryId: categories.find(c => c.name === 'Dairy')?.id,
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
    {
      name: 'Whole Wheat Bread',
      sku: 'BKY001',
      description: 'Nutritious whole wheat bread, baked fresh daily.',
      buyPrice: 8000,
      sellPrice: 12000,
      stock: 20,
      categoryId: categories.find(c => c.name === 'Bakery')?.id,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      name: 'Canned Tuna',
      sku: 'CAN001',
      description: 'Premium tuna chunks in water, high in protein.',
      buyPrice: 18000,
      sellPrice: 25000,
      stock: 40,
      categoryId: categories.find(c => c.name === 'Canned Goods')?.id,
      expiryDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000), // 2 years from now
    },
    {
      name: 'Frozen Pizza',
      sku: 'FRZ001',
      description: 'Ready-to-bake pizza with a variety of toppings.',
      buyPrice: 35000,
      sellPrice: 45000,
      stock: 15,
      categoryId: categories.find(c => c.name === 'Frozen Foods')?.id,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    },
    {
      name: 'Toothpaste',
      sku: 'PER001',
      description: 'Mint-flavored toothpaste for fresh breath and cavity protection.',
      buyPrice: 10000,
      sellPrice: 15000,
      stock: 25,
      categoryId: categories.find(c => c.name === 'Personal Care')?.id,
      expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years from now
    },
    {
      name: 'Dish Soap',
      sku: 'CLN001',
      description: 'Effective dish soap that cuts through grease and grime.',
      buyPrice: 8000,
      sellPrice: 12000,
      stock: 35,
      categoryId: categories.find(c => c.name === 'Cleaning Supplies')?.id,
      expiryDate: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000), // 3 years from now
    },
    {
      name: 'Ballpoint Pen Pack',
      sku: 'STN001',
      description: 'Set of 5 ballpoint pens in assorted colors.',
      buyPrice: 15000,
      sellPrice: 25000,
      stock: 50,
      categoryId: categories.find(c => c.name === 'Stationery')?.id,
      expiryDate: new Date(Date.now() + 1825 * 24 * 60 * 60 * 1000), // 5 years from now
    },
    {
      name: 'Cola Drink 330ml',
      sku: 'BEV002',
      description: 'Classic cola flavor in a convenient can.',
      buyPrice: 4000,
      sellPrice: 6000,
      stock: 75,
      categoryId: categories.find(c => c.name === 'Beverages')?.id,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    },
    {
      name: 'Potato Chips',
      sku: 'SNK002',
      description: 'Crispy potato chips with a touch of salt.',
      buyPrice: 8000,
      sellPrice: 12000,
      stock: 60,
      categoryId: categories.find(c => c.name === 'Snacks')?.id,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
    {
      name: 'Yogurt 500g',
      sku: 'DRY002',
      description: 'Creamy yogurt with live cultures, good for digestive health.',
      buyPrice: 10000,
      sellPrice: 15000,
      stock: 40,
      categoryId: categories.find(c => c.name === 'Dairy')?.id,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    }
  ];
  
  for (const productData of products) {
    // Create product with transaction to include initial stock log
    await prisma.$transaction(async (tx) => {
      // Create the product (using the actual product data from the array)
      const product = await tx.product.create({
        data: {
          name: productData.name,
          sku: productData.sku,
          description: productData.description,
          buyPrice: productData.buyPrice,
          sellPrice: productData.sellPrice,
          stock: productData.stock,
          expiryDate: productData.expiryDate,
          image: sampleImageBuffer,
          categoryId: productData.categoryId!,
        }
      });
      
      // Create initial stock log entry
      await tx.stockLog.create({
        data: {
          productId: product.id,
          quantity: productData.stock,
          type: 'PURCHASE',
          buyPrice: productData.buyPrice,
          userId: adminId,
          notes: 'Initial inventory',
        },
      });
    });
  }
  
  console.log(`Created ${products.length} products with stock logs`);
}

// Execute the main function
main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma client connection
    await prisma.$disconnect();
  });