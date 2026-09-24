// Monta o que a rota pública devolve sobre um agendamento.
//
// Só o necessário: a página de gestão é acessível por link, então nada de
// dado do cliente além do que ele mesmo informou, e nada sobre a operação da
// barbearia (Parte 1 §9).

import type { Appointment, Barbershop } from "@barber/db";
import { instantToLocalDate, instantToLocalTime } from "@barber/domain";
import { formatDayLabel } from "./booking-i18n.ts";

function baseUrl(): string {
  return process.env.APP_BASE_URL ?? "http://localhost:3000";
}

export function summarize(appointment: Appointment, shop: Barbershop) {
  return {
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    timezone: shop.timezone,
    localDate: instantToLocalDate(appointment.startsAt, shop.timezone),
    localTime: instantToLocalTime(appointment.startsAt, shop.timezone),
    serviceName: appointment.serviceNameSnapshot,
    professionalName: appointment.professionalNameSnapshot,
    customerName: appointment.customerNameSnapshot,
    priceMinor: appointment.priceSnapshotMinor,
    status: appointment.status,
  };
}

/// Mensagem pronta para o cliente enviar, se quiser. O envio é sempre manual —
/// o WhatsApp nunca é requisito para a reserva valer (Parte 1 §3).
function whatsappShareUrl(appointment: Appointment, shop: Barbershop): string | null {
  if (!shop.phone) return null;

  const date = formatDayLabel(instantToLocalDate(appointment.startsAt, shop.timezone), shop.country);
  const time = instantToLocalTime(appointment.startsAt, shop.timezone);
  const text =
    shop.country === "BR"
      ? `Olá! Acabei de agendar ${appointment.serviceNameSnapshot} com ` +
        `${appointment.professionalNameSnapshot} para ${date} às ${time} pelo sistema da ${shop.name}.`
      : `¡Hola! Acabo de agendar ${appointment.serviceNameSnapshot} con ` +
        `${appointment.professionalNameSnapshot} para el ${date} a las ${time} por el sistema de ${shop.name}.`;

  return `https://wa.me/${shop.phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

function calendarUrl(appointment: Appointment, shop: Barbershop): string {
  const stamp = (date: Date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${appointment.serviceNameSnapshot} — ${shop.name}`,
    dates: `${stamp(appointment.startsAt)}/${stamp(appointment.endsAt)}`,
    details: shop.country === "BR" ? `Com ${appointment.professionalNameSnapshot}` : `Con ${appointment.professionalNameSnapshot}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildAppointmentPayload(
  appointment: Appointment,
  shop: Barbershop,
  managementToken: string
) {
  return {
    appointment: summarize(appointment, shop),
    manageUrl: `${baseUrl()}/a/${managementToken}`,
    whatsappShareUrl: whatsappShareUrl(appointment, shop),
    calendarUrl: calendarUrl(appointment, shop),
  };
}
