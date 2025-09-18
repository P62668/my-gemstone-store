-- AlterTable
ALTER TABLE "users" ADD COLUMN "image" TEXT;

-- CreateTable
CREATE TABLE "loyalty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'Bronze',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "loyalty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_gemstones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "salePrice" REAL,
    "dynamicPrice" REAL,
    "categoryId" INTEGER NOT NULL,
    "images" TEXT NOT NULL,
    "weight" REAL,
    "dimensions" TEXT,
    "clarity" TEXT,
    "color" TEXT,
    "cut" TEXT,
    "origin" TEXT,
    "certificate" TEXT,
    "tags" TEXT,
    "averageRating" REAL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "stockCount" INTEGER NOT NULL DEFAULT 0,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "cashOnDelivery" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "gemstones_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_gemstones" ("active", "cashOnDelivery", "categoryId", "certificate", "clarity", "color", "createdAt", "cut", "description", "dimensions", "featured", "id", "images", "lowStockThreshold", "name", "origin", "price", "salePrice", "stockCount", "stockQuantity", "updatedAt", "weight") SELECT "active", "cashOnDelivery", "categoryId", "certificate", "clarity", "color", "createdAt", "cut", "description", "dimensions", "featured", "id", "images", "lowStockThreshold", "name", "origin", "price", "salePrice", "stockCount", "stockQuantity", "updatedAt", "weight" FROM "gemstones";
DROP TABLE "gemstones";
ALTER TABLE "new_gemstones" RENAME TO "gemstones";
CREATE INDEX "gemstones_categoryId_idx" ON "gemstones"("categoryId");
CREATE INDEX "gemstones_price_idx" ON "gemstones"("price");
CREATE INDEX "gemstones_featured_idx" ON "gemstones"("featured");
CREATE INDEX "gemstones_active_idx" ON "gemstones"("active");
CREATE INDEX "gemstones_stockCount_idx" ON "gemstones"("stockCount");
CREATE INDEX "gemstones_createdAt_idx" ON "gemstones"("createdAt");
CREATE INDEX "gemstones_name_idx" ON "gemstones"("name");
CREATE TABLE "new_reviews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "gemstoneId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reviews_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "gemstones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reviews" ("comment", "createdAt", "gemstoneId", "id", "rating", "title", "updatedAt", "userId", "verified") SELECT "comment", "createdAt", "gemstoneId", "id", "rating", "title", "updatedAt", "userId", "verified" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");
CREATE INDEX "reviews_gemstoneId_idx" ON "reviews"("gemstoneId");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX "reviews_verified_idx" ON "reviews"("verified");
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_userId_key" ON "loyalty"("userId");

-- CreateIndex
CREATE INDEX "loyalty_userId_idx" ON "loyalty"("userId");

-- CreateIndex
CREATE INDEX "loyalty_points_idx" ON "loyalty"("points");

-- CreateIndex
CREATE INDEX "loyalty_tier_idx" ON "loyalty"("tier");

-- CreateIndex
CREATE INDEX "loyalty_createdAt_idx" ON "loyalty"("createdAt");
