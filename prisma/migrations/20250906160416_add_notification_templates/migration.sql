/*
  Warnings:

  - You are about to alter the column `metaTags` on the `SEO` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `structuredData` on the `SEO` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - Added the required column `pageId` to the `banners` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "featured_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gemstoneId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "featured_products_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "gemstones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "featured_products_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "promotional_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "layout" TEXT DEFAULT 'left',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "pageId" INTEGER NOT NULL,
    CONSTRAINT "promotional_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "settings" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "pageId" INTEGER NOT NULL,
    CONSTRAINT "content_blocks_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'email',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SEO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "page" TEXT NOT NULL DEFAULT 'global',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT,
    "ogImage" TEXT DEFAULT '/images/og-image.jpg',
    "robots" TEXT DEFAULT 'index, follow',
    "canonical" TEXT,
    "metaTags" JSONB,
    "structuredData" JSONB,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SEO" ("canonical", "description", "id", "keywords", "metaTags", "ogImage", "page", "robots", "structuredData", "title", "updatedAt") SELECT "canonical", "description", "id", "keywords", "metaTags", "ogImage", "page", "robots", "structuredData", "title", "updatedAt" FROM "SEO";
DROP TABLE "SEO";
ALTER TABLE "new_SEO" RENAME TO "SEO";
CREATE TABLE "new_banners" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "pageId" INTEGER NOT NULL,
    CONSTRAINT "banners_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_banners" ("active", "createdAt", "id", "image", "link", "order", "subtitle", "title", "updatedAt") SELECT "active", "createdAt", "id", "image", "link", "order", "subtitle", "title", "updatedAt" FROM "banners";
DROP TABLE "banners";
ALTER TABLE "new_banners" RENAME TO "banners";
CREATE INDEX "banners_pageId_idx" ON "banners"("pageId");
CREATE INDEX "banners_active_idx" ON "banners"("active");
CREATE INDEX "banners_order_idx" ON "banners"("order");
CREATE INDEX "banners_createdAt_idx" ON "banners"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "featured_products_pageId_idx" ON "featured_products"("pageId");

-- CreateIndex
CREATE INDEX "featured_products_gemstoneId_idx" ON "featured_products"("gemstoneId");

-- CreateIndex
CREATE INDEX "featured_products_order_idx" ON "featured_products"("order");

-- CreateIndex
CREATE INDEX "featured_products_createdAt_idx" ON "featured_products"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "featured_products_pageId_gemstoneId_key" ON "featured_products"("pageId", "gemstoneId");

-- CreateIndex
CREATE INDEX "promotional_sections_pageId_idx" ON "promotional_sections"("pageId");

-- CreateIndex
CREATE INDEX "promotional_sections_active_idx" ON "promotional_sections"("active");

-- CreateIndex
CREATE INDEX "promotional_sections_order_idx" ON "promotional_sections"("order");

-- CreateIndex
CREATE INDEX "promotional_sections_createdAt_idx" ON "promotional_sections"("createdAt");

-- CreateIndex
CREATE INDEX "content_blocks_pageId_idx" ON "content_blocks"("pageId");

-- CreateIndex
CREATE INDEX "content_blocks_type_idx" ON "content_blocks"("type");

-- CreateIndex
CREATE INDEX "content_blocks_order_idx" ON "content_blocks"("order");

-- CreateIndex
CREATE INDEX "content_blocks_createdAt_idx" ON "content_blocks"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_name_key" ON "notification_templates"("name");

-- CreateIndex
CREATE INDEX "notification_templates_name_idx" ON "notification_templates"("name");

-- CreateIndex
CREATE INDEX "notification_templates_type_idx" ON "notification_templates"("type");

-- CreateIndex
CREATE INDEX "notification_templates_createdAt_idx" ON "notification_templates"("createdAt");
