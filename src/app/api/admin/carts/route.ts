import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

const CSRF = process.env.CSRF_TOKEN;

function checkCsrf(req: Request) {
  if (!CSRF) return true;
  const token = req.headers.get('x-csrf-token');
  return token === CSRF;
}

export async function GET() {
  const carts = await prisma.cart.findMany({ include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json({ data: carts });
}

export async function DELETE(req: Request) {
  if (!checkCsrf(req)) return NextResponse.json({ error: 'CSRF' }, { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.cart.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
