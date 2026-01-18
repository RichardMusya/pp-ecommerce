import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { CategoryCreateSchema, CategoryUpdateSchema } from '../../../../lib/validators';

const CSRF = process.env.CSRF_TOKEN;

function checkCsrf(req: Request) {
  if (!CSRF) return true;
  const token = req.headers.get('x-csrf-token');
  return token === CSRF;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const take = parseInt(url.searchParams.get('take') || '20', 10);
  const skip = (Math.max(1, page) - 1) * take;

  const [cats, total] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' }, skip, take }),
    prisma.category.count()
  ]);
  return NextResponse.json({ data: cats, meta: { page, take, total } });
}

export async function POST(req: Request) {
  if (!checkCsrf(req)) return NextResponse.json({ error: 'CSRF' }, { status: 403 });
  const body = await req.json();
  const parsed = CategoryCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { name } = parsed.data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const c = await prisma.category.create({ data: { name, slug } });
  return NextResponse.json(c);
}

export async function PUT(req: Request) {
  if (!checkCsrf(req)) return NextResponse.json({ error: 'CSRF' }, { status: 403 });
  const body = await req.json();
  const parsed = CategoryUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { id, name } = parsed.data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const c = await prisma.category.update({ where: { id }, data: { name, slug } });
  return NextResponse.json(c);
}

export async function DELETE(req: Request) {
  if (!checkCsrf(req)) return NextResponse.json({ error: 'CSRF' }, { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
