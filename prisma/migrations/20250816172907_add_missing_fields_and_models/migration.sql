/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderNumber` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "name" TEXT;

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "navigation_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menuItems" JSONB NOT NULL,
    "footerLinks" JSONB NOT NULL,
    "socialLinks" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_addresses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_addresses" ("address1", "address2", "city", "company", "country", "createdAt", "firstName", "id", "isDefault", "lastName", "phone", "postalCode", "state", "type", "updatedAt", "userId") SELECT "address1", "address2", "city", "company", "country", "createdAt", "firstName", "id", "isDefault", "lastName", "phone", "postalCode", "state", "type", "updatedAt", "userId" FROM "addresses";
DROP TABLE "addresses";
ALTER TABLE "new_addresses" RENAME TO "addresses";
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");
CREATE INDEX "addresses_type_idx" ON "addresses"("type");
CREATE INDEX "addresses_isDefault_idx" ON "addresses"("isDefault");
CREATE INDEX "addresses_createdAt_idx" ON "addresses"("createdAt");
CREATE TABLE "new_cart_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "gemstoneId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cart_items_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "gemstones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_cart_items" ("createdAt", "gemstoneId", "id", "price", "quantity", "updatedAt", "userId") SELECT "createdAt", "gemstoneId", "id", "price", "quantity", "updatedAt", "userId" FROM "cart_items";
DROP TABLE "cart_items";
ALTER TABLE "new_cart_items" RENAME TO "cart_items";
CREATE INDEX "cart_items_userId_idx" ON "cart_items"("userId");
CREATE INDEX "cart_items_gemstoneId_idx" ON "cart_items"("gemstoneId");
CREATE INDEX "cart_items_createdAt_idx" ON "cart_items"("createdAt");
CREATE UNIQUE INDEX "cart_items_userId_gemstoneId_key" ON "cart_items"("userId", "gemstoneId");
CREATE TABLE "new_gemstones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "salePrice" REAL,
    "categoryId" INTEGER NOT NULL,
    "images" TEXT NOT NULL,
    "weight" REAL,
    "dimensions" TEXT,
    "clarity" TEXT,
    "color" TEXT,
    "cut" TEXT,
    "origin" TEXT,
    "certificate" TEXT,
    "stockCount" INTEGER NOT NULL DEFAULT 0,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "gemstones_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_gemstones" ("active", "categoryId", "certificate", "clarity", "color", "createdAt", "cut", "description", "dimensions", "featured", "id", "images", "name", "origin", "price", "salePrice", "stockCount", "updatedAt", "weight") SELECT "active", "categoryId", "certificate", "clarity", "color", "createdAt", "cut", "description", "dimensions", "featured", "id", "images", "name", "origin", "price", "salePrice", "stockCount", "updatedAt", "weight" FROM "gemstones";
DROP TABLE "gemstones";
ALTER TABLE "new_gemstones" RENAME TO "gemstones";
CREATE INDEX "gemstones_categoryId_idx" ON "gemstones"("categoryId");
CREATE INDEX "gemstones_price_idx" ON "gemstones"("price");
CREATE INDEX "gemstones_featured_idx" ON "gemstones"("featured");
CREATE INDEX "gemstones_active_idx" ON "gemstones"("active");
CREATE INDEX "gemstones_stockCount_idx" ON "gemstones"("stockCount");
CREATE INDEX "gemstones_createdAt_idx" ON "gemstones"("createdAt");
CREATE INDEX "gemstones_name_idx" ON "gemstones"("name");
CREATE TABLE "new_inventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gemstoneId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "inventory_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "gemstones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_inventory" ("createdAt", "gemstoneId", "id", "location", "notes", "quantity", "updatedAt") SELECT "createdAt", "gemstoneId", "id", "location", "notes", "quantity", "updatedAt" FROM "inventory";
DROP TABLE "inventory";
ALTER TABLE "new_inventory" RENAME TO "inventory";
CREATE INDEX "inventory_gemstoneId_idx" ON "inventory"("gemstoneId");
CREATE INDEX "inventory_quantity_idx" ON "inventory"("quantity");
CREATE INDEX "inventory_createdAt_idx" ON "inventory"("createdAt");
CREATE TABLE "new_order_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "gemstoneId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "gemstones" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_order_items" ("createdAt", "gemstoneId", "id", "orderId", "price", "quantity") SELECT "createdAt", "gemstoneId", "id", "orderId", "price", "quantity" FROM "order_items";
DROP TABLE "order_items";
ALTER TABLE "new_order_items" RENAME TO "order_items";
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX "order_items_gemstoneId_idx" ON "order_items"("gemstoneId");
CREATE INDEX "order_items_createdAt_idx" ON "order_items"("createdAt");
CREATE TABLE "new_order_status_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_order_status_history" ("comment", "createdAt", "id", "orderId", "status") SELECT "comment", "createdAt", "id", "orderId", "status" FROM "order_status_history";
DROP TABLE "order_status_history";
ALTER TABLE "new_order_status_history" RENAME TO "order_status_history";
CREATE INDEX "order_status_history_orderId_idx" ON "order_status_history"("orderId");
CREATE INDEX "order_status_history_status_idx" ON "order_status_history"("status");
CREATE INDEX "order_status_history_createdAt_idx" ON "order_status_history"("createdAt");
CREATE TABLE "new_orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentIntentId" TEXT,
    "shippingAddress" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "notes" TEXT,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "id", "notes", "paymentStatus", "shippingAddress", "status", "total", "trackingNumber", "updatedAt", "userId") SELECT "createdAt", "id", "notes", "paymentStatus", "shippingAddress", "status", "total", "trackingNumber", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX "orders_trackingNumber_idx" ON "orders"("trackingNumber");
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");
CREATE INDEX "orders_paymentIntentId_idx" ON "orders"("paymentIntentId");
CREATE TABLE "new_recently_viewed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "gemstoneId" INTEGER NOT NULL,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recently_viewed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recently_viewed_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "gemstones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recently_viewed" ("gemstoneId", "id", "userId", "viewedAt") SELECT "gemstoneId", "id", "userId", "viewedAt" FROM "recently_viewed";
DROP TABLE "recently_viewed";
ALTER TABLE "new_recently_viewed" RENAME TO "recently_viewed";
CREATE INDEX "recently_viewed_userId_idx" ON "recently_viewed"("userId");
CREATE INDEX "recently_viewed_gemstoneId_idx" ON "recently_viewed"("gemstoneId");
CREATE INDEX "recently_viewed_viewedAt_idx" ON "recently_viewed"("viewedAt");
CREATE TABLE "new_returns" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "refundAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "returns_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_returns" ("createdAt", "description", "id", "orderId", "reason", "refundAmount", "status", "updatedAt") SELECT "createdAt", "description", "id", "orderId", "reason", "refundAmount", "status", "updatedAt" FROM "returns";
DROP TABLE "returns";
ALTER TABLE "new_returns" RENAME TO "returns";
CREATE INDEX "returns_orderId_idx" ON "returns"("orderId");
CREATE INDEX "returns_status_idx" ON "returns"("status");
CREATE INDEX "returns_createdAt_idx" ON "returns"("createdAt");
CREATE TABLE "new_reviews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "gemstoneId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "gemstones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reviews" ("comment", "createdAt", "gemstoneId", "id", "rating", "title", "updatedAt", "userId", "verified") SELECT "comment", "createdAt", "gemstoneId", "id", "rating", "title", "updatedAt", "userId", "verified" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");
CREATE INDEX "reviews_gemstoneId_idx" ON "reviews"("gemstoneId");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX "reviews_verified_idx" ON "reviews"("verified");
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");
CREATE TABLE "new_wishlist_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "gemstoneId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wishlist_items_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "gemstones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_wishlist_items" ("createdAt", "gemstoneId", "id", "userId") SELECT "createdAt", "gemstoneId", "id", "userId" FROM "wishlist_items";
DROP TABLE "wishlist_items";
ALTER TABLE "new_wishlist_items" RENAME TO "wishlist_items";
CREATE INDEX "wishlist_items_userId_idx" ON "wishlist_items"("userId");
CREATE INDEX "wishlist_items_gemstoneId_idx" ON "wishlist_items"("gemstoneId");
CREATE INDEX "wishlist_items_createdAt_idx" ON "wishlist_items"("createdAt");
CREATE UNIQUE INDEX "wishlist_items_userId_gemstoneId_key" ON "wishlist_items"("userId", "gemstoneId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "admin_audit_logs_userId_idx" ON "admin_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs"("action");

-- CreateIndex
CREATE INDEX "admin_audit_logs_resource_idx" ON "admin_audit_logs"("resource");

-- CreateIndex
CREATE INDEX "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_email_idx" ON "password_resets"("email");

-- CreateIndex
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_expiresAt_idx" ON "password_resets"("expiresAt");

-- CreateIndex
CREATE INDEX "password_resets_used_idx" ON "password_resets"("used");

-- CreateIndex
CREATE INDEX "navigation_settings_createdAt_idx" ON "navigation_settings"("createdAt");

-- CreateIndex
CREATE INDEX "banners_active_idx" ON "banners"("active");

-- CreateIndex
CREATE INDEX "banners_order_idx" ON "banners"("order");

-- CreateIndex
CREATE INDEX "banners_createdAt_idx" ON "banners"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_active_idx" ON "categories"("active");

-- CreateIndex
CREATE INDEX "categories_createdAt_idx" ON "categories"("createdAt");

-- CreateIndex
CREATE INDEX "faqs_category_idx" ON "faqs"("category");

-- CreateIndex
CREATE INDEX "faqs_active_idx" ON "faqs"("active");

-- CreateIndex
CREATE INDEX "faqs_order_idx" ON "faqs"("order");

-- CreateIndex
CREATE INDEX "faqs_createdAt_idx" ON "faqs"("createdAt");

-- CreateIndex
CREATE INDEX "homepage_sections_key_idx" ON "homepage_sections"("key");

-- CreateIndex
CREATE INDEX "homepage_sections_active_idx" ON "homepage_sections"("active");

-- CreateIndex
CREATE INDEX "homepage_sections_order_idx" ON "homepage_sections"("order");

-- CreateIndex
CREATE INDEX "homepage_sections_createdAt_idx" ON "homepage_sections"("createdAt");

-- CreateIndex
CREATE INDEX "press_active_idx" ON "press"("active");

-- CreateIndex
CREATE INDEX "press_date_idx" ON "press"("date");

-- CreateIndex
CREATE INDEX "press_createdAt_idx" ON "press"("createdAt");

-- CreateIndex
CREATE INDEX "seo_page_idx" ON "seo"("page");

-- CreateIndex
CREATE INDEX "seo_createdAt_idx" ON "seo"("createdAt");

-- CreateIndex
CREATE INDEX "shipping_active_idx" ON "shipping"("active");

-- CreateIndex
CREATE INDEX "shipping_price_idx" ON "shipping"("price");

-- CreateIndex
CREATE INDEX "shipping_createdAt_idx" ON "shipping"("createdAt");

-- CreateIndex
CREATE INDEX "site_settings_key_idx" ON "site_settings"("key");

-- CreateIndex
CREATE INDEX "testimonials_active_idx" ON "testimonials"("active");

-- CreateIndex
CREATE INDEX "testimonials_rating_idx" ON "testimonials"("rating");

-- CreateIndex
CREATE INDEX "testimonials_createdAt_idx" ON "testimonials"("createdAt");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_active_idx" ON "users"("active");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
