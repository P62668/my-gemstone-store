-- CreateTable
CREATE TABLE "SEOSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "global" JSONB,
    "pages" JSONB,
    "social" JSONB,
    "analytics" JSONB,
    "structuredData" JSONB,
    "updatedAt" DATETIME NOT NULL
);
