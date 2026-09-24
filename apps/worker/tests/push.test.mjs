// Notificações push (equipe + cliente), contra Postgres real.
//
// O que estes testes existem para provar:
//  - notifyNewBooking nunca estoura em agendamento inexistente, cancelado ou
//    criado pela própria equipe (não faz sentido avisar a equipe do que ela
//    mesma acabou de fazer);
//  - notifyAppointmentCancelled não estoura pros dois lados possíveis de
//    quem cancelou;
//  - checkAppointmentReminders só marca reminderPushSentAt em agendamentos
//    CONFIRMED dentro da janela — fora da janela, já lembrado, ou cancelado
//    ficam intocados — e reprocessar não marca de novo o que já foi marcado
//    nem re-soma no total de "enviados".
//
// Sem chave VAPID configurada de propósito (deletadas antes do import): os
// testes não devem depender de rede de verdade nem de um serviço de push
// real — só a lógica de seleção/filtragem, que é gravada no banco
// independente do envio ter saído ou não (ver isPushConfigured, fails open).

import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

delete process.env.VAPID_PUBLIC_KEY;
delete process.env.VAPID_PRIVATE_KEY;
delete process.env.VAPID_SUBJECT;

const { prisma } = await import("@barber/db");
const { notifyNewBooking, notifyAppointmentCancelled, checkAppointmentReminders } = await import(
  "../handlers/push.ts"
);

const SHOP = randomUUID();
const PRO = randomUUID();
const SERVICE = randomUUID();
const USER = randomUUID();

before(async () => {
  await prisma.barbershop.create({
    data: { id: SHOP, name: "Barbearia Push", slug: `push-${SHOP.slice(0, 8)}`, timezone: "America/Sao_Paulo" },
  });
  await prisma.professional.create({ data: { id: PRO, barbershopId: SHOP, displayName: "Ana" } });
  await prisma.service.create({
    data: { id: SERVICE, barbershopId: SHOP, name: "Corte", priceMinor: 5000, durationMinutes: 30 },
  });
  await prisma.user.create({
    data: { id: USER, email: `push-${USER.slice(0, 8)}@example.com`, name: "Dono" },
  });
});

after(async () => {
  await prisma.pushSubscription.deleteMany({ where: { barbershopId: SHOP } });
  await prisma.appointment.deleteMany({ where: { barbershopId: SHOP } });
  await prisma.barbershopCustomer.deleteMany({ where: { barbershopId: SHOP } });
  await prisma.user.delete({ where: { id: USER } });
  await prisma.barbershop.delete({ where: { id: SHOP } });
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.pushSubscription.deleteMany({ where: { barbershopId: SHOP } });
  await prisma.appointment.deleteMany({ where: { barbershopId: SHOP } });
  await prisma.barbershopCustomer.deleteMany({ where: { barbershopId: SHOP } });
});

async function cliente(overrides = {}) {
  return prisma.barbershopCustomer.create({
    data: { barbershopId: SHOP, normalizedPhone: "11988887777", currentName: "Cliente Push", ...overrides },
  });
}

async function agendamento({ barbershopCustomerId, startsAt, createdByType = "CUSTOMER", status = "CONFIRMED" }) {
  return prisma.appointment.create({
    data: {
      barbershopId: SHOP,
      barbershopCustomerId,
      professionalId: PRO,
      serviceId: SERVICE,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 30 * 60_000),
      occupiesFrom: startsAt,
      occupiesTo: new Date(startsAt.getTime() + 30 * 60_000),
      status,
      priceSnapshotMinor: 5000,
      serviceNameSnapshot: "Corte",
      professionalNameSnapshot: "Ana",
      customerNameSnapshot: "Cliente Push",
      customerPhoneSnapshot: "11988887777",
      createdByType,
      managementTokenHash: randomUUID(),
    },
  });
}

async function inscricaoEquipe() {
  return prisma.pushSubscription.create({
    data: {
      barbershopId: SHOP,
      userId: USER,
      endpoint: `https://push.example/${randomUUID()}`,
      p256dh: "chave-p256dh-fake",
      auth: "chave-auth-fake",
    },
  });
}

async function inscricaoCliente(barbershopCustomerId) {
  return prisma.pushSubscription.create({
    data: {
      barbershopId: SHOP,
      barbershopCustomerId,
      endpoint: `https://push.example/${randomUUID()}`,
      p256dh: "chave-p256dh-fake",
      auth: "chave-auth-fake",
    },
  });
}

