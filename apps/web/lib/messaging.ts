// Adapter de envio de código de acesso.
//
// O provedor de SMS ainda não foi decidido (pendência §19 #2 da Parte 3), então
// o que existe hoje é o provedor de desenvolvimento, que registra o código no
// log do servidor em vez de enviar. A interface é o ponto único a implementar
// quando o provedor for escolhido — nada além deste arquivo muda.
//
// O código NUNCA volta na resposta HTTP: se voltasse, qualquer pessoa poderia
// pedir o código de um telefone alheio e lê-lo na própria resposta.

export interface SendCodeInput {
  destination: string;
  code: string;
  channel: "SMS" | "EMAIL";
}

export interface MessagingProvider {
  readonly name: string;
  sendAccessCode(input: SendCodeInput): Promise<void>;
}

/// Desenvolvimento e homologação: escreve o código no log do servidor.
///
/// Não envia nada. Só é escolhido quando alguém pediu por ele explicitamente,
/// ou fora de produção — ver `messagingProvider`.
class LogOnlyProvider implements MessagingProvider {
  readonly name = "log";

  async sendAccessCode(input: SendCodeInput): Promise<void> {
    console.info(
      `[otp] código para ${input.destination} (${input.channel}): ${input.code}`
    );
  }
}

/// Produção: envia SMS de verdade pela API da Zenvia (v2/channels/sms).
/// Escolhida por ser brasileira — cobrança em real, sem cartão internacional,
/// boa entrega nas operadoras nacionais.
class ZenviaProvider implements MessagingProvider {
  readonly name = "zenvia";

  async sendAccessCode(input: SendCodeInput): Promise<void> {
    const apiToken = process.env.SMS_PROVIDER_API_KEY;
    if (!apiToken) {
      throw new Error("SMS_PROVIDER_API_KEY não configurado (necessário para SMS_PROVIDER=zenvia)");
    }

    const to = input.destination.replace(/\D/g, "");
    const response = await fetch("https://api.zenvia.com/v2/channels/sms/messages", {
      method: "POST",
      headers: {
        "X-API-TOKEN": apiToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.SMS_PROVIDER_FROM || "Cutlist",
        to,
        contents: [{ type: "text", text: `Seu código de acesso: ${input.code}` }],
      }),
    });

    if (!response.ok) {
      const corpo = await response.text().catch(() => "");
      throw new Error(`Falha ao enviar SMS via Zenvia (HTTP ${response.status}): ${corpo}`);
    }
  }
}

let provider: MessagingProvider | null = null;

export function messagingProvider(): MessagingProvider {
  if (provider) return provider;

  const escolhido = process.env.SMS_PROVIDER;
  const emProducao = process.env.NODE_ENV === "production";

  // Quando o provedor real for escolhido, é aqui que ele entra — a decisão fica
  // isolada em um ponto só.
  switch (escolhido) {
    case "zenvia":
      provider = new ZenviaProvider();
      break;

    case "log":
      // Opt-in explícito. Vale para desenvolvimento, CI e homologação, que
      // rodam o build de produção e ainda assim precisam do fluxo completo.
      // Em produção de verdade isso significaria código de acesso em texto
      // puro no log, então o aviso é alto e a cada inicialização.
      if (emProducao) {
        console.warn(
          "[otp] SMS_PROVIDER=log em NODE_ENV=production: os códigos de acesso " +
            "estão indo para o log em vez de SMS. Isso não pode valer para clientes reais."
        );
      }
      provider = new LogOnlyProvider();
      break;

    case undefined:
    case "":
      // Esquecer de configurar não pode virar um sistema que parece funcionar
      // e nunca entrega o código ao cliente.
      if (emProducao) {
        throw new Error(
          "Nenhum provedor de envio configurado. Defina SMS_PROVIDER antes de subir para produção."
        );
      }
      provider = new LogOnlyProvider();
      break;

    default:
      throw new Error(`Provedor de envio desconhecido: ${escolhido}`);
  }

  return provider;
}

/// Usado pelos testes para observar o que seria enviado.
export function setMessagingProvider(custom: MessagingProvider | null): void {
  provider = custom;
}
