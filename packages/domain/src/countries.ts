// Países suportados (Marco 7). Fonte única — o seletor de país no cadastro,
// o fuso padrão e o texto de idioma dependem desta lista, não de string solta
// espalhada pelo app.

export interface CountryOption {
  code: string; // ISO-3166 alpha-2
  label: string;
  /// Fuso padrão dessa loja. Só o Brasil tem múltiplos fusos de verdade
  /// (por isso ele continua oferecendo a escolha de região); os demais
  /// países desta lista usam um único fuso, então nem perguntam.
  defaultTimezone: string;
  /// Quando true, a tela de cadastro mostra o seletor de região do Brasil
  /// em vez de aplicar o fuso padrão direto.
  hasMultipleTimezones: boolean;
}

export const COUNTRIES: CountryOption[] = [
  { code: "BR", label: "Brasil", defaultTimezone: "America/Sao_Paulo", hasMultipleTimezones: true },
  { code: "PY", label: "Paraguai", defaultTimezone: "America/Asuncion", hasMultipleTimezones: false },
  { code: "UY", label: "Uruguai", defaultTimezone: "America/Montevideo", hasMultipleTimezones: false },
];

export function isValidCountry(code: string): boolean {
  return COUNTRIES.some((country) => country.code === code);
}

export function countryLabel(code: string): string {
  return COUNTRIES.find((country) => country.code === code)?.label ?? code;
}
