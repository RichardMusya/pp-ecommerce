import { prisma } from '../../../lib/prisma';
import Link from 'next/link';

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) return <div>Category not found</div>;

  const products = await prisma.product.findMany({ where: { categoryId: category.id }, include: { images: true } });

  return (
    <div>
      <h1 className="text-2xl font-bold">{category.name}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {products.map((p) => (
          <article key={p.id} className="bg-white p-3 rounded shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.images[0]?.url} alt={p.images[0]?.alt || p.name} className="w-full h-40 object-cover rounded" />
            <h2 className="mt-2 font-medium">{p.name}</h2>
            <p className="text-sm text-gray-600">${(p.price / 100).toFixed(2)}</p>
            <Link href={`/product/${p.slug}`} className="text-blue-600 text-sm">
              View
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
