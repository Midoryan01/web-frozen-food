const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);
  const kasirPassword = await bcrypt.hash('kasir123', 10);

  // Seed Users
  await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN',
      },
      {
        username: 'kasir1',
        password: kasirPassword,
        role: 'KASIR',
      },
    ],
    skipDuplicates: true,
  });

  // Seed Products
  const productsData = [
    {
      id: 1,
      name: "sosis",
      description: "sosis enak",
      price: 20000,
      stock: 20,
      createdAt: new Date("2025-04-22T07:56:41.341Z"),
      updatedAt: new Date("2025-04-22T07:56:23.000Z")
    },
    {
      id: 2,
      name: "bakso",
      description: "bakso",
      price: 25000,
      stock: 20,
      createdAt: new Date("2025-04-22T01:17:30.928Z"),
      updatedAt: new Date("2025-04-22T01:17:30.928Z")
    },
    {
      id: 3,
      name: "nugget",
      description: "nugget lezat",
      price: 50000,
      stock: 30,
      createdAt: new Date("2025-04-22T01:18:07.645Z"),
      updatedAt: new Date("2025-04-22T01:18:07.645Z")
    }
  ];

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product
    });
  }

  // Seed Orders
  const order1 = await prisma.order.create({
    data: {
      customerId: 1001,
      orderDate: new Date(),
      status: "Completed",
      totalAmount: 70000,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: 1002,
      orderDate: new Date(),
      status: "Pending",
      totalAmount: 50000,
    },
  });

  // Seed OrderItems
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        productId: 1,
        quantity: 2,
        price: 40000,
      },
      {
        orderId: order1.id,
        productId: 2,
        quantity: 1,
        price: 25000,
      },
      {
        orderId: order2.id,
        productId: 3,
        quantity: 1,
        price: 50000,
      },
    ],
  });

  // Seed Payments
  await prisma.payment.createMany({
    data: [
      {
        orderId: order1.id,
        paymentDate: new Date(),
        amount: 70000,
        method: "QRIS",
        status: "Paid",
      },
      {
        orderId: order2.id,
        paymentDate: new Date(),
        amount: 50000,
        method: "Cash",
        status: "Pending",
      },
    ],
  });

  console.log("✅ Semua data berhasil di-seed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
