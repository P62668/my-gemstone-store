/*
  Warnings:

  - You are about to drop the `SEO` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SEO";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "seo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "page" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT,
    "ogImage" TEXT DEFAULT '/images/og-image.jpg',
    "robots" TEXT DEFAULT 'index, follow',
    "canonical" TEXT,
    "metaTags" TEXT,
    "structuredData" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_page_key" ON "seo"("page");

-- CreateIndex
CREATE INDEX "seo_page_idx" ON "seo"("page");
