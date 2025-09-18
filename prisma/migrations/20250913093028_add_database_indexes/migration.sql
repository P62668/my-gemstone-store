-- CreateIndex
CREATE INDEX IF NOT EXISTS "gemstone_category_id_idx" ON "gemstones"("categoryId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "gemstone_featured_idx" ON "gemstones"("featured");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "gemstone_price_idx" ON "gemstones"("price");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "gemstone_created_at_idx" ON "gemstones"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "category_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "order_user_id_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "order_created_at_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "seo_page_idx" ON "seo"("page");