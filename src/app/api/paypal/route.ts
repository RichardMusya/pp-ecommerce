import { NextResponse } from 'next/server';
import { getAccessToken, createPayPalOrder, capturePayPalOrder } from '../../../lib/paypal';
import { prisma } from '../../../lib/prisma';
import { generateInvoicePdf } from '../../../lib/invoice';
import { sendReceiptEmail } from '../../../lib/email';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const env = process.env.PAYPAL_ENV || 'sandbox';
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Paypal credentials not configured' }, { status: 500 });
  }

  const accessToken = await getAccessToken(clientId, clientSecret, env);

  if (action === 'create') {
    const body = await req.json();
    // body should be a valid PayPal order payload
    const ppOrder = await createPayPalOrder(accessToken, env, body);
    return NextResponse.json(ppOrder);
  }

  if (action === 'capture') {
    const { orderId, localOrderId, cartId } = await req.json();
    const capture = await capturePayPalOrder(accessToken, env, orderId);

    try {
      // Attempt to extract capture id/status
      let captureId: string | null = null;
      let captureStatus = (capture && capture.status) || 'COMPLETED';

      // PayPal capture details can be nested
      try {
        const pu = capture.purchase_units?.[0];
        captureId = pu?.payments?.captures?.[0]?.id || capture.id || null;
      } catch (e) {
        captureId = capture.id || null;
      }

      // create payment record
      await prisma.payment.create({
        data: {
          provider: 'paypal',
          providerOrderId: orderId,
          providerCaptureId: captureId,
          status: captureStatus,
          rawResponse: JSON.stringify(capture),
          order: localOrderId ? { connect: { id: localOrderId } } : undefined
        }
      });

      if (localOrderId) {
        // fetch order with items
        const order = await prisma.order.findUnique({ where: { id: localOrderId }, include: { items: true } });
        if (order) {
          // mark paid
          await prisma.order.update({ where: { id: localOrderId }, data: { status: 'PROCESSING' } });

          // reduce inventory and create adjustments
          for (const item of order.items) {
            await prisma.inventoryAdjustment.create({ data: { productId: item.productId, delta: -item.quantity, reason: 'SALE' } });
            await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
          }

          // generate invoice PDF
          const freshOrder = await prisma.order.findUnique({ where: { id: localOrderId }, include: { items: true } });
          if (freshOrder) {
            const invoicePath = await generateInvoicePdf(freshOrder);
            await prisma.order.update({ where: { id: localOrderId }, data: { invoicePath, status: 'PAID' } });

            // send receipt email
            try {
              await sendReceiptEmail(localOrderId);
            } catch (e) {
              console.error('Failed to send receipt email', e);
            }
          }
        }
      }
      // clear cart items if cartId provided
      if (cartId) {
        try {
          await prisma.cartItem.deleteMany({ where: { cartId } });
        } catch (e) {
          console.error('Failed to clear cart items for cartId', cartId, e);
        }
      }
    } catch (err) {
      console.error('Error processing capture:', err);
    }

    return NextResponse.json(capture);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
