// Configuração de recebimento por país (Marco 7).
//
// Pix é Brasil-só; Paraguai/Uruguai usam Alias (um identificador — aqui,
// celular — vinculado à conta do parceiro, sem gerar nenhum payload como o
// EMV do Pix). Cada país tem sua própria chave e seu próprio WhatsApp de
// recebimento porque quem confere o pagamento pode ser gente diferente (a
// equipe no Brasil, o parceiro no Paraguai).
//
// Segue o mesmo padrão do PIX_KEY já existente: variável de ambiente,
// operação controla, não é configurável pelo dono da loja.

export interface CountryPaymentConfig {
  method: "pix" | "alias";
  methodLabel: string;
  instructionsHint: string;
  companyWhatsapp: string;
  /// O que a pessoa cola/copia: payload Pix (BR) ou o Alias cru (PY/UY).
  paymentCode: string;
}

/// `null` quando falta configurar (env ausente) — quem chama trata isso como
/// "sem plano pra esse país", nunca como travar o cliente por falha nossa.
export function paymentConfigForCountry(country: string): CountryPaymentConfig | null {
  if (country === "BR") {
    const pixKey = process.env.PIX_KEY;
    const companyWhatsapp = process.env.COMPANY_WHATSAPP_NUMBER;
    if (!pixKey || !companyWhatsapp) return null;
    return {
      method: "pix",
      methodLabel: "Pix copia e cola",
      instructionsHint: 'Cole esse código na opção "Pix Copia e Cola" do seu banco. O valor já vem certo.',
      companyWhatsapp,
      paymentCode: pixKey,
    };
  }

  if (country === "PY") {
    const alias = process.env.ALIAS_PY;
    const companyWhatsapp = process.env.COMPANY_WHATSAPP_PY;
    if (!alias || !companyWhatsapp) return null;
    return {
      method: "alias",
      methodLabel: "Alias (celular)",
      instructionsHint: "Digite esse Alias no app do seu banco para transferir. Confirme o valor antes de enviar.",
      companyWhatsapp,
      paymentCode: alias,
    };
  }

  if (country === "UY") {
    const alias = process.env.ALIAS_UY;
    const companyWhatsapp = process.env.COMPANY_WHATSAPP_UY;
    if (!alias || !companyWhatsapp) return null;
    return {
      method: "alias",
      methodLabel: "Alias (celular)",
      instructionsHint: "Digite esse Alias no app do seu banco para transferir. Confirme o valor antes de enviar.",
      companyWhatsapp,
      paymentCode: alias,
    };
  }

  return null;
}
