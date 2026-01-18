import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { items } = body;
  if (!Array.isArray(items)) return NextResponse.json({ ok: false, message: 'Invalid items' }, { status: 400 });

  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const map: Record<string, any> = {};
  products.forEach((p) => (map[p.id] = p));

  for (const it of items) {
    const p = map[it.productId];
    if (!p) return NextResponse.json({ ok: false, message: 'Product missing' }, { status: 400 });
    if (p.stock < it.quantity) return NextResponse.json({ ok: false, message: `Insufficient stock for ${p.name}` }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
