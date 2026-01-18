import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { ProductCreateSchema, ProductUpdateSchema } from '../../../../lib/validators';

const CSRF = process.env.CSRF_TOKEN;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const take = parseInt(url.searchParams.get('take') || '20', 10);
  const skip = (Math.max(1, page) - 1) * take;

  const [products, total] = await Promise.all([
    prisma.product.findMany({ include: { images: true, category: true }, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.product.count()
  ]);
  return NextResponse.json({ data: products, meta: { page, take, total } });
}

function checkCsrf(req: Request) {
  if (!CSRF) return true; // no env set -> skip
  const token = req.headers.get('x-csrf-token');
  return token === CSRF;
}

export async function POST(req: Request) {
  if (!checkCsrf(req)) return NextResponse.json({ error: 'CSRF' }, { status: 403 });
  const body = await req.json();
  const parsed = ProductCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { name, description, price, stock, sku, categoryId } = parsed.data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const p = await prisma.product.create({ data: { name, slug, description: description || '', price, stock: stock || 0, sku: sku || null, categoryId: categoryId || undefined } });
  return NextResponse.json(p);
}

export async function PUT(req: Request) {
  if (!checkCsrf(req)) return NextResponse.json({ error: 'CSRF' }, { status: 403 });
  const body = await req.json();
  const parsed = ProductUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { id, name, description, price, stock, sku, categoryId } = parsed.data;
  const p = await prisma.product.update({ where: { id }, data: { name, description, price, stock, sku, categoryId } });
  return NextResponse.json(p);
}

export async function DELETE(req: Request) {
  if (!checkCsrf(req)) return NextResponse.json({ error: 'CSRF' }, { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
