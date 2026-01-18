import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  'Electronics',
  'Fashion',
  'Home',
  'Beauty',
  'Sports'
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('Seeding DB...');

  const createdCategories: any[] = [];
  for (const name of categories) {
    const slug = slugify(name, { lower: true });
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug }
    });
    createdCategories.push(cat);
  }

  const total = 120;
  for (let i = 1; i <= total; i++) {
    const category = createdCategories[i % createdCategories.length];
    const name = `${category.name} Product ${i}`;
    const slug = slugify(name + '-' + i, { lower: true });
    const price = randomInt(1000, 20000); // cents
    const stock = randomInt(0, 200);
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: `High quality ${category.name.toLowerCase()} product number ${i}.`,
        price,
        compareAtPrice: Math.random() > 0.6 ? price + randomInt(100, 2000) : null,
        currency: 'USD',
        stock,
        sku: `SKU-${i}`,
        rating: parseFloat((Math.random() * 5).toFixed(2)),
        category: { connect: { id: category.id } }
      }
    });

    const images = [];
    for (let j = 0; j < 3; j++) {
      images.push(
        prisma.productImage.create({
          data: {
            productId: product.id,
            url: `https://picsum.photos/seed/${encodeURIComponent(product.slug + '-' + j)}/800/800`,
            alt: product.name
          }
        })
      );
    }

    await Promise.all(images);
    if (i % 20 === 0) console.log(`Created ${i} products`);
  }

  // Create admin user (hashed password)
  const hashed = await bcrypt.hash('changeme', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashed,
      role: 'ADMIN'
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
