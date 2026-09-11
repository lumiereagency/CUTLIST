// "Pix copia e cola" estático (BR Code, padrão EMV do Banco Central) — sem
// gateway nenhum: o texto sozinho já é uma cobrança válida em qualquer banco,
// porque o valor e o beneficiário vêm embutidos nele, não são digitados por
// quem paga. Serve enquanto o Marco 7 (provedor de cobrança integrado) não
// existe: a confirmação de pagamento continua sendo humana (ver §19 #3).

export interface PixChargeInput {
  /// Chave Pix da empresa (CPF/CNPJ, e-mail, telefone ou chave aleatória)
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amountMinor: number;
  /// Identifica a cobrança no extrato do Pix; até 25 caracteres. "***" é o
  /// valor padrão do próprio padrão quando não há referência específica.
  txid?: string;
}

function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

/// Campos de texto do BR Code são ASCII puro e de tamanho limitado — acento
/// quebraria a leitura em parte dos apps de banco, não é frescura de padrão.
function stripToAscii(value: string, maxLength: number): string {
  // NFD separa a letra do acento (á → a + ́); o filtro seguinte já descarta
  // todo caractere fora do ASCII imprimível, acento combinante incluído.
  const ascii = value
    .normalize("NFD")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
  return (ascii.slice(0, maxLength) || "NA").toUpperCase();
}

/// CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF, sem reflexão) — o mesmo que
/// todo leitor de Pix espera no campo 63. Testado contra o vetor de
/// referência do algoritmo ("123456789" → 0x29B1), não só contra si mesmo.
function crc16Ccitt(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/// Monta o payload completo. Valor fixo (não editável por quem paga) é o que
/// garante que o Pix recebido bate exatamente com o preço do plano.
export function buildPixCopyPaste(input: PixChargeInput): string {
  const merchantName = stripToAscii(input.merchantName, 25);
  const merchantCity = stripToAscii(input.merchantCity, 15);
  const txid = (stripToAscii(input.txid ?? "***", 25).replace(/\s+/g, "") || "***").slice(0, 25);
  const amount = (input.amountMinor / 100).toFixed(2);

  const merchantAccountInfo = tlv("00", "br.gov.bcb.pix") + tlv("01", input.pixKey.trim());
  const additionalData = tlv("05", txid);

  const withoutCrc =
    tlv("00", "01") + // Payload Format Indicator
    tlv("01", "11") + // Point of Initiation Method: estático, reutilizável
    tlv("26", merchantAccountInfo) +
    tlv("52", "0000") + // Merchant Category Code: genérico
    tlv("53", "986") + // Moeda: BRL
    tlv("54", amount) +
    tlv("58", "BR") +
    tlv("59", merchantName) +
    tlv("60", merchantCity) +
    tlv("62", additionalData) +
    "6304"; // ID+tamanho do próprio campo do CRC, que entra no cálculo dele

  return withoutCrc + crc16Ccitt(withoutCrc);
}
