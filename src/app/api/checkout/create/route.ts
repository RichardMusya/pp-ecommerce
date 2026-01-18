import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getAccessToken, createPayPalOrder } from '../../../../lib/paypal';

async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.order.count({ where: { createdAt: { gte: new Date(`${year}-01-01`) } } });
  const seq = String(count + 1).padStart(6, '0');
  return `INV-${year}-${seq}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cartId, items: bodyItems, discountCode } = body;
  // fetch items from cart or use provided items
  let items = [] as any[];

  if (cartId) {
    const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    items = cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
  } else if (Array.isArray(bodyItems)) {
    items = bodyItems;
  } else {
    return NextResponse.json({ error: 'No items' }, { status: 400 });
  }

  // server-side price verification
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap: Record<string, any> = {};
  products.forEach((p) => (productMap[p.id] = p));

  let subtotal = 0;
    const orderItems = items.map((it) => {
      const p = productMap[it.productId];
      if (!p) {
        throw { status: 400, message: `Product not found: ${it.productId}` };
      }
      subtotal += p.price * it.quantity;
      return { productId: p.id, name: p.name, sku: p.sku || null, quantity: it.quantity, price: p.price };
    });

  const taxRate = parseFloat(process.env.TAX_RATE_DEFAULT || '0.07');
  const tax = Math.round(subtotal * taxRate);
  const shipping = 500; // flat $5 shipping

  // discount handling
  let discount = 0;
  if (discountCode) {
    const dc = await prisma.discountCode.findUnique({ where: { code: discountCode } });
    if (dc && dc.active) {
      if (dc.type === 'PERCENT') discount = Math.round((dc.amount / 100) * subtotal);
      else discount = dc.amount;
    }
  }

  const total = Math.max(0, subtotal + tax + shipping - discount);

  // create local Order with PENDING status
  const orderNumber = await generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      currency: 'USD',
      status: 'PENDING',
      items: { create: orderItems }
    }
  });

    // create PayPal order
    const env = process.env.PAYPAL_ENV || 'sandbox';
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) return NextResponse.json({ error: 'PayPal not configured' }, { status: 500 });
    const accessToken = await getAccessToken(clientId, clientSecret, env);

  const ppOrderBody = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: order.id,
        amount: {
          currency_code: 'USD',
          value: (total / 100).toFixed(2),
          breakdown: {
            item_total: { currency_code: 'USD', value: (subtotal / 100).toFixed(2) },
            tax_total: { currency_code: 'USD', value: (tax / 100).toFixed(2) },
            shipping: { currency_code: 'USD', value: (shipping / 100).toFixed(2) }
          }
        }
      }
    ],
    application_context: { return_url: process.env.NEXTAUTH_URL || 'http://localhost:3000', brand_name: 'PP E-commerce' }
  };

    const ppResp = await createPayPalOrder(accessToken, env, ppOrderBody);

    return NextResponse.json({ paypal: ppResp, localOrderId: order.id, cartId: cartId || null });
  } catch (e: any) {
    console.error('Error in /api/checkout/create', e);
    if (e && typeof e === 'object' && 'status' in e) {
      const status = (e as any).status || 400;
      return NextResponse.json({ error: (e as any).message || 'Bad Request' }, { status });
    }
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}
