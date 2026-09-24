import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { normalizePhone, normalizePhoneBR, formatPhoneBR, InvalidPhoneError } from "../dist/phone.js";

describe("normalizePhoneBR / normalizePhone(\"BR\")", () => {
  test("aceita celular nacional com DDD (11 dígitos)", () => {
    assert.equal(normalizePhoneBR("11999990000"), "+5511999990000");
  });

  test("aceita formatado com parênteses e traço", () => {
    assert.equal(normalizePhoneBR("(11) 99999-0000"), "+5511999990000");
  });

  test("aceita internacional com +", () => {
    assert.equal(normalizePhoneBR("+55 11 99999-0000"), "+5511999990000");
  });

  test("aceita fixo nacional (10 dígitos)", () => {
    assert.equal(normalizePhoneBR("1133334444"), "+551133334444");
  });

  test("DDD 55 (Santa Maria/RS) nacional não é confundido com código do país", () => {
    // 10 dígitos começando com "55": tem que ser tratado como DDD 55 + número,
    // não como "já veio com código do país" (essa é a regressão que este
    // teste existe pra travar).
    assert.equal(normalizePhoneBR("5533334444"), "+555533334444");
  });

  test("já com código do país, sem + (12 dígitos, fixo)", () => {
    assert.equal(normalizePhoneBR("551133334444"), "+551133334444");
  });

  test("já com código do país, sem + (13 dígitos, celular)", () => {
    assert.equal(normalizePhoneBR("5511999990000"), "+5511999990000");
  });

  test("DDD abaixo de 11 é recusado", () => {
    assert.throws(() => normalizePhoneBR("0199990000"), InvalidPhoneError);
  });

  test("vazio é recusado", () => {
    assert.throws(() => normalizePhoneBR(""), InvalidPhoneError);
  });

  test("curto demais é recusado", () => {
    assert.throws(() => normalizePhoneBR("123"), InvalidPhoneError);
  });
});

describe("normalizePhone(\"PY\")", () => {
  test("nacional com 0 de tronco (celular, 10 dígitos)", () => {
    assert.equal(normalizePhone("0981234567", "PY"), "+595981234567");
  });

  test("nacional sem o 0 de tronco", () => {
    assert.equal(normalizePhone("981234567", "PY"), "+595981234567");
  });

  test("já com código do país, sem +", () => {
    assert.equal(normalizePhone("595981234567", "PY"), "+595981234567");
  });

  test("internacional com +", () => {
    assert.equal(normalizePhone("+595 981 234567", "PY"), "+595981234567");
  });

  test("curto demais é recusado", () => {
    assert.throws(() => normalizePhone("098", "PY"), InvalidPhoneError);
  });
});

describe("normalizePhone(\"UY\")", () => {
  test("nacional com 0 de tronco (celular, 9 dígitos)", () => {
    assert.equal(normalizePhone("099123456", "UY"), "+59899123456");
  });

  test("já com código do país, sem +", () => {
    assert.equal(normalizePhone("59899123456", "UY"), "+59899123456");
  });
});

describe("formatPhoneBR", () => {
  test("formata celular", () => {
    assert.equal(formatPhoneBR("+5511999990000"), "(11) 99999-0000");
  });

  test("formata fixo", () => {
    assert.equal(formatPhoneBR("+551133334444"), "(11) 3333-4444");
  });

  test("número fora do Brasil devolve o E.164 como está", () => {
    assert.equal(formatPhoneBR("+595981234567"), "+595981234567");
  });
});
