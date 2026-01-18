import { prisma } from '../../../lib/prisma';
import dynamic from 'next/dynamic';

const AddToCartButton = dynamic(() => import('../../../components/AddToCartButton'), { ssr: false });
import PageNav from '../../../components/PageNav';

export const revalidate = 0;

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: true }
  });

  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <PageNav />
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.images[0]?.url} alt={product.images[0]?.alt || product.name} className="w-full h-[420px] object-cover rounded" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="mt-2 text-gray-700">${(product.price / 100).toFixed(2)}</p>
          <p className="mt-4">{product.description}</p>
          <div className="mt-6">
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
