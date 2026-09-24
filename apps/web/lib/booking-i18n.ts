// Textos fixos do fluxo público de agendamento e gestão do horário, em
// português ou espanhol conforme o país da loja (Marco 7). Não é uma
// biblioteca de i18n genérica — só as telas que o cliente final realmente
// vê antes/depois de agendar; o painel interno (que o dono/parceiro usa)
// continua em português, ver decisão registrada na conversa que motivou isto.
//
// Duas coisas viajam juntas por país: o idioma dos textos fixos (`textLocale`,
// pt/es) e o locale do Intl pra formatar data/hora/moeda (`intlLocale`,
// já mora em countries.ts porque também é usado fora do fluxo de agendamento).

// Importa os submódulos diretamente (não o pacote inteiro via "@barber/domain")
// de propósito: este arquivo é usado por componentes client (booking-wizard,
// vaga-claim-form, manage-appointment), e o barril completo do domain arrasta
// junto módulos que usam node:crypto (tokens.ts), que não roda no navegador.
import { countryOption } from "@barber/domain/countries";
import { currencyDivisor } from "@barber/domain/money";

export type TextLocale = "pt" | "es";

export function textLocaleForCountry(country: string): TextLocale {
  return country === "BR" ? "pt" : "es";
}

export function formatPrice(minor: number, country: string): string {
  const { currency, intlLocale } = countryOption(country);
  const divisor = currencyDivisor(currency);
  return (minor / divisor).toLocaleString(intlLocale, { style: "currency", currency });
}

