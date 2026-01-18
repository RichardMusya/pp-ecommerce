import Link from 'next/link';
import Image from 'next/image';
import PageNav from '../components/PageNav';
import { prisma } from '../lib/prisma';

export const revalidate = 0;

export default async function Home() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const products = await prisma.product.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { images: true } });

  return (
    <section className="max-w-6xl mx-auto px-4">
      <PageNav />
      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-3xl font-extrabold">PP E-commerce</h1>
          <p className="text-gray-600 mt-1">A curated selection of seeded products.</p>
        </div>
        <div>
          <Link href="/products" className="bg-blue-600 text-white px-4 py-2 rounded">
            View all products
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="mt-3 flex gap-3 flex-wrap">
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="px-3 py-1 bg-white rounded shadow-sm text-sm">
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {products.map((p) => (
            <article key={p.id} className="bg-white p-3 rounded shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src={p.images[0]?.url || '/placeholder.png'} alt={p.images[0]?.alt || p.name} width={160} height={160} className="w-full h-40 object-cover rounded" />
              <h3 className="mt-2 font-medium">{p.name}</h3>
              <p className="text-sm text-gray-600">${(p.price / 100).toFixed(2)}</p>
              <Link href={`/product/${p.slug}`} className="text-blue-600 text-sm">
                View
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
