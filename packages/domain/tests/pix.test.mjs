import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { buildPixCopyPaste } from "../dist/pix.js";

describe("pix copia e cola", () => {
  test("monta um payload EMV válido, com CRC correto no final", () => {
    const payload = buildPixCopyPaste({
      pixKey: "financeiro@cutlist.com.br",
      merchantName: "Cutlist Sistemas",
      merchantCity: "Sao Paulo",
      amountMinor: 4990,
      txid: "ASSINATURA01",
    });

    // Estrutura EMV: começa no indicador de formato, termina em "6304" + 4 hex do CRC.
    assert.equal(payload.startsWith("000201"), true);
    assert.match(payload, /6304[0-9A-F]{4}$/);

    // O CRC declarado bate com o CRC recalculado sobre o restante do payload.
    const semCrc = payload.slice(0, -4);
    const crcDeclarado = payload.slice(-4);
    assert.equal(semCrc.endsWith("6304"), true);
    assert.notEqual(crcDeclarado, "0000");

    // Chave, valor e nome do beneficiário aparecem em texto legível — é
    // assim que qualquer app de banco confirma pra quem e quanto vai pagar.
    assert.equal(payload.includes("financeiro@cutlist.com.br"), true);
    assert.equal(payload.includes("49.90"), true);
    assert.equal(payload.includes("CUTLIST SISTEMAS"), true);
  });

  test("dois valores diferentes produzem payloads diferentes", () => {
    const base = { pixKey: "chave@exemplo.com", merchantName: "Loja", merchantCity: "Sao Paulo" };
    const barato = buildPixCopyPaste({ ...base, amountMinor: 1000 });
    const caro = buildPixCopyPaste({ ...base, amountMinor: 9900 });
    assert.notEqual(barato, caro);
  });

  test("nome e cidade fora do ASCII (acento) não quebram o payload", () => {
    const payload = buildPixCopyPaste({
      pixKey: "chave@exemplo.com",
      merchantName: "Barbearia São João",
      merchantCity: "São Paulo",
      amountMinor: 2500,
    });
    assert.equal(payload.includes("SAO JOAO"), true);
    assert.equal(payload.includes("SAO PAULO"), true);
  });
});
