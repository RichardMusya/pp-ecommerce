import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { generateInvoicePdf } from '../../../lib/invoice';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('orderId');
  if (!id) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const filePath = await generateInvoicePdf(order);
  return NextResponse.json({ path: filePath });
}
