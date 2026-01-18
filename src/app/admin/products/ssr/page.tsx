import { prisma } from '../../../../lib/prisma';
import Link from 'next/link';

export default async function AdminProductsSSR({ searchParams }: { searchParams?: any }) {
  const page = parseInt(searchParams?.page || '1', 10);
  const take = 10;
  const skip = (page - 1) * take;

  const [products] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.product.count()
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold">Products (Admin SSR)</h1>
      <div className="mt-4 grid gap-2">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded flex justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">{p.category?.name || 'Uncategorized'}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/products`} className="text-blue-600">Edit</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/admin/products/ssr?page=${Math.max(1, page - 1)}`} className="px-3 py-1 border rounded">Prev</Link>
        <Link href={`/admin/products/ssr?page=${page + 1}`} className="px-3 py-1 border rounded">Next</Link>
      </div>
    </div>
  );
}
