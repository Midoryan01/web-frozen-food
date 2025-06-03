// prisma/seed.ts
import { PrismaClient, StockLogType, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Decimal } from 'decimal.js';

const prisma = new PrismaClient();
const saltRounds = 10;

async function main() {
  console.log(`Mulai proses seeding ... 🌱`);

  // --- 1. Seed Users (Admin & Kasir) ---
  console.log('Seeding Users...');
  const hashedPasswordAdmin = await bcrypt.hash('admin123', saltRounds);
  const hashedPasswordKasir = await bcrypt.hash('kasir123', saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPasswordAdmin,
      fullName: 'Administrator Utama',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`User Admin dibuat/ditemukan: ${adminUser.username}`);

  const cashierUser1 = await prisma.user.upsert({
    where: { username: 'kasir01' },
    update: {},
    create: {
      username: 'kasir01',
      password: hashedPasswordKasir,
      fullName: 'Budi Kasir',
      role: 'KASIR',
      isActive: true,
    },
  });
  console.log(`User Kasir dibuat/ditemukan: ${cashierUser1.username}`);

  const cashierUser2 = await prisma.user.upsert({
    where: { username: 'kasir02' },
    update: {},
    create: {
      username: 'kasir02',
      password: hashedPasswordKasir, // Gunakan password yang sama atau berbeda
      fullName: 'Ani Kasirwati',
      role: 'KASIR',
      isActive: true,
    },
  });
  console.log(`User Kasir dibuat/ditemukan: ${cashierUser2.username}`);


  // --- 2. Seed Categories ---
  console.log('Seeding Categories...');
  const categoriesData = [
    { name: 'Daging Beku', description: 'Berbagai macam daging beku berkualitas.' },
    { name: 'Seafood Beku', description: 'Ikan, udang, cumi, dan hasil laut beku lainnya.' },
    { name: 'Sayuran Beku', description: 'Sayuran segar yang dibekukan untuk menjaga nutrisi.' },
    { name: 'Siap Saji Beku', description: 'Makanan siap saji yang praktis, tinggal dipanaskan.' },
    { name: 'Es Krim & Dessert', description: 'Berbagai pilihan es krim dan makanan penutup beku.' },
    { name: 'Roti & Pastry Beku', description: 'Roti dan pastry yang bisa dipanggang kapan saja.' },
  ];

  const createdCategories = [];
  for (const catData of categoriesData) {
    // Asumsi 'name' pada Category sudah @unique di schema.prisma
    // Jika belum, modifikasi schema dan migrate, atau gunakan logika findFirst + create/update seperti sebelumnya.
    // Untuk contoh ini, saya asumsikan name sudah @unique agar bisa pakai upsert:
    const category = await prisma.category.upsert({
        where: { name: catData.name },
        update: { description: catData.description },
        create: catData,
    });
    createdCategories.push(category);
    console.log(`Kategori dibuat/ditemukan: ${category.name}`);
  }


  // --- 3. Seed Products (Frozen Food) ---
  console.log('Seeding Products...');
  const defaultImageUrl = '/no-image.svg'; // Path ke gambar default di folder public

  const productsData = [
    // Daging Beku
    {
      name: 'Dada Ayam Fillet Beku', sku: 'FRZ-CHKN-BRST-001', buyPrice: new Decimal('45000.00'), sellPrice: new Decimal('55000.00'), stock: 100,
      description: 'Dada ayam fillet tanpa tulang, 1kg.', supplier: 'Supplier Ayam Segar', expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      categoryId: createdCategories.find(c => c.name === 'Daging Beku')?.id, imageUrl: defaultImageUrl
    },
    {
      name: 'Daging Sapi Giling Beku', sku: 'FRZ-BEEF-GRND-001', buyPrice: new Decimal('70000.00'), sellPrice: new Decimal('85000.00'), stock: 80,
      description: 'Daging sapi giling premium, 500g.', supplier: 'Supplier Daging Premium', expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      categoryId: createdCategories.find(c => c.name === 'Daging Beku')?.id, imageUrl: defaultImageUrl
    },
    // Seafood Beku
    {
      name: 'Udang Kupas Beku', sku: 'FRZ-SHRMP-PEEL-001', buyPrice: new Decimal('80000.00'), sellPrice: new Decimal('100000.00'), stock: 60,
      description: 'Udang kupas segar beku, 500g.', supplier: 'Supplier Seafood Nusantara', expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      categoryId: createdCategories.find(c => c.name === 'Seafood Beku')?.id, imageUrl: defaultImageUrl
    },
    // Sayuran Beku
    {
      name: 'Brokoli Beku', sku: 'FRZ-VEG-BROC-001', buyPrice: new Decimal('15000.00'), sellPrice: new Decimal('22000.00'), stock: 120,
      description: 'Potongan brokoli segar yang dibekukan, 500g.', supplier: 'Petani Lokal Organik', expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 9)),
      categoryId: createdCategories.find(c => c.name === 'Sayuran Beku')?.id, imageUrl: defaultImageUrl
    },
    // Siap Saji Beku
    {
      name: 'Nugget Ayam Original', sku: 'FRZ-RTE-NUGGET-001', buyPrice: new Decimal('25000.00'), sellPrice: new Decimal('35000.00'), stock: 150,
      description: 'Nugget ayam rasa original, 500g.', supplier: 'Pabrik Makanan Olahan', expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      categoryId: createdCategories.find(c => c.name === 'Siap Saji Beku')?.id, imageUrl: defaultImageUrl
    },
    {
      name: 'Kentang Goreng Beku (Shoestring)', sku: 'FRZ-RTE-FRIES-001', buyPrice: new Decimal('20000.00'), sellPrice: new Decimal('28000.00'), stock: 200,
      description: 'Kentang goreng potongan shoestring, 1kg.', supplier: 'Pabrik Makanan Olahan', expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      categoryId: createdCategories.find(c => c.name === 'Siap Saji Beku')?.id, imageUrl: defaultImageUrl
    },
    // Es Krim & Dessert
    {
      name: 'Es Krim Cokelat Klasik', sku: 'FRZ-ICE-CHOC-001', buyPrice: new Decimal('18000.00'), sellPrice: new Decimal('25000.00'), stock: 70,
      description: 'Es krim rasa cokelat klasik, 700ml.', supplier: 'Pabrik Es Krim Enak', expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 8)),
      categoryId: createdCategories.find(c => c.name === 'Es Krim & Dessert')?.id, imageUrl: defaultImageUrl
    },
  ];

  const createdProducts = [];
  for (const prodData of productsData) {
    if (!prodData.categoryId) {
      console.warn(`Kategori untuk produk ${prodData.name} tidak ditemukan, produk dilewati.`);
      continue;
    }
    const product = await prisma.product.upsert({
      where: { sku: prodData.sku || `${prodData.name.replace(/\s+/g, '-')}-${Date.now()}` },
      update: { ...prodData }, // Pastikan imageUrl diperbarui jika produk sudah ada
      create: { ...prodData },
    });
    createdProducts.push(product);
    console.log(`Produk dibuat/ditemukan: ${product.name}`);
  }


  // --- 4. Seed Stock Logs (Initial Stock for Products) ---
  console.log('Seeding Stock Logs (Initial Stock)...');
  const stockLogsData = [];
  for (const product of createdProducts) {
    if (product.stock > 0) {
      stockLogsData.push({
        productId: product.id,
        quantity: product.stock,
        type: StockLogType.PURCHASE,
        buyPrice: product.buyPrice,
        userId: adminUser.id,
        notes: 'Stok awal produk',
      });
    }
  }
  if (stockLogsData.length > 0) {
    await prisma.stockLog.createMany({
      data: stockLogsData,
      skipDuplicates: true,
    });
    console.log(`${stockLogsData.length} StockLog (initial) berhasil dibuat.`);
  }


  // --- 5. Seed Orders (Contoh Beberapa Transaksi) ---
  console.log('Seeding Orders...');
  if (createdProducts.length >= 2) {
    const order1Product1 = createdProducts[0];
    const order1Product2 = createdProducts[3];

    // Pastikan produk yang diorder ada
    if (!order1Product1 || !order1Product2) {
        console.warn('Satu atau lebih produk untuk order pertama tidak ditemukan. Melewati pembuatan order pertama.');
    } else {
        const order1ItemsData = [
          {
            productId: order1Product1.id,
            quantity: 2,
            buyPrice: order1Product1.buyPrice,
            sellPrice: order1Product1.sellPrice,
            subtotal: order1Product1.sellPrice.mul(2),
          },
          {
            productId: order1Product2.id,
            quantity: 1,
            buyPrice: order1Product2.buyPrice,
            sellPrice: order1Product2.sellPrice,
            subtotal: order1Product2.sellPrice.mul(1),
          },
        ];

        const order1TotalAmount = order1ItemsData.reduce((sum, item) => sum.add(item.subtotal), new Decimal(0));

        const order1 = await prisma.order.create({
          data: {
            customerName: 'Pelanggan Setia',
            cashierId: cashierUser1.id,
            status: OrderStatus.COMPLETED,
            totalAmount: order1TotalAmount,
            amountPaid: order1TotalAmount,
            changeAmount: new Decimal(0),
            paymentMethod: 'CASH',
            items: {
              create: order1ItemsData,
            },
          },
        });
        console.log(`Order dibuat: ${order1.orderNumber} oleh ${cashierUser1.fullName}`);

        for (const item of order1ItemsData) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
          await prisma.stockLog.create({
            data: {
              productId: item.productId,
              quantity: -item.quantity,
              type: StockLogType.SALE,
              userId: cashierUser1.id,
              notes: `Penjualan dari order ${order1.orderNumber}`,
            },
          });
        }
        console.log(`Stok produk diupdate dan StockLog (SALE) dibuat untuk order ${order1.orderNumber}`);
    }

    const order2Product1 = createdProducts[4];
    if (order2Product1 && order2Product1.stock > 0) {
        const order2ItemsData = [
            {
                productId: order2Product1.id,
                quantity: 1,
                buyPrice: order2Product1.buyPrice,
                sellPrice: order2Product1.sellPrice,
                subtotal: order2Product1.sellPrice.mul(1),
            }
        ];
        const order2TotalAmount = order2ItemsData.reduce((sum, item) => sum.add(item.subtotal), new Decimal(0));

        const order2 = await prisma.order.create({
            data: {
                customerName: 'Pelanggan Baru',
                cashierId: cashierUser2.id,
                status: OrderStatus.PENDING,
                totalAmount: order2TotalAmount,
                paymentMethod: 'CASH',
                items: {
                    create: order2ItemsData,
                },
            },
        });
        console.log(`Order (PENDING) dibuat: ${order2.orderNumber} oleh ${cashierUser2.fullName}`);
    } else {
        console.log(`Produk ${createdProducts[4]?.name || 'Nugget'} tidak tersedia atau stok habis untuk Order 2.`);
    }
  } else {
    console.log('Tidak cukup produk untuk membuat contoh order.');
  }

  console.log(`Proses seeding selesai. 🎉`);
}

main()
  .catch(async (e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });