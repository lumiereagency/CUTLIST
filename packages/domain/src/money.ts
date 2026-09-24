// Formatação de valores monetários multi-país (Marco 7).
//
// `priceMinor` continua sendo um inteiro em toda a base — evita ponto
// flutuante — mas o que ele representa depende da moeda: para BRL/UYU é
// centavos (÷100), para Guarani (PYG) é o valor cheio (a moeda não tem
// subdivisão usada na prática).

const ZERO_DECIMAL_CURRENCIES = new Set(["PYG"]);

const LOCALE_BY_CURRENCY: Record<string, string> = {
  BRL: "pt-BR",
  PYG: "es-PY",
  UYU: "es-UY",
};

export function currencyDivisor(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
}

export function formatPlanPrice(priceMinor: number, currency: string): string {
  const divisor = currencyDivisor(currency);
  const locale = LOCALE_BY_CURRENCY[currency] ?? "pt-BR";
  return (priceMinor / divisor).toLocaleString(locale, { style: "currency", currency });
}
