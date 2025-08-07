/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Gemstone` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Gemstone_name_key" ON "Gemstone"("name");

-- CreateIndex
CREATE INDEX "Gemstone_type_idx" ON "Gemstone"("type");

-- CreateIndex
CREATE INDEX "Gemstone_price_idx" ON "Gemstone"("price");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_gemstoneId_idx" ON "OrderItem"("gemstoneId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
