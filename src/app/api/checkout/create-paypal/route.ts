import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getAccessToken, createPayPalOrder } from '../../../../lib/paypal';

export async function POST(req: Request) {
  const body = await req.json();
  const { localOrderId } = body;
  if (!localOrderId) return NextResponse.json({ error: 'localOrderId required' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: localOrderId }, include: { items: true } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const subtotal = order.subtotal || 0;
  const tax = order.tax || 0;
  const shipping = order.shipping || 0;
  const total = order.total || subtotal + tax + shipping;

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
  return NextResponse.json(ppResp);
}
