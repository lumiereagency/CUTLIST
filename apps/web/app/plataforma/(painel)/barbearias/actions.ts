"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@barber/db";
import { requireAdminSession } from "@/lib/platform-admin-auth";

const CICLO_DIAS = 30;

/// Único jeito de uma assinatura sair de bloqueada: um humano do lado da
/// empresa conferiu o Pix no extrato e apertou este botão (§19 #3, caminho
/// manual). Não existe confirmação automática por design — ver a conversa
/// que motivou isto: o cliente clicar "já paguei" nunca libera sozinho.
export async function confirmPayment(subscriptionId: string): Promise<void> {
  await requireAdminSession();

  const now = new Date();
  const proximoCiclo = new Date(now.getTime() + CICLO_DIAS * 24 * 60 * 60 * 1000);

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "ACTIVE",
      provider: "manual_pix",
      currentPeriodStart: now,
      currentPeriodEnd: proximoCiclo,
      paymentReportedAt: null,
    },
  });

  revalidatePath("/plataforma/barbearias");
}
