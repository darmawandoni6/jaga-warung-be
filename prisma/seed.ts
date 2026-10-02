import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = ['Makanan', 'Minuman', 'Sembako', 'Rokok', 'Lainnya'];

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Demo User
  const email = 'owner@jagawarung.id';
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: 'Juragan Warung',
    },
  });

  console.log(`👤 Demo user created/verified: ${user.email} (${user.id})`);

  // 2. Seed Default Categories
  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name,
        },
      },
      update: {},
      create: {
        userId: user.id,
        name,
      },
    });
  }
  console.log('🏷️ Default categories seeded:', DEFAULT_CATEGORIES.join(', '));

  // 3. Seed Sample Products
  const beverageCategory = await prisma.category.findUnique({
    where: { userId_name: { userId: user.id, name: 'Minuman' } },
  });

  const snackCategory = await prisma.category.findUnique({
    where: { userId_name: { userId: user.id, name: 'Makanan' } },
  });

  const sampleProducts = [
    {
      barcode: '899123456001',
      name: 'Kopi Susu Gula Aren 250ml',
      buyPrice: 3500,
      sellPrice: 6000,
      stock: 24,
      minStock: 5,
      type: 'Minuman',
      categoryId: beverageCategory?.id,
    },
    {
      barcode: '899123456002',
      name: 'Teh Manis Melati 350ml',
      buyPrice: 2000,
      sellPrice: 3500,
      stock: 30,
      minStock: 10,
      type: 'Minuman',
      categoryId: beverageCategory?.id,
    },
    {
      barcode: '899123456003',
      name: 'Keripik Singkong Pedas 100g',
      buyPrice: 4000,
      sellPrice: 7000,
      stock: 15,
      minStock: 5,
      type: 'Makanan',
      categoryId: snackCategory?.id,
    },
  ];

  for (const prod of sampleProducts) {
    await prisma.product.upsert({
      where: { barcode: prod.barcode },
      update: {
        buyPrice: prod.buyPrice,
        sellPrice: prod.sellPrice,
        stock: prod.stock,
      },
      create: {
        userId: user.id,
        barcode: prod.barcode,
        name: prod.name,
        buyPrice: prod.buyPrice,
        sellPrice: prod.sellPrice,
        stock: prod.stock,
        minStock: prod.minStock,
        type: prod.type,
        categoryId: prod.categoryId,
      },
    });
  }
  console.log('📦 Sample products seeded');

  // 4. Seed Store Profile Setting
  const settings = [
    { key: 'name', value: 'Warung Berkah Jaya' },
    { key: 'phone', value: '081234567890' },
    { key: 'address', value: 'Jl. Melati No. 12, Jakarta' },
    { key: 'receiptFooter', value: 'Terima kasih atas kunjungan Anda!' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: {
        userId_key: {
          userId: user.id,
          key: s.key,
        },
      },
      update: { value: s.value },
      create: {
        userId: user.id,
        key: s.key,
        value: s.value,
      },
    });
  }
  console.log('⚙️ Store settings seeded');

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
