// Notificações push (Web Push/PWA) — equipe avisada de reserva nova e
// cancelamento pelo cliente; cliente avisado de cancelamento pela loja e de
// lembrete antes do horário.
//
// Convergente como os outros handlers desta pasta: relê o estado atual do
// agendamento em vez de confiar no payload do evento, e nunca falha a
// operação principal por causa do push (ver isPushConfigured em
// @barber/integrations — fails open sem as chaves VAPID).

import { prisma } from "@barber/db";
import { countryOption, isSpanish } from "@barber/domain";
import { sendPushNotification, type PushSubscriptionKeys } from "@barber/integrations";

/// Rótulo curto de dia+hora pro corpo da notificação — não precisa da
/// riqueza do rótulo da página pública (booking-i18n.ts, só em apps/web),
/// só ser lido rápido numa notificação.
function shortWhen(instant: Date, timeZone: string, country: string): string {
  const formatter = new Intl.DateTimeFormat(countryOption(country).intlLocale, {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formatter.format(instant);
}

async function pruneDeadSubscriptions(deadEndpoints: string[]): Promise<void> {
  if (deadEndpoints.length === 0) return;
  await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: deadEndpoints } } });
}

export interface NotifyNewBookingPayload {
  appointmentId: string;
}

/// Só dispara pra reserva feita pelo próprio cliente (source ONLINE/WAITLIST/
/// SMART_OPPORTUNITY via createdByType CUSTOMER) — o encaixe manual da equipe
/// não precisa avisar a própria equipe sobre o que ela mesma acabou de fazer.
export async function notifyNewBooking(payload: NotifyNewBookingPayload): Promise<void> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: payload.appointmentId },
    include: { barbershop: true },
  });
  if (!appointment) return;
  if (appointment.createdByType !== "CUSTOMER") return;
  if (appointment.status !== "CONFIRMED") return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { barbershopId: appointment.barbershopId, userId: { not: null } },
  });
  if (subscriptions.length === 0) return;

  const when = shortWhen(appointment.startsAt, appointment.barbershop.timezone, appointment.barbershop.country);
  const result = await sendPushNotification(subscriptions as PushSubscriptionKeys[], {
    title: "Novo agendamento",
    body: `${appointment.customerNameSnapshot} marcou ${appointment.serviceNameSnapshot} para ${when}.`,
    url: "/hoje",
    tag: `appointment-${appointment.id}-new`,
  });
  await pruneDeadSubscriptions(result.deadEndpoints);
}

export interface NotifyAppointmentCancelledPayload {
  appointmentId: string;
  actorType: "CUSTOMER" | "STAFF" | "SYSTEM";
}

/// Avisa sempre o outro lado de quem cancelou: cliente cancelou → equipe sabe
/// sem checar a agenda; loja cancelou → cliente sabe sem precisar abrir o
/// link de gestão pra descobrir.
export async function notifyAppointmentCancelled(
  payload: NotifyAppointmentCancelledPayload
): Promise<void> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: payload.appointmentId },
    include: { barbershop: true },
  });
  if (!appointment) return;
  if (appointment.status !== "CANCELLED_BY_CUSTOMER" && appointment.status !== "CANCELLED_BY_SHOP") return;

  const when = shortWhen(appointment.startsAt, appointment.barbershop.timezone, appointment.barbershop.country);
  const spanish = isSpanish(appointment.barbershop.country);

  if (payload.actorType === "CUSTOMER") {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { barbershopId: appointment.barbershopId, userId: { not: null } },
    });
    if (subscriptions.length === 0) return;
    const result = await sendPushNotification(subscriptions as PushSubscriptionKeys[], {
      title: "Cancelamento",
      body: `${appointment.customerNameSnapshot} cancelou ${appointment.serviceNameSnapshot} de ${when}.`,
      url: "/hoje",
      tag: `appointment-${appointment.id}-cancelled`,
    });
    await pruneDeadSubscriptions(result.deadEndpoints);
    return;
  }

  if (payload.actorType === "STAFF") {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { barbershopId: appointment.barbershopId, barbershopCustomerId: appointment.barbershopCustomerId },
    });
    if (subscriptions.length === 0) return;
    const title = spanish ? "Turno cancelado" : "Horário cancelado";
    const body = spanish
      ? `${appointment.barbershop.name} canceló tu turno del ${when}.`
      : `${appointment.barbershop.name} cancelou seu horário de ${when}.`;
    const result = await sendPushNotification(subscriptions as PushSubscriptionKeys[], {
      title,
      body,
      url: "/",
      tag: `appointment-${appointment.id}-cancelled`,
    });
    await pruneDeadSubscriptions(result.deadEndpoints);
  }
}

/// Janela do lembrete: dispara pra quem começa daqui a até 2h e ainda não foi
/// avisado. A varredura roda a cada poucos minutos (ver REMINDER_SWEEP_INTERVAL_MS
/// em index.ts) então uma reserva típica recebe o lembrete só uma vez, perto
/// da borda das 2h — não é um agendador preciso por segundo, é bom o bastante
/// pra um lembrete (não é cobrança nem confirmação obrigatória).
const REMINDER_WINDOW_MS = 2 * 60 * 60_000;

export async function checkAppointmentReminders(): Promise<number> {
  const now = new Date();
  const limite = new Date(now.getTime() + REMINDER_WINDOW_MS);

  const candidatos = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      reminderPushSentAt: null,
      startsAt: { gt: now, lte: limite },
    },
    include: { barbershop: true },
    take: 200,
  });
  if (candidatos.length === 0) return 0;

  let enviados = 0;
  for (const appointment of candidatos) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { barbershopId: appointment.barbershopId, barbershopCustomerId: appointment.barbershopCustomerId },
    });

    // Sem inscrição também marca reminderPushSentAt — senão a varredura
    // re-lê a mesma linha sem inscrição a cada ciclo até sair da janela.
    if (subscriptions.length > 0) {
      const when = shortWhen(appointment.startsAt, appointment.barbershop.timezone, appointment.barbershop.country);
      const spanish = isSpanish(appointment.barbershop.country);
      const title = spanish ? "Tu turno se acerca" : "Seu horário está chegando";
      const body = spanish
        ? `${appointment.serviceNameSnapshot} en ${appointment.barbershop.name}, ${when}.`
        : `${appointment.serviceNameSnapshot} na ${appointment.barbershop.name}, ${when}.`;

      const result = await sendPushNotification(subscriptions as PushSubscriptionKeys[], {
        title,
        body,
        url: "/",
        tag: `appointment-${appointment.id}-reminder`,
      });
      await pruneDeadSubscriptions(result.deadEndpoints);
      enviados += subscriptions.length - result.deadEndpoints.length;
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { reminderPushSentAt: now },
    });
  }

  return enviados;
}
