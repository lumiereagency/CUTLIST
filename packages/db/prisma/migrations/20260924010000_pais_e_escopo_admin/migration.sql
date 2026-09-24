-- Marco 7: base para vender no Paraguai/Uruguai via parceiro (país na loja +
-- preço por país + escopo regional do admin da plataforma).

-- AlterTable
ALTER TABLE "barbershops" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'BR';

-- AlterTable
ALTER TABLE "plans" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'BR';

-- Cada código de plano volta a poder existir uma vez por país (preço/moeda
-- próprios), não globalmente único como antes.
DROP INDEX "plans_code_key";
CREATE UNIQUE INDEX "plans_code_country_key" ON "plans"("code", "country");

-- AlterTable
ALTER TABLE "platform_admin_users" ADD COLUMN "country_scope" TEXT[] NOT NULL DEFAULT '{}';

-- Semente do plano Pro do Paraguai (Marco 7). Preço em guaranis — moeda sem
-- centavos, então price_minor é o valor cheio, não ×100 (ver
-- packages/domain/src/money.ts). Ponto de partida a validar com o parceiro
-- durante o piloto, não preço final travado.
INSERT INTO "plans" ("id", "code", "country", "name", "price_minor", "currency", "features", "limits", "active", "updated_at")
VALUES (
  gen_random_uuid(),
  'pro',
  'PY',
  'Pro',
  259000,
  'PYG',
  '{"smartAgenda": true, "waitlist": true, "advancedReports": true, "baileys": true}',
  '{}',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("code", "country") DO NOTHING;
