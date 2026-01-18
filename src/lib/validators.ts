import { z } from 'zod';

export const ProductCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  sku: z.string().optional(),
  categoryId: z.string().optional()
});

export const ProductUpdateSchema = ProductCreateSchema.extend({ id: z.string() });

export const CategoryCreateSchema = z.object({ name: z.string().min(1) });

export const CategoryUpdateSchema = CategoryCreateSchema.extend({ id: z.string() });

export const DiscountSchema = z.object({ code: z.string().min(1), type: z.enum(['PERCENT', 'FIXED']), amount: z.number().int() });

export const CheckoutValidateSchema = z.object({ items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })) });
