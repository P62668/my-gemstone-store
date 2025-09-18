-- CreateIndex for SecurityLog table
CREATE INDEX IF NOT EXISTS "security_log_timestamp_idx" ON "security_logs"("timestamp");
CREATE INDEX IF NOT EXISTS "security_log_event_idx" ON "security_logs"("event");
CREATE INDEX IF NOT EXISTS "security_log_user_id_idx" ON "security_logs"("userId");
CREATE INDEX IF NOT EXISTS "security_log_ip_idx" ON "security_logs"("ip");

-- CreateIndex for AdminAuditLog table
CREATE INDEX IF NOT EXISTS "admin_audit_log_user_id_idx" ON "admin_audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "admin_audit_log_action_idx" ON "admin_audit_logs"("action");
CREATE INDEX IF NOT EXISTS "admin_audit_log_resource_idx" ON "admin_audit_logs"("resource");
CREATE INDEX IF NOT EXISTS "admin_audit_log_created_at_idx" ON "admin_audit_logs"("createdAt");

-- CreateIndex for User table
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "user_active_idx" ON "users"("active");

-- CreateIndex for PasswordReset table
CREATE INDEX IF NOT EXISTS "password_reset_email_idx" ON "password_resets"("email");
CREATE INDEX IF NOT EXISTS "password_reset_token_idx" ON "password_resets"("token");
CREATE INDEX IF NOT EXISTS "password_reset_expires_at_idx" ON "password_resets"("expiresAt");
CREATE INDEX IF NOT EXISTS "password_reset_used_idx" ON "password_resets"("used");