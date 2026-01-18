import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

const categories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Books', slug: 'books' },
  { name: 'Home & Garden', slug: 'home-garden' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Beauty', slug: 'beauty' },
  { name: 'Toys', slug: 'toys' },
  { name: 'Food & Beverages', slug: 'food-beverages' },
  { name: 'Furniture', slug: 'furniture' },
  { name: 'Accessories', slug: 'accessories' },
];

const productTemplates = [
  { name: 'Wireless Headphones', description: 'High-quality sound with noise cancellation', price: 9999 },
  { name: 'USB-C Cable', description: 'Fast charging and data transfer', price: 1999 },
  { name: 'Phone Case', description: 'Durable protective case', price: 2999 },
  { name: 'Screen Protector', description: 'Tempered glass protection', price: 999 },
  { name: 'Power Bank', description: '20000mAh portable charger', price: 4999 },
  { name: 'Bluetooth Speaker', description: 'Portable waterproof speaker', price: 7999 },
  { name: 'Laptop Stand', description: 'Ergonomic aluminum stand', price: 5999 },
  { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price: 12999 },
  { name: 'Wireless Mouse', description: 'Precision tracking mouse', price: 3999 },
  { name: 'Monitor Light Bar', description: 'Eye-care desk lamp', price: 8999 },
  { name: 'T-Shirt', description: 'Comfortable cotton tee', price: 2999 },
  { name: 'Jeans', description: 'Classic denim jeans', price: 6999 },
  { name: 'Sneakers', description: 'Comfortable sports shoes', price: 9999 },
  { name: 'Winter Jacket', description: 'Warm and stylish jacket', price: 19999 },
  { name: 'Scarf', description: 'Soft wool scarf', price: 3999 },
];

export async function POST() {
  try {
    // Create categories
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: { id: `cat-${cat.slug}`, name: cat.name, slug: cat.slug },
      });
    }

    // Create admin user
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        id: 'admin-user',
        email: 'admin@example.com',
        name: 'Admin',
        password: '$2b$10$Qb.XxV1gFQvvM3JbCQfH.uK7Ey1T5PzPy0T5PzPy0T5PzPy0T5PzP', // bcrypt: password
        role: 'ADMIN',
      },
    });

    // Create sample products (12 per category across 10 categories = 120 products)
    let productCount = 0;
    for (const cat of categories) {
      for (let i = 0; i < 12; i++) {
        const template = productTemplates[i % productTemplates.length];
        const slug = `${cat.slug}-${template.name.toLowerCase().replace(/\s+/g, '-')}-${i}`;
        
        await prisma.product.upsert({
          where: { slug },
          update: {},
          create: {
            id: `prod-${productCount}`,
            name: `${template.name} - ${cat.name} #${i + 1}`,
            slug,
            description: template.description,
            price: template.price + Math.random() * 5000,
            stock: Math.floor(Math.random() * 100) + 10,
            categoryId: `cat-${cat.slug}`,
          },
        });
        productCount++;
      }
    }

    // Create sample discount codes
    await prisma.discountCode.upsert({
      where: { code: 'SAVE10' },
      update: {},
      create: {
        id: 'disc-1',
        code: 'SAVE10',
        type: 'PERCENT',
        amount: 10,
      },
    });

    await prisma.discountCode.upsert({
      where: { code: 'SAVE5' },
      update: {},
      create: {
        id: 'disc-2',
        code: 'SAVE5',
        type: 'FIXED',
        amount: 500,
      },
    });

    return NextResponse.json({
      message: `Seeded successfully: ${productCount} products, ${categories.length} categories, 1 admin user, 2 discount codes`,
      success: true,
    });
  } catch (e: any) {
    console.error('Seed error:', e);
    return NextResponse.json({
      message: `Seed failed: ${e.message}`,
      success: false,
    }, { status: 500 });
  }
}
