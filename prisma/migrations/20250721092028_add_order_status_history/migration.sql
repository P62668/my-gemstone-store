-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NavigationSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mainMenu" JSONB NOT NULL,
    "footerMenu" JSONB NOT NULL,
    "socialLinks" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NavigationSettings" ("footerMenu", "id", "mainMenu", "socialLinks", "updatedAt") SELECT "footerMenu", "id", "mainMenu", "socialLinks", "updatedAt" FROM "NavigationSettings";
DROP TABLE "NavigationSettings";
ALTER TABLE "new_NavigationSettings" RENAME TO "NavigationSettings";
CREATE TABLE "new_SEOSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "global" JSONB NOT NULL,
    "pages" JSONB NOT NULL,
    "social" JSONB NOT NULL,
    "analytics" JSONB NOT NULL,
    "structuredData" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SEOSettings" ("analytics", "global", "id", "pages", "social", "structuredData", "updatedAt") SELECT "analytics", "global", "id", "pages", "social", "structuredData", "updatedAt" FROM "SEOSettings";
DROP TABLE "SEOSettings";
ALTER TABLE "new_SEOSettings" RENAME TO "SEOSettings";
CREATE TABLE "new_SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "about" TEXT,
    "contact" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("about", "address", "contact", "email", "id", "phone", "updatedAt") SELECT "about", "address", "contact", "email", "id", "phone", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
