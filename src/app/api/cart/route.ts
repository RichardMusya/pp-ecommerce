import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { parseCookies } from '../../../lib/cookies';
import { serialize } from 'cookie';

export async function GET(req: Request) {
  const cookies = parseCookies(req);
  const cookieId = cookies['cart_id'];
  if (!cookieId) return NextResponse.json({ items: [] });

  const cart = await prisma.cart.findUnique({ where: { cookieId }, include: { items: { include: { product: true } } } });
  const items = (cart?.items || []).map((it) => ({ id: it.id, productId: it.productId, product: it.product, quantity: it.quantity, price: it.price }));

  // standard shipping fee (in cents). Make configurable via env later.
  const STANDARD_SHIPPING = Number(process.env.STANDARD_SHIPPING || 500); // default $5.00

  const subtotal = items.reduce((s: number, it: any) => s + (it.price || it.product?.price || 0) * it.quantity, 0);
  const shipping = items.length > 0 ? STANDARD_SHIPPING : 0;
  const total = subtotal + shipping;

  return NextResponse.json({ cartId: cart?.id || null, cookieId: cookieId || null, items, subtotal, shipping, total, currency: cart?.items?.[0]?.product?.currency || 'USD' });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { productId, quantity } = body;
  if (!productId || !quantity) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  // For guests: use cookieId; for logged-in users should use server session (omitted here)
  const cookies = parseCookies(req);
  let cookieId = cookies['cart_id'];
  if (!cookieId) cookieId = 'guest-' + Math.random().toString(36).slice(2, 9);

  let cart = await prisma.cart.findUnique({ where: { cookieId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { cookieId } });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // if same product already in cart, increment quantity
  let item = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: product.id } });
  if (item) {
    const newQty = item.quantity + Number(quantity);
    item = await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: newQty, price: product.price } });
  } else {
    item = await prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, quantity: Number(quantity), price: product.price } });
  }

  // Ensure the client receives the cart_id cookie so subsequent requests use the same cart
  const headers = new Headers();
  headers.set('Set-Cookie', serialize('cart_id', cookieId, { path: '/', httpOnly: true, sameSite: 'lax' }));

  return NextResponse.json(item, { headers });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { itemId, quantity } = body;
  if (!itemId || typeof quantity !== 'number') return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const existing = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!existing) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  const updated = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: Math.max(1, quantity) } });

  // notify client via response (client should dispatch event)
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const itemId = url.searchParams.get('itemId');
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
