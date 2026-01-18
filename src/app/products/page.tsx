import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import PageNav from '../../components/PageNav';

export const revalidate = 0;

export default async function ProductsPage({ searchParams }: { searchParams?: any }) {
  const page = parseInt(searchParams?.page || '1', 10);
  const take = 12;
  const skip = (page - 1) * take;

  const where: any = {};
  if (searchParams?.category) {
    where.category = { slug: searchParams.category };
  }

  const products = await prisma.product.findMany({
    where,
    take,
    skip,
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });

  const count = await prisma.product.count();

  return (
    <div>
      <h1 className="text-xl font-semibold">Products</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {products.map((p) => (
          <article key={p.id} className="bg-white p-3 rounded shadow-sm">
            <img src={p.images[0]?.url} alt={p.images[0]?.alt || p.name} className="w-full h-40 object-cover rounded" />
            <h2 className="mt-2 font-medium">{p.name}</h2>
            <p className="text-sm text-gray-600">${(p.price / 100).toFixed(2)}</p>
            <Link href={`/product/${p.slug}`} className="text-blue-600 text-sm">
              View
            </Link>
          </article>
        ))}
      </div>
      <PageNav />
      <div className="mt-4">
        <p>
          Page {page} of {Math.ceil(count / take)}
        </p>
      </div>
    </div>
  );
}
