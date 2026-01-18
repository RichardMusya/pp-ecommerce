import { prisma } from '../../../../lib/prisma';
import Link from 'next/link';

export default async function AdminCategoriesSSR({ searchParams }: { searchParams?: any }) {
  const page = parseInt(searchParams?.page || '1', 10);
  const take = 10;
  const skip = (page - 1) * take;

  const [cats, total] = await Promise.all([
    prisma.category.findMany({ skip, take, orderBy: { name: 'asc' } }),
    prisma.category.count()
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold">Categories (Admin SSR)</h1>
      <div className="mt-4 bg-white rounded">
        {cats.map((c) => (
          <div key={c.id} className="p-3 border-b flex justify-between">
            <div>{c.name}</div>
            <div><Link href="/admin/categories" className="text-blue-600">Edit</Link></div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/admin/categories/ssr?page=${Math.max(1, page - 1)}`} className="px-3 py-1 border rounded">Prev</Link>
        <Link href={`/admin/categories/ssr?page=${page + 1}`} className="px-3 py-1 border rounded">Next</Link>
      </div>
    </div>
  );
}
