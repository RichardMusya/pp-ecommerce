# Fix ESLint Errors and Vercel Build Issues

## ✅ Completed
- 

## 📋 To Do

### Errors (4)
- [ ] Fix src/app/admin/categories/page.tsx - Remove unused `page` and `take` variables
- [ ] Fix src/app/admin/seed/page.tsx - Remove unused `useEffect` import
- [ ] Fix src/lib/prisma.ts - Remove or rename unused `prisma` variable
- [ ] Fix src/app/admin/products/page.tsx - Wrap `load` in useCallback()

### Warnings (7)
- [ ] Fix src/components/PayPalButton.tsx - Remove ref.current from useEffect dependencies
- [ ] Fix src/app/cart/page.tsx - Replace <img> with Next.js <Image />
- [ ] Fix src/app/category/[slug]/page.tsx - Replace <img> with Next.js <Image />
- [ ] Fix src/app/page.tsx - Replace <img> with Next.js <Image />
- [ ] Fix src/app/product/[slug]/page.tsx - Replace <img> with Next.js <Image />
- [ ] Fix src/app/products/page.tsx - Replace <img> with Next.js <Image />

### Vercel Build
- [ ] Run pnpm install --no-frozen-lockfile to update lockfile

## Final Verification
- [ ] Run ESLint to confirm no errors
- [ ] Run build to confirm successful compilation

