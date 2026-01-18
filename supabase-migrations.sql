-- Supabase/PostgreSQL migrations for PP E-commerce

-- Create User table
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  role TEXT DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Address table
CREATE TABLE "Address" (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  label TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  postal TEXT NOT NULL,
  country TEXT NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"(id)
);

-- Create Category table
CREATE TABLE "Category" (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Create Product table
CREATE TABLE "Product" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  "compareAtPrice" INTEGER,
  currency TEXT DEFAULT 'USD',
  stock INTEGER DEFAULT 0,
  sku TEXT,
  rating DECIMAL DEFAULT 0,
  "categoryId" TEXT,
  tags TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("categoryId") REFERENCES "Category"(id)
);

-- Create ProductImage table
CREATE TABLE "ProductImage" (
  id TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE
);

-- Create Cart table
CREATE TABLE "Cart" (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  "cookieId" TEXT UNIQUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id)
);

-- Create CartItem table
CREATE TABLE "CartItem" (
  id TEXT PRIMARY KEY,
  "cartId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  FOREIGN KEY ("cartId") REFERENCES "Cart"(id) ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "Product"(id)
);

-- Create Order table
CREATE TABLE "Order" (
  id TEXT PRIMARY KEY,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "userId" TEXT,
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL,
  tax INTEGER NOT NULL,
  discount INTEGER NOT NULL,
  total INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'PENDING',
  "invoicePath" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id)
);

-- Create OrderItem table
CREATE TABLE "OrderItem" (
  id TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "Product"(id)
);

-- Create DiscountCode table
CREATE TABLE "DiscountCode" (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  "startsAt" TIMESTAMP,
  "endsAt" TIMESTAMP
);

-- Create Payment table
CREATE TABLE "Payment" (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  "providerOrderId" TEXT UNIQUE NOT NULL,
  "providerCaptureId" TEXT,
  status TEXT NOT NULL,
  "rawResponse" TEXT,
  "orderId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("orderId") REFERENCES "Order"(id)
);

-- Create InventoryAdjustment table
CREATE TABLE "InventoryAdjustment" (
  id TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"(id)
);

-- Create indexes for performance
CREATE INDEX "User_email_idx" ON "User"(email);
CREATE INDEX "Product_slug_idx" ON "Product"(slug);
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");
CREATE INDEX "Cart_cookieId_idx" ON "Cart"("cookieId");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");
