import { ProductCreateSchema, CategoryCreateSchema, CheckoutValidateSchema } from '../src/lib/validators';

test('product create schema accepts valid data', () => {
  const res = ProductCreateSchema.safeParse({ name: 'Test', price: 1000 });
  expect(res.success).toBe(true);
});

test('category create schema rejects empty name', () => {
  const res = CategoryCreateSchema.safeParse({ name: '' });
  expect(res.success).toBe(false);
});

test('checkout validate schema accepts valid items', () => {
  const res = CheckoutValidateSchema.safeParse({ items: [{ productId: 'p1', quantity: 2 }] });
  expect(res.success).toBe(true);
});
