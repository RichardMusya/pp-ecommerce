import Link from 'next/link';

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2">Admin control center (protected by middleware)</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/products" className="block p-4 bg-white rounded border">Manage Products</Link>
        <Link href="/admin/categories" className="block p-4 bg-white rounded border">Manage Categories</Link>
        <Link href="/admin/discounts" className="block p-4 bg-white rounded border">Manage Discounts</Link>
        <Link href="/admin/orders" className="block p-4 bg-white rounded border">View & Process Orders</Link>
        <Link href="/admin/carts" className="block p-4 bg-white rounded border">View Carts</Link>
        <Link href="/admin/users" className="block p-4 bg-white rounded border">User Management</Link>
      </div>
    </div>
  );
}
