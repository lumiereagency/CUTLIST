-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "payment_reported_at" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "platform_admin_sessions" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_admin_sessions_token_hash_key" ON "platform_admin_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "platform_admin_sessions_admin_id_idx" ON "platform_admin_sessions"("admin_id");

-- AddForeignKey
ALTER TABLE "platform_admin_sessions" ADD CONSTRAINT "platform_admin_sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "platform_admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