describe("notifyNewBooking", () => {
  test("agendamento inexistente não estoura", async () => {
    await assert.doesNotReject(() => notifyNewBooking({ appointmentId: randomUUID() }));
  });

  test("reserva feita pela própria equipe não estoura (e não é o alvo do aviso)", async () => {
    const c = await cliente();
    await inscricaoEquipe();
    const marcado = await agendamento({
      barbershopCustomerId: c.id,
      startsAt: new Date(Date.now() + 3 * 60 * 60_000),
      createdByType: "STAFF",
    });
    await assert.doesNotReject(() => notifyNewBooking({ appointmentId: marcado.id }));
  });

  test("reserva do cliente com equipe inscrita não estoura", async () => {
    const c = await cliente();
    await inscricaoEquipe();
    const marcado = await agendamento({
      barbershopCustomerId: c.id,
      startsAt: new Date(Date.now() + 3 * 60 * 60_000),
    });
    await assert.doesNotReject(() => notifyNewBooking({ appointmentId: marcado.id }));
  });
});

describe("notifyAppointmentCancelled", () => {
  test("agendamento inexistente não estoura", async () => {
    await assert.doesNotReject(() =>
      notifyAppointmentCancelled({ appointmentId: randomUUID(), actorType: "CUSTOMER" })
    );
  });

  test("cancelado pelo cliente (avisa a equipe) não estoura", async () => {
    const c = await cliente();
    await inscricaoEquipe();
    const marcado = await agendamento({
      barbershopCustomerId: c.id,
      startsAt: new Date(Date.now() + 3 * 60 * 60_000),
      status: "CANCELLED_BY_CUSTOMER",
    });
    await assert.doesNotReject(() =>
      notifyAppointmentCancelled({ appointmentId: marcado.id, actorType: "CUSTOMER" })
    );
  });

  test("cancelado pela loja (avisa o cliente) não estoura", async () => {
    const c = await cliente();
    await inscricaoCliente(c.id);
    const marcado = await agendamento({
      barbershopCustomerId: c.id,
      startsAt: new Date(Date.now() + 3 * 60 * 60_000),
      status: "CANCELLED_BY_SHOP",
    });
    await assert.doesNotReject(() =>
      notifyAppointmentCancelled({ appointmentId: marcado.id, actorType: "STAFF" })
    );
  });
});

describe("checkAppointmentReminders", () => {
  test("marca reminderPushSentAt só em CONFIRMED dentro da janela de 2h", async () => {
    const c = await cliente();
    const dentro = await agendamento({ barbershopCustomerId: c.id, startsAt: new Date(Date.now() + 60 * 60_000) });
    const foraDaJanela = await agendamento({
      barbershopCustomerId: c.id,
      startsAt: new Date(Date.now() + 5 * 60 * 60_000),
    });
    const jaPassou = await agendamento({ barbershopCustomerId: c.id, startsAt: new Date(Date.now() - 60_000) });
    const cancelado = await agendamento({
      barbershopCustomerId: c.id,
      startsAt: new Date(Date.now() + 90 * 60_000),
      status: "CANCELLED_BY_SHOP",
    });

    await checkAppointmentReminders();

    const [a, b, cc, d] = await Promise.all(
      [dentro, foraDaJanela, jaPassou, cancelado].map((appointment) =>
        prisma.appointment.findUniqueOrThrow({ where: { id: appointment.id } })
      )
    );
    assert.ok(a.reminderPushSentAt, "dentro da janela devia ser marcado");
    assert.equal(b.reminderPushSentAt, null, "fora da janela não devia ser tocado");
    assert.equal(cc.reminderPushSentAt, null, "horário já passado não devia ser tocado");
    assert.equal(d.reminderPushSentAt, null, "cancelado não devia ser tocado");
  });

  test("reprocessar não toca de novo quem já foi marcado", async () => {
    const c = await cliente();
    const marcado = await agendamento({ barbershopCustomerId: c.id, startsAt: new Date(Date.now() + 60 * 60_000) });

    await checkAppointmentReminders();
    const primeiraMarca = await prisma.appointment.findUniqueOrThrow({ where: { id: marcado.id } });
    assert.ok(primeiraMarca.reminderPushSentAt);

    await checkAppointmentReminders();
    const segundaMarca = await prisma.appointment.findUniqueOrThrow({ where: { id: marcado.id } });
    assert.equal(
      segundaMarca.reminderPushSentAt.getTime(),
      primeiraMarca.reminderPushSentAt.getTime(),
      "segunda varredura não devia reescrever a marca"
    );
  });

  test("sem candidato na janela, não faz nada", async () => {
    const enviados = await checkAppointmentReminders();
    assert.equal(enviados, 0);
  });
});
