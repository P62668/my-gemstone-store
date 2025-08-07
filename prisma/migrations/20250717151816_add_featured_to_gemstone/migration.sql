-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Gemstone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "images" TEXT NOT NULL,
    "certification" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" INTEGER,
    CONSTRAINT "Gemstone_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Gemstone" ("active", "categoryId", "certification", "createdAt", "description", "id", "images", "name", "price", "type", "updatedAt") SELECT "active", "categoryId", "certification", "createdAt", "description", "id", "images", "name", "price", "type", "updatedAt" FROM "Gemstone";
DROP TABLE "Gemstone";
ALTER TABLE "new_Gemstone" RENAME TO "Gemstone";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
