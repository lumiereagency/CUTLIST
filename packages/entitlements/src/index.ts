// Entitlement de plano para uma barbearia — a metade que fala com o banco. O
// cálculo em si (o que cada status/prazo permite) é puro e vive em
// packages/domain/src/entitlements.ts, testado sem banco.

import { prisma } from "@barber/db";
import { type PlanFeatures, parsePlanFeatures, subscriptionGrantsAccess } from "@barber/domain";

const NO_ACCESS: PlanFeatures = {
  smartAgenda: false,
  waitlist: false,
  advancedReports: false,
  baileys: false,
};

/// Recursos que a barbearia pode usar agora. Nunca lança: sem assinatura
/// (não deveria acontecer para uma barbearia criada pelo onboarding, mas uma
/// tela não pode quebrar por causa disso) é o mesmo que nenhum recurso Pro.
export async function barbershopFeatures(barbershopId: string): Promise<PlanFeatures> {
  const subscription = await prisma.subscription.findUnique({
    where: { barbershopId },
    include: { plan: { select: { features: true } } },
  });
  if (!subscription) return NO_ACCESS;

  const acesso = subscriptionGrantsAccess(subscription.status, subscription.currentPeriodEnd);
  if (!acesso) return NO_ACCESS;

  return parsePlanFeatures(subscription.plan.features);
}

export interface BillingGate {
  subscriptionId: string;
  /// Quando true, o painel inteiro deve mostrar a cobrança em vez do conteúdo
  /// normal — não é só um recurso Pro faltando, é a barbearia sem acesso.
  blocked: boolean;
  planName: string;
  priceMinor: number;
  currentPeriodEnd: Date | null;
  paymentReportedAt: Date | null;
}

/// Estado da cobrança para o gate do painel (§19 #3, caminho manual via
/// Pix). `null` quando não deveria acontecer (barbearia sem assinatura) —
/// nesse caso o chamador não bloqueia: um dado inconsistente não pode virar
/// um cliente pagante trancado pra fora por bug nosso.
export async function billingGate(barbershopId: string): Promise<BillingGate | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { barbershopId },
    include: { plan: { select: { name: true, priceMinor: true } } },
  });
  if (!subscription) return null;

  const acesso = subscriptionGrantsAccess(subscription.status, subscription.currentPeriodEnd);

  return {
    subscriptionId: subscription.id,
    blocked: !acesso,
    planName: subscription.plan.name,
    priceMinor: subscription.plan.priceMinor,
    currentPeriodEnd: subscription.currentPeriodEnd,
    paymentReportedAt: subscription.paymentReportedAt,
  };
}
