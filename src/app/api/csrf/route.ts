import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.CSRF_TOKEN || null;
  return NextResponse.json({ csrfToken: token });
}
