import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

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

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ include: { items: true, payments: true }, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.order.count()
  ]);
  return NextResponse.json({ data: orders, meta: { page, take, total } });
}

export async function PUT(req: Request) {
  if (!checkCsrf(req)) return NextResponse.json({ error: 'CSRF' }, { status: 403 });
  const body = await req.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });
  const o = await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json(o);
}

export async function DELETE(req: Request) {
  if (!checkCsrf(req)) return NextResponse.json({ error: 'CSRF' }, { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
