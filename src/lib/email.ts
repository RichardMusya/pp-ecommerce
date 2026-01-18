import nodemailer from 'nodemailer';
import { prisma } from './prisma';

const smtpHost = process.env.SMTP_HOST || 'localhost';
const smtpPort = Number(process.env.SMTP_PORT || 1025);
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  auth: smtpUser || smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
});

export async function sendReceiptEmail(orderId: string, to?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, payment: true, user: true } });
  if (!order) throw new Error('Order not found');

  const email = to || order.user?.email;
  if (!email) return;

  const subject = `Receipt for ${order.orderNumber}`;
  const itemsHtml = order.items.map((it) => `<li>${it.name} x${it.quantity} — $${(it.price/100).toFixed(2)}</li>`).join('');
  const html = `<p>Thank you for your purchase.</p>
  <p>Order: ${order.orderNumber}</p>
  <ul>${itemsHtml}</ul>
  <p>Total: $${(order.total/100).toFixed(2)}</p>`;

  const attachments: any[] = [];
  if (order.invoicePath) {
    attachments.push({ filename: 'invoice.pdf', path: order.invoicePath });
  }

  await transporter.sendMail({
    from: 'no-reply@example.com',
    to: email,
    subject,
    html,
    attachments
  });
}
