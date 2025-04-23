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
npm run seed
```

7. **Jalankan Project**
```bash
npm run dev
```

---

## 🔌 API Endpoint Sample

- `GET /api/products` → Semua produk
- `GET /api/orders` → Semua order
- `GET /api/payment` → Semua payment
- `GET /api/orderItems` → Ambil daftar item order dengan nama produk

---

