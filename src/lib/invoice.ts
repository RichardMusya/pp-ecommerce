import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export async function generateInvoicePdf(order: any) {
  const doc = new PDFDocument({ size: 'A4' });
  const invoicesDir = path.resolve(process.cwd(), 'invoices');
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

  const filename = `INV-${new Date(order.createdAt).getFullYear()}-${String(order.id).slice(0, 6)}.pdf`;
  const filePath = path.join(invoicesDir, filename);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Order: ${order.orderNumber}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.moveDown();

  order.items.forEach((it: any) => {
    doc.text(`${it.name} x${it.quantity} — $${(it.price / 100).toFixed(2)}`);
  });

  doc.moveDown();
  doc.text(`Subtotal: $${(order.subtotal / 100).toFixed(2)}`);
  doc.text(`Tax: $${(order.tax / 100).toFixed(2)}`);
  doc.text(`Shipping: $${(order.shipping / 100).toFixed(2)}`);
  doc.moveDown();
  doc.fontSize(14).text(`Total: $${(order.total / 100).toFixed(2)}`);

  doc.end();

  await new Promise((res) => stream.on('finish', res));
  return filePath;
}
