-- Preços reais definidos pela operação (o placeholder da migração
-- 20260904021838_planos_essencial_pro era intencional, ver o comentário lá:
-- "trocar depois é um UPDATE, não uma migração de schema"). "essential" vira
-- "base" — nada no código referenciava esse `code` além desta linha, então
-- renomear é seguro.
UPDATE "plans" SET "code" = 'base', "name" = 'Base', "price_minor" = 15000, "updated_at" = CURRENT_TIMESTAMP
WHERE "code" = 'essential';

UPDATE "plans" SET "price_minor" = 19000, "updated_at" = CURRENT_TIMESTAMP
WHERE "code" = 'pro';