export function formatDayLabel(isoDate: string, country: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return date.toLocaleDateString(countryOption(country).intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatTime(iso: string, timeZone: string, country: string): string {
  return new Date(iso).toLocaleTimeString(countryOption(country).intlLocale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface BookingStrings {
  // Página pública /b/{slug}
  servicesHeading: string;
  noServicesYet: string;
  professionalsHeading: string;
  whatsappButton: string;
  instagramButton: string;
  // BookingUnavailable (billing bloqueado)
  unavailableTitle: string;
  unavailableBody: string;
  unavailableWhatsapp: (shopName: string) => string;
  // Wizard — sucesso
  successTitle: string;
  manageAppointment: string;
  addToCalendar: string;
  sendWhatsappConfirmation: string;
  stayConnectedTitle: (shopName: string) => string;
  stayConnectedBody: string;
  createAccount: string;
  keepManageLinkHint: string;
  // Wizard — genérico
  nearbySlotsLabel: string;
  holdExpiredMessage: string;
  slotGoneMessage: string;
  couldNotLoadAgenda: string;
  couldNotJoinWaitlist: string;
  couldNotComplete: string;
  // Wizard — passo serviço
  chooseServiceTitle: string;
  // Wizard — passo profissional
  chooseWhoTitle: string;
  anyProfessional: string;
  anyProfessionalHint: string;
  // Wizard — passo horário
  chooseTimeTitle: string;
  loadingSlots: string;
  noSlotsMessage: string;
  tryOtherProfessional: string;
  joinWaitlistButton: string;
  // Wizard — passo dados
  holdRemainingPrefix: string;
  nameLabel: string;
  whatsappLabel: string;
  acceptTermsLabel: string;
  wantsPromotionsLabel: (shopName: string) => string;
  confirmButtonIdle: string;
  confirmButtonLoading: string;
  // Wizard — lista de espera
  waitlistTitle: string;
  waitlistHint: (shopName: string) => string;
  waitlistAcceptTerms: string;
  waitlistSubmitIdle: string;
  waitlistSubmitLoading: string;
  waitlistOkTitle: string;
  waitlistOkBody: string;
  // Gestão do agendamento (/a/{token})
  manageTitle: string;
  statusConfirmed: string;
  statusCancelledByCustomer: string;
  statusCancelledByShop: string;
  statusCompleted: string;
  statusNoShow: string;
  statusRescheduled: string;
  withProfessional: string;
  notActiveAnymore: string;
  pastNoticeDeadline: (shopName: string) => string;
  seeAllAppointmentsHint: string;
  createAccountLink: string;
  whatsappAboutAppointment: (serviceName: string, dayLabel: string, time: string) => string;
  // ManageActions
  couldNotCancel: string;
  cancelConfirmQuestion: string;
  yesCancelIt: string;
  keepIt: string;
  cancelling: string;
  cancelAppointmentButton: string;
  talkToShop: (shopName: string) => string;
  // Notificação push (opcional, ver push-subscribe-button.tsx)
  pushNotifications: {
    activate: string;
    activating: string;
    active: string;
    deactivate: string;
    iosHint: string;
    blocked: string;
    error: string;
  };
}

const PT: BookingStrings = {
  servicesHeading: "Serviços",
  noServicesYet: "Ainda não há serviços publicados por aqui.",
  professionalsHeading: "Profissionais",
  whatsappButton: "WhatsApp",
  instagramButton: "Instagram",
  unavailableTitle: "Agendamento indisponível no momento",
  unavailableBody: "Esta página não está recebendo novos agendamentos agora. Tente novamente mais tarde.",
  unavailableWhatsapp: (shopName) => `Falar com ${shopName}`,
  successTitle: "Horário reservado!",
  manageAppointment: "Gerenciar meu agendamento",
  addToCalendar: "Adicionar ao calendário",
  sendWhatsappConfirmation: "Enviar confirmação no WhatsApp",
  stayConnectedTitle: (shopName) => `Fique conectado com ${shopName}`,
  stayConnectedBody:
    "Crie sua conta gratuitamente para acompanhar seus horários, marcar de novo com poucos toques e receber promoções em primeira mão.",
  createAccount: "Criar minha conta",
  keepManageLinkHint: "Guarde o link de gerenciamento: é por ele que você cancela ou remarca.",
  nearbySlotsLabel: "Horários próximos:",
  holdExpiredMessage: "Sua reserva temporária expirou. Escolha o horário de novo.",
  slotGoneMessage: "Este horário não está mais disponível.",
  couldNotLoadAgenda: "Não foi possível carregar a agenda",
  couldNotJoinWaitlist: "Não foi possível entrar na lista de espera.",
  couldNotComplete: "Não foi possível concluir.",
  chooseServiceTitle: "Escolha o serviço",
  chooseWhoTitle: "Com quem você quer ser atendido?",
  anyProfessional: "Qualquer profissional",
  anyProfessionalHint: "Mostra todos os horários livres",
  chooseTimeTitle: "Escolha o horário",
  loadingSlots: "Carregando horários…",
  noSlotsMessage: "Não há horários livres nos próximos dias.",
  tryOtherProfessional: "Tentar com outro profissional",
  joinWaitlistButton: "Entrar na lista de espera",
  holdRemainingPrefix: "Guardamos este horário por mais",
  nameLabel: "Seu nome",
  whatsappLabel: "WhatsApp",
  acceptTermsLabel: "Aceito os termos de uso e a política de privacidade.",
  wantsPromotionsLabel: (shopName) => `Quero receber promoções de ${shopName} pelo WhatsApp.`,
  confirmButtonIdle: "Confirmar agendamento",
  confirmButtonLoading: "Confirmando…",
  waitlistTitle: "Entrar na lista de espera",
  waitlistHint: (shopName) =>
    `Avisamos assim que abrir um horário compatível — o contato é sempre feito diretamente por ${shopName}.`,
  waitlistAcceptTerms: "Aceito os termos de uso e ser contatado(a) sobre esta lista de espera.",
  waitlistSubmitIdle: "Entrar na lista de espera",
  waitlistSubmitLoading: "Entrando…",
  waitlistOkTitle: "Você está na lista!",
  waitlistOkBody: "Avisamos assim que abrir um horário compatível com o que você escolheu.",
  manageTitle: "Seu agendamento",
  statusConfirmed: "Confirmado",
  statusCancelledByCustomer: "Cancelado por você",
  statusCancelledByShop: "Cancelado pela equipe",
  statusCompleted: "Atendimento concluído",
  statusNoShow: "Você não compareceu",
  statusRescheduled: "Remarcado",
  withProfessional: "com",
  notActiveAnymore: "Este agendamento não está mais ativo.",
  pastNoticeDeadline: (shopName) => `Passou do prazo para alterar pelo link. Fale direto com ${shopName}.`,
  seeAllAppointmentsHint: "Quer ver todos os seus horários num lugar só?",
  createAccountLink: "Criar conta",
  whatsappAboutAppointment: (serviceName, dayLabel, time) =>
    `Olá! Sobre meu agendamento de ${serviceName} em ${dayLabel} às ${time}.`,
  couldNotCancel: "Não foi possível cancelar.",
  cancelConfirmQuestion: "Tem certeza que quer cancelar? O horário volta a ficar disponível para outras pessoas.",
  yesCancelIt: "Sim, cancelar",
  keepIt: "Manter",
  cancelling: "Cancelando…",
  cancelAppointmentButton: "Cancelar agendamento",
  talkToShop: (shopName) => `Falar com ${shopName}`,
  pushNotifications: {
    activate: "Ativar notificações",
    activating: "Ativando…",
    active: "Notificações ativas",
    deactivate: "desativar",
    iosHint: "Adicione à Tela de Início para receber notificações.",
    blocked: "Notificações bloqueadas no navegador.",
    error: "Não foi possível ativar agora. Tente de novo.",
  },
};

const ES: BookingStrings = {
  servicesHeading: "Servicios",
  noServicesYet: "Todavía no hay servicios publicados aquí.",
  professionalsHeading: "Profesionales",
  whatsappButton: "WhatsApp",
  instagramButton: "Instagram",
  unavailableTitle: "Turno no disponible por el momento",
  unavailableBody: "Esta página no está recibiendo nuevos turnos ahora. Intenta de nuevo más tarde.",
  unavailableWhatsapp: (shopName) => `Hablar con ${shopName}`,
  successTitle: "¡Turno reservado!",
  manageAppointment: "Gestionar mi turno",
  addToCalendar: "Agregar al calendario",
  sendWhatsappConfirmation: "Enviar confirmación por WhatsApp",
  stayConnectedTitle: (shopName) => `Mantente conectado con ${shopName}`,
  stayConnectedBody:
    "Crea tu cuenta gratis para seguir tus turnos, reservar de nuevo con pocos toques y recibir promociones primero.",
  createAccount: "Crear mi cuenta",
  keepManageLinkHint: "Guarda el link de gestión: con él puedes cancelar o reprogramar.",
  nearbySlotsLabel: "Horarios cercanos:",
  holdExpiredMessage: "Tu reserva temporal expiró. Elige el horario de nuevo.",
  slotGoneMessage: "Este horario ya no está disponible.",
  couldNotLoadAgenda: "No se pudo cargar la agenda",
  couldNotJoinWaitlist: "No se pudo anotar en la lista de espera.",
  couldNotComplete: "No se pudo completar.",
  chooseServiceTitle: "Elige el servicio",
  chooseWhoTitle: "¿Con quién quieres ser atendido?",
  anyProfessional: "Cualquier profesional",
  anyProfessionalHint: "Muestra todos los horarios libres",
  chooseTimeTitle: "Elige el horario",
  loadingSlots: "Cargando horarios…",
  noSlotsMessage: "No hay horarios libres en los próximos días.",
  tryOtherProfessional: "Probar con otro profesional",
  joinWaitlistButton: "Anotarme en la lista de espera",
  holdRemainingPrefix: "Guardamos este horario por",
  nameLabel: "Tu nombre",
  whatsappLabel: "WhatsApp",
  acceptTermsLabel: "Acepto los términos de uso y la política de privacidad.",
  wantsPromotionsLabel: (shopName) => `Quiero recibir promociones de ${shopName} por WhatsApp.`,
  confirmButtonIdle: "Confirmar turno",
  confirmButtonLoading: "Confirmando…",
  waitlistTitle: "Anotarme en la lista de espera",
  waitlistHint: (shopName) =>
    `Te avisamos en cuanto se libere un horario compatible — el contacto siempre lo hace ${shopName} directamente.`,
  waitlistAcceptTerms: "Acepto los términos de uso y ser contactado/a sobre esta lista de espera.",
  waitlistSubmitIdle: "Anotarme en la lista de espera",
  waitlistSubmitLoading: "Enviando…",
  waitlistOkTitle: "¡Ya estás en la lista!",
  waitlistOkBody: "Te avisamos en cuanto se libere un horario compatible con lo que elegiste.",
  manageTitle: "Tu turno",
  statusConfirmed: "Confirmado",
  statusCancelledByCustomer: "Cancelado por ti",
  statusCancelledByShop: "Cancelado por el equipo",
  statusCompleted: "Atención finalizada",
  statusNoShow: "No asististe",
  statusRescheduled: "Reprogramado",
  withProfessional: "con",
  notActiveAnymore: "Este turno ya no está activo.",
  pastNoticeDeadline: (shopName) => `Se venció el plazo para cambiar por el link. Habla directo con ${shopName}.`,
  seeAllAppointmentsHint: "¿Quieres ver todos tus turnos en un solo lugar?",
  createAccountLink: "Crear cuenta",
  whatsappAboutAppointment: (serviceName, dayLabel, time) =>
    `¡Hola! Sobre mi turno de ${serviceName} el ${dayLabel} a las ${time}.`,
  couldNotCancel: "No se pudo cancelar.",
  cancelConfirmQuestion: "¿Seguro que quieres cancelar? El horario vuelve a estar disponible para otras personas.",
  yesCancelIt: "Sí, cancelar",
  keepIt: "Mantener",
  cancelling: "Cancelando…",
  cancelAppointmentButton: "Cancelar turno",
  talkToShop: (shopName) => `Hablar con ${shopName}`,
  pushNotifications: {
    activate: "Activar notificaciones",
    activating: "Activando…",
    active: "Notificaciones activas",
    deactivate: "desactivar",
    iosHint: "Agregá a la pantalla de inicio para recibir notificaciones.",
    blocked: "Notificaciones bloqueadas en el navegador.",
    error: "No pudimos activarlas ahora. Probá de nuevo.",
  },
};

export function bookingStrings(country: string): BookingStrings {
  return textLocaleForCountry(country) === "pt" ? PT : ES;
}
