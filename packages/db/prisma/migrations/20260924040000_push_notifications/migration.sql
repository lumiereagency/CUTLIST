-- Notificações push (Web Push/PWA) para equipe e cliente final.

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN "reminder_push_sent_at" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "barbershop_id" UUID NOT NULL,
    "user_id" UUID,
    "barbershop_customer_id" UUID,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_barbershop_id_user_id_idx" ON "push_subscriptions"("barbershop_id", "user_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_barbershop_id_barbershop_customer_id_idx" ON "push_subscriptions"("barbershop_id", "barbershop_customer_id");

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_barbershop_id_fkey" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_barbershop_customer_id_fkey" FOREIGN KEY ("barbershop_customer_id") REFERENCES "barbershop_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
-- Índice parcial pra varredura de lembrete do worker: só agendamentos
-- CONFIRMED ainda sem push de lembrete entram aqui, então o índice fica
-- pequeno mesmo com o histórico crescendo (não expressável na DSL do Prisma).
CREATE INDEX "appointments_reminder_sweep_idx" ON "appointments"("starts_at")
  WHERE "reminder_push_sent_at" IS NULL AND "status" = 'CONFIRMED';

-- Um dispositivo só pode ser inscrito por UM dono OU por UM cliente, nunca os
-- dois nem nenhum — validado aqui em vez de só na aplicação porque é uma
-- invariante de dado, não uma regra de negócio que muda.
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_owner_xor_check"
  CHECK (
    ("user_id" IS NOT NULL AND "barbershop_customer_id" IS NULL)
    OR ("user_id" IS NULL AND "barbershop_customer_id" IS NOT NULL)
  );
