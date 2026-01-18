# Build Fix TODO List

## Config Fixes
- [x] Fix next.config.mjs - remove deprecated appDir: true

## ESLint Unused Variables
- [x] Fix src/app/admin/categories/page.tsx - remove _page, _take
- [x] Fix src/app/admin/categories/ssr/page.tsx - remove total
- [x] Fix src/app/admin/products/ssr/page.tsx - remove total
- [x] Fix src/app/admin/seed/page.tsx - remove useEffect import
- [x] Fix src/app/api/auth/[...nextauth]/route.ts - remove NextResponse import
- [x] Fix src/app/api/auth/register/route.ts - remove user variable
- [x] Fix src/app/cart/page.tsx - remove e parameter
- [x] Fix src/app/checkout/page.tsx - remove status variable
- [x] Fix src/components/PayPalButton.tsx - remove actions, capture variables
- [x] Fix src/lib/prisma.ts - remove prisma variable (but re-added export)

## ESLint Undefined Variables
- [x] Fix src/app/layout.tsx - React.ReactNode type
- [x] Fix src/components/AdminGuard.tsx - add ReactNode import
- [x] Fix src/components/Header.tsx - EventListener type
- [x] Fix src/components/Providers.tsx - add ReactNode import

## React Hook Warnings
- [x] Fix src/app/admin/products/page.tsx - add load to deps
- [x] Fix src/components/PayPalButton.tsx - add missing deps

## Missing Dependencies
- [x] Add encoding package
- [x] Add iconv-lite package
- [x] Add @types/iconv-lite package

