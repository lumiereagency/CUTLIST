// Aba Retorno (Marco 6.9): quem já passou do prazo de manutenção de um
// serviço configurado com `returnIntervalDays` e ainda não tem novo horário
// marcado para esse mesmo serviço.
//
// Nenhuma mensagem sai sozinha aqui também: esta função só monta a lista e o
// link wa.me pronto (returnReminderMessage) — quem envia é a pessoa que
// clicar no botão na tela.

import { prisma } from "@barber/db";
import { returnReminderMessage } from "@barber/domain";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function baseUrl(): string {
  return process.env.APP_BASE_URL ?? "http://localhost:3000";
}

export interface CustomerDueForReturn {
  barbershopCustomerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  lastVisitAt: Date;
  daysSinceLastVisit: number;
  whatsappLink: string;
}

/// Clientes que já passaram do prazo de retorno de algum serviço, e não têm
/// agendamento futuro confirmado para o mesmo serviço.
export async function customersDueForReturn(barbershopId: string): Promise<CustomerDueForReturn[]> {
  const shop = await prisma.barbershop.findUniqueOrThrow({
    where: { id: barbershopId },
    select: { slug: true, name: true, country: true },
  });

  const now = new Date();

  // Última visita CONCLUÍDA por (cliente, serviço) — só entram serviços com
  // prazo de retorno configurado e ainda ativos (senão não dá nem pra
  // reagendar o mesmo serviço pelo link).
  const lastCompletions = await prisma.appointment.findMany({
    where: {
      barbershopId,
      status: "COMPLETED",
      service: { returnIntervalDays: { not: null }, active: true },
    },
    distinct: ["barbershopCustomerId", "serviceId"],
    orderBy: [{ barbershopCustomerId: "asc" }, { serviceId: "asc" }, { startsAt: "desc" }],
    select: {
      barbershopCustomerId: true,
      serviceId: true,
      startsAt: true,
      service: { select: { name: true, returnIntervalDays: true } },
      barbershopCustomer: { select: { currentName: true, normalizedPhone: true } },
    },
  });

  const overdue = lastCompletions.filter((appointment) => {
    const intervalDays = appointment.service.returnIntervalDays;
    if (!intervalDays) return false;
    const daysSince = Math.floor((now.getTime() - appointment.startsAt.getTime()) / MS_PER_DAY);
    return daysSince >= intervalDays;
  });

  if (overdue.length === 0) return [];

  // Quem já tem horário futuro confirmado pro mesmo serviço não precisa do
  // lembrete — já resolveu sozinho.
  const upcoming = await prisma.appointment.findMany({
    where: {
      barbershopId,
      status: "CONFIRMED",
      startsAt: { gt: now },
      OR: overdue.map((appointment) => ({
        barbershopCustomerId: appointment.barbershopCustomerId,
        serviceId: appointment.serviceId,
      })),
    },
    select: { barbershopCustomerId: true, serviceId: true },
  });
  const jaAgendado = new Set(upcoming.map((a) => `${a.barbershopCustomerId}:${a.serviceId}`));

  return overdue
    .filter((appointment) => !jaAgendado.has(`${appointment.barbershopCustomerId}:${appointment.serviceId}`))
    .map((appointment) => {
      const bookingUrl = `${baseUrl()}/b/${shop.slug}/agendar?servico=${appointment.serviceId}`;
      return {
        barbershopCustomerId: appointment.barbershopCustomerId,
        customerName: appointment.barbershopCustomer.currentName,
        customerPhone: appointment.barbershopCustomer.normalizedPhone,
        serviceId: appointment.serviceId,
        serviceName: appointment.service.name,
        lastVisitAt: appointment.startsAt,
        daysSinceLastVisit: Math.floor((now.getTime() - appointment.startsAt.getTime()) / MS_PER_DAY),
        whatsappLink: returnReminderMessage({
          customerPhone: appointment.barbershopCustomer.normalizedPhone,
          customerName: appointment.barbershopCustomer.currentName,
          serviceName: appointment.service.name,
          shopName: shop.name,
          bookingUrl,
          country: shop.country,
        }),
      };
    })
    .sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);
}
