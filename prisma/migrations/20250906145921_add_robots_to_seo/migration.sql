/*
  Warnings:

  - You are about to drop the `seo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "seo";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SEO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "page" TEXT NOT NULL DEFAULT 'global',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT,
    "ogImage" TEXT DEFAULT '/images/og-image.jpg',
    "robots" TEXT DEFAULT 'index, follow',
    "structuredData" TEXT,
    "updatedAt" DATETIME NOT NULL
);
