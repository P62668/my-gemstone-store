-- CreateTable
CREATE TABLE "session_wishlists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "session_wishlist_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT NOT NULL,
    "gemstoneId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "session_wishlist_items_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "session_wishlists" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "session_wishlist_items_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "gemstones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "session_wishlists_sessionId_key" ON "session_wishlists"("sessionId");

-- CreateIndex
CREATE INDEX "session_wishlists_sessionId_idx" ON "session_wishlists"("sessionId");

-- CreateIndex
CREATE INDEX "session_wishlists_createdAt_idx" ON "session_wishlists"("createdAt");

-- CreateIndex
CREATE INDEX "session_wishlist_items_sessionId_idx" ON "session_wishlist_items"("sessionId");

-- CreateIndex
CREATE INDEX "session_wishlist_items_gemstoneId_idx" ON "session_wishlist_items"("gemstoneId");

-- CreateIndex
CREATE INDEX "session_wishlist_items_createdAt_idx" ON "session_wishlist_items"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_wishlist_items_sessionId_gemstoneId_key" ON "session_wishlist_items"("sessionId", "gemstoneId");
