"use server";

import { prisma } from "@barber/db";
import { requireSession } from "@/lib/auth";

/// Marca que a barbearia avisou ter feito o Pix do plano escolhido na hora —
/// a pessoa pode ter trocado de Base pra Pro (ou vice-versa) na própria tela
/// de cobrança, então grava o plano junto, não só o aviso. Não libera nada
/// sozinho: só tira o "avisar" do fluxo do WhatsApp e prioriza a fila de
/// conferência em /plataforma (ver packages/entitlements: billingGate).
export async function reportPixPayment(planCode: string): Promise<void> {
  const session = await requireSession();

  const plan = await prisma.plan.findUnique({ where: { code: planCode }, select: { id: true, active: true } });
  if (!plan || !plan.active) {
    // Código de plano inválido/inativo não deveria acontecer vindo da nossa
    // própria tela — ignora a troca de plano, mas ainda registra o aviso.
    await prisma.subscription.update({
      where: { barbershopId: session.barbershopId },
      data: { paymentReportedAt: new Date() },
    });
    return;
  }

  await prisma.subscription.update({
    where: { barbershopId: session.barbershopId },
    data: { planId: plan.id, paymentReportedAt: new Date() },
  });
}
