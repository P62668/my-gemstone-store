-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "cashOnDelivery" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "gemstones_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_gemstones" ("active", "categoryId", "certificate", "clarity", "color", "createdAt", "cut", "description", "dimensions", "featured", "id", "images", "lowStockThreshold", "name", "origin", "price", "salePrice", "stockCount", "stockQuantity", "updatedAt", "weight") SELECT "active", "categoryId", "certificate", "clarity", "color", "createdAt", "cut", "description", "dimensions", "featured", "id", "images", "lowStockThreshold", "name", "origin", "price", "salePrice", "stockCount", "stockQuantity", "updatedAt", "weight" FROM "gemstones";
DROP TABLE "gemstones";
ALTER TABLE "new_gemstones" RENAME TO "gemstones";
CREATE INDEX "gemstones_categoryId_idx" ON "gemstones"("categoryId");
CREATE INDEX "gemstones_price_idx" ON "gemstones"("price");
CREATE INDEX "gemstones_featured_idx" ON "gemstones"("featured");
CREATE INDEX "gemstones_active_idx" ON "gemstones"("active");
CREATE INDEX "gemstones_stockCount_idx" ON "gemstones"("stockCount");
CREATE INDEX "gemstones_createdAt_idx" ON "gemstones"("createdAt");
CREATE INDEX "gemstones_name_idx" ON "gemstones"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
