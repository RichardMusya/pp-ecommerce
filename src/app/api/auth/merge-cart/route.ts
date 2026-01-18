import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { parseCookies } from '../../../../lib/cookies';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: Request) {
  // Verify user via next-auth JWT
  const token = await getToken({ req, secret });
  if (!token || !token.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = token.sub as string;
  const cookies = parseCookies(req);
  const cookieId = cookies['cart_id'];
  if (!cookieId) return NextResponse.json({ ok: true });

  const guestCart = await prisma.cart.findUnique({ where: { cookieId }, include: { items: true } });
  if (!guestCart) return NextResponse.json({ ok: true });

  let userCart = await prisma.cart.findFirst({ where: { userId } , include: { items: true } });
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId } , include: { items: true } });
  }

  // Merge items: add quantities or create
  for (const item of guestCart.items) {
    const existing = userCart.items.find((i) => i.productId === item.productId);
    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + item.quantity } });
    } else {
      await prisma.cartItem.create({ data: { cartId: userCart.id, productId: item.productId, quantity: item.quantity, price: item.price } });
    }
  }

  // delete guest cart
  await prisma.cart.delete({ where: { id: guestCart.id } });

  // instruct client to clear cookie
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', 'cart_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  return res;
}
