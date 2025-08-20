-- CreateTable
CREATE TABLE "session_carts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "session_cart_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT NOT NULL,
    "gemstoneId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "session_cart_items_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "session_carts" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "session_cart_items_gemstoneId_fkey" FOREIGN KEY ("gemstoneId") REFERENCES "gemstones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "session_carts_sessionId_key" ON "session_carts"("sessionId");

-- CreateIndex
CREATE INDEX "session_carts_sessionId_idx" ON "session_carts"("sessionId");

-- CreateIndex
CREATE INDEX "session_carts_createdAt_idx" ON "session_carts"("createdAt");

-- CreateIndex
CREATE INDEX "session_cart_items_sessionId_idx" ON "session_cart_items"("sessionId");

-- CreateIndex
CREATE INDEX "session_cart_items_gemstoneId_idx" ON "session_cart_items"("gemstoneId");

-- CreateIndex
CREATE INDEX "session_cart_items_createdAt_idx" ON "session_cart_items"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_cart_items_sessionId_gemstoneId_key" ON "session_cart_items"("sessionId", "gemstoneId");
