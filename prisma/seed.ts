import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Categories
  const groceries = await prisma.category.create({
    data: {
      name: 'Groceries',
      description: 'Basic food and household items',
    },
  });

  const beverages = await prisma.category.create({
    data: {
      name: 'Beverages',
      description: 'Drinks and liquid refreshments',
    },
  });

  const pharmacy = await prisma.category.create({
    data: {
      name: 'Pharmacy',
      description: 'Medicines and health products',
    },
  });

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
  });

  const cashier = await prisma.user.create({
    data: {
      username: 'kasir',
      password: cashierPassword,
      fullName: 'Kasir Toko',
      role: 'KASIR',
    },
  });

  // Create Products
  const riceProduct = await prisma.product.create({
    data: {
      name: 'Beras Premium',
      sku: 'GRC001',
      buyPrice: 45000,
      sellPrice: 52000,
      stock: 25,
      description: 'Beras kualitas premium per 5kg',
      supplier: 'PT Tani Sejahtera',
      expiryDate: new Date('2025-12-31'),
      categoryId: groceries.id,
    },
  });

  const milkProduct = await prisma.product.create({
    data: {
      name: 'Susu UHT',
      sku: 'BVG001',
      buyPrice: 12000,
      sellPrice: 15000,
      stock: 50,
      description: 'Susu UHT 1 liter',
      supplier: 'PT Dairy Fresh',
      expiryDate: new Date('2025-07-15'),
      categoryId: beverages.id,
    },
  });

  const paracetamolProduct = await prisma.product.create({
    data: {
      name: 'Paracetamol',
      sku: 'MED001',
      buyPrice: 8000,
      sellPrice: 12000,
      stock: 100,
      description: 'Paracetamol 500mg (10 tablet/strip)',
      supplier: 'PT Medika Farma',
      expiryDate: new Date('2026-03-20'),
      categoryId: pharmacy.id,
    },
  });

  const instantNoodles = await prisma.product.create({
    data: {
      name: 'Mi Instan',
      sku: 'GRC002',
      buyPrice: 2000,
      sellPrice: 3000,
      stock: 200,
      description: 'Mi instan rasa ayam bawang',
      supplier: 'PT Food Distributor',
      expiryDate: new Date('2025-10-15'),
      categoryId: groceries.id,
    },
  });

  // Create Stock Logs
  await prisma.stockLog.create({
    data: {
      productId: riceProduct.id,
      quantity: 25,
      type: 'PURCHASE',
      buyPrice: 45000,
      userId: admin.id,
      notes: 'Initial stock',
    },
  });

  await prisma.stockLog.create({
    data: {
      productId: milkProduct.id,
      quantity: 50,
      type: 'PURCHASE',
      buyPrice: 12000,
      userId: admin.id,
      notes: 'Initial stock',
    },
  });

  await prisma.stockLog.create({
    data: {
      productId: paracetamolProduct.id,
      quantity: 100,
      type: 'PURCHASE',
      buyPrice: 8000,
      userId: admin.id,
      notes: 'Initial stock',
    },
  });

  await prisma.stockLog.create({
    data: {
      productId: instantNoodles.id,
      quantity: 200,
      type: 'PURCHASE',
      buyPrice: 2000,
      userId: admin.id,
      notes: 'Initial stock',
    },
  });

  // Create an Order with OrderItems
  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-001',
      customerName: 'Customer 1',
      cashierId: cashier.id,
      status: 'COMPLETED',
      totalAmount: 67000, // 52000 + 15000
      amountPaid: 70000,
      changeAmount: 3000,
      paymentMethod: 'CASH',
      items: {
        create: [
          {
            productId: riceProduct.id,
            quantity: 1,
            buyPrice: riceProduct.buyPrice,
            sellPrice: riceProduct.sellPrice,
            subtotal: riceProduct.sellPrice,
          },
          {
            productId: milkProduct.id,
            quantity: 1,
            buyPrice: milkProduct.buyPrice,
            sellPrice: milkProduct.sellPrice,
            subtotal: milkProduct.sellPrice,
          },
        ],
      },
    },
  });

  // Create stock logs for sold items
  await prisma.stockLog.create({
    data: {
      productId: riceProduct.id,
      quantity: -1,
      type: 'SALE',
      userId: cashier.id,
      notes: `Sale from order ${order.orderNumber}`,
    },
  });

  await prisma.stockLog.create({
    data: {
      productId: milkProduct.id,
      quantity: -1,
      type: 'SALE',
      userId: cashier.id,
      notes: `Sale from order ${order.orderNumber}`,
    },
  });

  // Update product stock after sale
  await prisma.product.update({
    where: { id: riceProduct.id },
    data: { stock: { decrement: 1 } },
  });

  await prisma.product.update({
    where: { id: milkProduct.id },
    data: { stock: { decrement: 1 } },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });