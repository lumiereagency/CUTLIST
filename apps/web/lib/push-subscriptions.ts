// Inscrição de push (Web Push/PWA) — ver packages/integrations/src/push.ts
// pro porquê disto ser o único canal automático da plataforma.
//
// O navegador entrega { endpoint, keys: { p256dh, auth } } depois de
// `pushManager.subscribe()`; isto só grava essa forma, nunca decide sozinho
// quem pode se inscrever — quem chama já resolveu a identidade (sessão da
// equipe, ou token de gestão do cliente).

import { prisma } from "@barber/db";

export interface RawPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

function isValid(subscription: unknown): subscription is RawPushSubscription {
  if (!subscription || typeof subscription !== "object") return false;
  const s = subscription as Record<string, unknown>;
  if (typeof s.endpoint !== "string" || !s.endpoint) return false;
  if (!s.keys || typeof s.keys !== "object") return false;
  const keys = s.keys as Record<string, unknown>;
  return typeof keys.p256dh === "string" && typeof keys.auth === "string";
}

/// upsert por endpoint: o mesmo navegador pode "reinscrever" (ex.: depois de
/// limpar o site) sem virar linha duplicada.
export async function saveStaffPushSubscription(
  barbershopId: string,
  userId: string,
  subscription: unknown
): Promise<{ ok: boolean }> {
  if (!isValid(subscription)) return { ok: false };

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { userId, barbershopCustomerId: null, barbershopId, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    create: {
      barbershopId,
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
  return { ok: true };
}

export async function saveCustomerPushSubscription(
  barbershopId: string,
  barbershopCustomerId: string,
  subscription: unknown
): Promise<{ ok: boolean }> {
  if (!isValid(subscription)) return { ok: false };

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { barbershopCustomerId, userId: null, barbershopId, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    create: {
      barbershopId,
      barbershopCustomerId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
  return { ok: true };
}

/// Chamado quando o navegador cancela a inscrição (unsubscribe) ou a pessoa
/// desativa pela própria UI — sem isto, ficaria lixo mandando push que nunca
/// chega até o 410 aparecer sozinho na próxima tentativa.
export async function deletePushSubscription(endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}
