// Normalização de telefone para E.164.
//
// É a chave de deduplicação da relação com a barbearia: sem normalizar,
// "(11) 99999-0000" e "+5511999990000" viram dois clientes distintos e o CRM
// nasce errado (docs/tech-review-part2.md §2.1).
//
// Escopo original: só Brasil, com validação de DDD (11-99). O Marco 7 (Paraguai/
// Uruguai) generalizou pra aceitar um país via parâmetro, mas sem repetir esse
// nível de detalhe pra cada país — não temos certeza suficiente das regras de
// operadora do Paraguai/Uruguai pra validar tão apertado quanto o Brasil, e um
// número real recusado por engano trava um agendamento de verdade. Por isso a
// validação de PY/UY é deliberadamente mais permissiva (só confere o
// comprimento total do número depois de aplicar o código do país) — validar
// com essa precisão fica pra quando tivermos volume real de números desses
// países pra testar contra.

const COUNTRY_CODE: Record<string, string> = {
  BR: "55",
  PY: "595",
  UY: "598",
};

export class InvalidPhoneError extends Error {
  constructor(public readonly input: string) {
    super("Telefone inválido");
    this.name = "InvalidPhoneError";
  }
}

/// Aceita "11999990000", "(11) 99999-0000", "+55 11 99999-0000" e devolve
/// "+5511999990000". Fora do Brasil (`country` = "PY"/"UY"), aceita formato
/// nacional com "0" de tronco opcional (ex.: "0981 234567" no Paraguai) e só
/// confere que o total de dígitos é plausível — ver nota acima.
export function normalizePhone(raw: string, country: string = "BR"): string {
  const trimmed = raw.trim();
  const hadPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  const countryCode = COUNTRY_CODE[country] ?? COUNTRY_CODE.BR!;

  if (digits.length === 0) throw new InvalidPhoneError(raw);

  // Já veio internacional
  if (hadPlus) {
    if (digits.length < 8 || digits.length > 15) throw new InvalidPhoneError(raw);
    return `+${digits}`;
  }

  if (country === "BR") {
    // Com código do país, sem o "+": só 12 ou 13 dígitos totais conta como já
    // internacional — um nacional de 10 dígitos começando com "55" é o DDD
    // válido de Santa Maria/RS, não o código do Brasil, e não pode ser
    // confundido com um (essa é a razão da faixa estreita aqui).
    if (digits.startsWith(countryCode) && (digits.length === 12 || digits.length === 13)) {
      return `+${digits}`;
    }
    // Nacional com DDD: 10 dígitos (fixo) ou 11 (celular)
    if (digits.length === 10 || digits.length === 11) {
      const areaCode = Number(digits.slice(0, 2));
      // DDD brasileiro válido vai de 11 a 99
      if (areaCode < 11) throw new InvalidPhoneError(raw);
      return `+${countryCode}${digits}`;
    }
    throw new InvalidPhoneError(raw);
  }

  // PY/UY: com código do país sem "+" (ex.: "595981234567"), ou nacional com
  // um único "0" de tronco opcional no início (ex.: "0981 234567").
  if (digits.startsWith(countryCode) && digits.length >= 10 && digits.length <= 13) {
    return `+${digits}`;
  }
  const national = digits.startsWith("0") ? digits.slice(1) : digits;
  if (national.length < 7 || national.length > 10) throw new InvalidPhoneError(raw);
  return `+${countryCode}${national}`;
}

/// Mantido pelo nome antigo: os fluxos que ainda não precisam saber o país
/// (ex.: OTP do cliente) continuam chamando isto sem mudar nada.
export function normalizePhoneBR(raw: string): string {
  return normalizePhone(raw, "BR");
}

/// Formato de exibição para o dono e para o cliente: "(11) 99999-0000".
/// Números fora do Brasil (Marco 7) não têm formatação própria ainda —
/// devolve o E.164 como está, que ao menos é legível.
export function formatPhoneBR(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  if (!digits.startsWith(COUNTRY_CODE.BR!)) return e164;

  const national = digits.slice(2);
  if (national.length === 11) {
    return `(${national.slice(0, 2)}) ${national.slice(2, 7)}-${national.slice(7)}`;
  }
  if (national.length === 10) {
    return `(${national.slice(0, 2)}) ${national.slice(2, 6)}-${national.slice(6)}`;
  }
  return e164;
}
