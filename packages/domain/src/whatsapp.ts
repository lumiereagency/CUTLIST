// Mensagens prontas para envio manual pelo WhatsApp (Parte 1 §17.1).
//
// A plataforma nunca envia nada: ela monta o link, e quem aperta o botão de
// enviar é a pessoa. Por isso estas funções são puras e devolvem apenas URL —
// não existe caminho aqui que fale com o WhatsApp.
//
// Nenhuma dessas mensagens é requisito para a reserva valer: o cliente já tem
// confirmação e link de gestão pela própria plataforma.

export interface WhatsappContext {
  customerPhone: string;
  customerName: string;
  serviceName: string;
  professionalName: string;
  /// Já formatados no fuso da barbearia
  dayLabel: string;
  timeLabel: string;
  shopName: string;
  /// Link de gestão, quando faz sentido oferecer ao cliente
  manageUrl?: string;
  /// País da loja (Marco 7) — decide se a mensagem sai em português ou
  /// espanhol. Obrigatório de propósito: esquecer de passar não pode virar
  /// "manda em português sem querer" pra uma loja paraguaia/uruguaia.
  country: string;
}

function link(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/// Primeiro nome, para a mensagem não soar como formulário.
function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/// Exportado porque outros canais fora do WhatsApp (push notification, Marco
/// "notificações") precisam da mesma decisão de idioma por país.
export function isSpanish(country: string): boolean {
  return country !== "BR";
}

/// A barbearia confirmando o horário com o cliente.
export function confirmationMessage(context: WhatsappContext): string {
  const text = isSpanish(context.country)
    ? `¡Hola, ${firstName(context.customerName)}! Confirmando tu turno en ${context.shopName}: ` +
      `${context.serviceName} con ${context.professionalName}, ${context.dayLabel} a las ${context.timeLabel}. ` +
      `¡Nos vemos!`
    : `Olá, ${firstName(context.customerName)}! Confirmando seu horário na ${context.shopName}: ` +
      `${context.serviceName} com ${context.professionalName}, ${context.dayLabel} às ${context.timeLabel}. ` +
      `Até lá!`;
  return link(context.customerPhone, text);
}

/// Cliente que não chegou no horário. Tom de quem quer atender, não de cobrança.
export function runningLateMessage(context: WhatsappContext): string {
  const text = isSpanish(context.country)
    ? `¡Hola, ${firstName(context.customerName)}! Tu turno en ${context.shopName} era ` +
      `${context.dayLabel} a las ${context.timeLabel}. ¿Vas a poder llegar? ` +
      `Si necesitas reprogramar, avisanos no más.`
    : `Olá, ${firstName(context.customerName)}! Seu horário na ${context.shopName} era ` +
      `${context.dayLabel} às ${context.timeLabel}. Está conseguindo chegar? ` +
      `Se precisar remarcar, é só avisar.`;
  return link(context.customerPhone, text);
}

/// Aviso de que a barbearia precisou cancelar, com o caminho para reagendar.
export function shopCancellationMessage(context: WhatsappContext): string {
  const text = isSpanish(context.country)
    ? `Hola, ${firstName(context.customerName)}. Necesitamos cancelar tu turno del ` +
      `${context.dayLabel} a las ${context.timeLabel} en ${context.shopName}. Disculpa las molestias.` +
      (context.manageUrl ? ` Puedes elegir otro horario aquí: ${context.manageUrl}` : "")
    : `Olá, ${firstName(context.customerName)}. Precisamos cancelar seu horário de ` +
      `${context.dayLabel} às ${context.timeLabel} na ${context.shopName}. Desculpe pelo transtorno.` +
      (context.manageUrl ? ` Você pode escolher outro horário aqui: ${context.manageUrl}` : "");
  return link(context.customerPhone, text);
}

/// Aba Retorno (Marco 6.9): convite para o cliente renovar/manter um serviço
/// que tem prazo de manutenção configurado. Tom de recepção, não de cobrança
/// — e o link já leva direto pra página pública de agendamento, com o mesmo
/// serviço pré-selecionado.
export function returnReminderMessage(context: {
  customerPhone: string;
  customerName: string;
  serviceName: string;
  shopName: string;
  bookingUrl: string;
  country: string;
}): string {
  const text = isSpanish(context.country)
    ? `¡Hola, ${firstName(context.customerName)}! Está por llegar el día de tu renovación de ` +
      `${context.serviceName} en ${context.shopName}. ¿Te gustaría agendar de nuevo un ` +
      `turno con nosotros? Haz clic en el link de abajo: ${context.bookingUrl}`
    : `Olá, ${firstName(context.customerName)}! Está chegando o dia da sua renovação de ` +
      `${context.serviceName} na ${context.shopName}. Você gostaria de agendar novamente um ` +
      `horário conosco? Clique no link abaixo: ${context.bookingUrl}`;
  return link(context.customerPhone, text);
}

/// Direção oposta das demais: é a barbearia falando com a empresa (ou com o
/// parceiro regional, no Paraguai/Uruguai), avisando que fez o pagamento da
/// assinatura. Enquanto não há gateway integrado (§19 #3), é assim que a
/// fila de conferência manual em /plataforma fica sabendo.
export function paymentReportMessage(context: {
  companyWhatsappPhone: string;
  barbershopName: string;
  planName: string;
  country: string;
}): string {
  const text = isSpanish(context.country)
    ? `¡Hola! Somos ${context.barbershopName} y acabamos de hacer el pago del plan ${context.planName}. ` +
      `¿Podrían revisar el comprobante y liberar el acceso?`
    : `Olá! Sou a ${context.barbershopName} e acabei de efetuar o pagamento do plano ${context.planName}. ` +
      `Poderiam checar o recibo e liberar o acesso?`;
  return link(context.companyWhatsappPhone, text);
}
