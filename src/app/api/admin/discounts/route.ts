import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const discounts = await prisma.discountCode.findMany({ orderBy: { code: 'asc' } });
  return NextResponse.json(discounts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { code, type, amount, startsAt, endsAt } = body;
  if (!code || !type || typeof amount !== 'number') return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const dc = await prisma.discountCode.create({ data: { code, type, amount, startsAt: startsAt ? new Date(startsAt) : undefined, endsAt: endsAt ? new Date(endsAt) : undefined } });
  return NextResponse.json(dc);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });
  await prisma.discountCode.delete({ where: { code } });
  return NextResponse.json({ ok: true });
}
