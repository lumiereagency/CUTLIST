"use server";

import { requireSession } from "@/lib/auth";
import { deletePushSubscription, saveStaffPushSubscription } from "@/lib/push-subscriptions";

export async function subscribeStaffPush(subscription: unknown): Promise<{ ok: boolean }> {
  const session = await requireSession();
  return saveStaffPushSubscription(session.barbershopId, session.userId, subscription);
}

export async function unsubscribeStaffPush(endpoint: string): Promise<void> {
  await requireSession();
  await deletePushSubscription(endpoint);
}
