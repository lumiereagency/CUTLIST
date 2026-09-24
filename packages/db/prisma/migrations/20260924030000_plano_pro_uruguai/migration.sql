-- Semente do plano Pro do Uruguai (Marco 7, mesma lógica do Paraguai em
-- 20260924010000_pais_e_escopo_admin): só "pro" é semeado de propósito — a
-- decisão já tomada para PY/UY é vender só o Pro, sem opção Base, pra não
-- competir preço com o parceiro regional. price_minor em centavos (UYU tem
-- subdivisão, diferente do Guarani) — valor de partida estimado por
-- paridade com o Pro do Brasil (R$190 ≈ pouco mais de UYU 1.500 no câmbio
-- usado como referência), a validar com o parceiro antes de vender de
-- verdade, igual o do Paraguai.
INSERT INTO "plans" ("id", "code", "country", "name", "price_minor", "currency", "features", "limits", "active", "updated_at")
VALUES (
  gen_random_uuid(),
  'pro',
  'UY',
  'Pro',
  150000,
  'UYU',
  '{"smartAgenda": true, "waitlist": true, "advancedReports": true, "baileys": true}',
  '{}',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("code", "country") DO NOTHING;
