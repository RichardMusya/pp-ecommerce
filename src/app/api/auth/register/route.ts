import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;
  if (!email || !password) return NextResponse.json({ error: 'Missing' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'User exists' }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash } });
  return NextResponse.json({ ok: true });
}
