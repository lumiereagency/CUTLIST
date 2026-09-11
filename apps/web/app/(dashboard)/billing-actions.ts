"use server";

import { prisma } from "@barber/db";
import { requireSession } from "@/lib/auth";

/// Marca que a barbearia avisou ter feito o Pix. Não libera nada sozinho —
/// só tira o "avisar" do fluxo do WhatsApp e prioriza a fila de conferência
/// em /plataforma (ver packages/entitlements: billingGate).
export async function reportPixPayment(): Promise<void> {
  const session = await requireSession();

  await prisma.subscription.update({
    where: { barbershopId: session.barbershopId },
    data: { paymentReportedAt: new Date() },
  });
}
