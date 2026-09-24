"use server";

// Ações de push do lado do cliente final. Sem sessão nenhuma — a identidade
// vem do token de gestão do agendamento (o mesmo de /a/{token}), resolvido
// no servidor via findByManagementToken. O cliente nunca manda
// barbershopCustomerId direto: se mandasse, qualquer um poderia inscrever
// push em nome de outro cliente.

import { findByManagementToken } from "@/lib/booking";
import { deletePushSubscription, saveCustomerPushSubscription } from "@/lib/push-subscriptions";

export async function subscribeCustomerPush(
  managementToken: string,
  subscription: unknown
): Promise<{ ok: boolean }> {
  const appointment = await findByManagementToken(managementToken);
  if (!appointment) return { ok: false };

  return saveCustomerPushSubscription(
    appointment.barbershopId,
    appointment.barbershopCustomerId,
    subscription
  );
}

export async function unsubscribeCustomerPush(endpoint: string): Promise<void> {
  await deletePushSubscription(endpoint);
}
