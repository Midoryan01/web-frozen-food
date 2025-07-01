# 📦 POS Frozen Food - Mapayo

Aplikasi Point of Sale (POS) sederhana untuk penjualan frozen food menggunakan **Next.js**, **Prisma ORM**, dan **MySQL**.

---

## 🛠️ Setup Project

1. **Clone repo**
```bash
git clone https://github.com/username/pos-frozen-food.git
cd pos-frozen-food
```

2. **Install dependencies**
```bash
npm install
```

3. **Set environment**
Buat file `.env` dan isi:
```
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
NEXTAUTH_SECRET=
```

4. **Generate Prisma Client**
```bash
npx prisma generate
```

5. **Migrasi DB**
```bash
npx prisma migrate dev --name init
```

6. **Seed Data**
```bash
npx prisma db seed
```

7. **Jalankan Project**
```bash
npm run dev
```

---

## 🔌 API Endpoint Sample

- `GET /api/products` → all product
- `GET /api/orders` → all orders
- `GET /api/orderItems` → All Detail Orders
- `GET /api/users` → All payment

---

