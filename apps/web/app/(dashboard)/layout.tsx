import { redirect } from "next/navigation";
import { can, buildPixCopyPaste, formatPlanPrice, paymentReportMessage } from "@barber/domain";
import { activePlans, billingGate } from "@barber/entitlements";
import { getSession } from "@/lib/auth";
import { paymentConfigForCountry } from "@/lib/payment-config";
import { BillingPaywall } from "@/components/billing-paywall";
import { RenewalReminderBanner } from "@/components/renewal-reminder-banner";
import { DashboardNav, type DashboardNavItem } from "@/components/dashboard-nav";
import { PRODUCT_NAME } from "@barber/config";

const DIAS_PARA_LEMBRETE = 3;

export const dynamic = "force-dynamic";

/// Guarda única do painel: nenhuma tela abaixo daqui renderiza sem sessão, e
/// cada item de menu só aparece para quem tem a permissão correspondente.
/// A tela esconder não é a barreira — cada ação revalida no servidor.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/entrar");
  const barbershopName = session.barbershopName;
  const barbershopCountry = session.barbershopCountry;

  // Bloqueio de cobrança (§19 #3) vem antes de qualquer outra coisa: sem
  // acesso pago, nada do resto do painel deveria renderizar.
  const gate = await billingGate(session.barbershopId);

  // Instruções de pagamento de um plano específico — usadas tanto pelo
  // bloqueio total quanto pelo lembrete não-bloqueante dos últimos dias,
  // então monta uma vez só e cada chamador decide o que fazer com a lista.
  // Pix (Brasil) ou Alias (Paraguai/Uruguai) conforme o país da loja —
  // Marco 7.
  async function pixPlanOptions() {
    const paymentConfig = paymentConfigForCountry(barbershopCountry);
    if (!paymentConfig || !gate) return [];
    const plans = await activePlans(barbershopCountry);
    return plans.map((plan) => ({
      code: plan.code,
      name: plan.name,
      amountLabel: formatPlanPrice(plan.priceMinor, plan.currency),
      methodLabel: paymentConfig.methodLabel,
      instructionsHint: paymentConfig.instructionsHint,
      pixCode:
        paymentConfig.method === "pix"
          ? buildPixCopyPaste({
              pixKey: paymentConfig.paymentCode,
              merchantName: process.env.PIX_MERCHANT_NAME ?? PRODUCT_NAME,
              merchantCity: process.env.PIX_MERCHANT_CITY ?? "Sao Paulo",
              amountMinor: plan.priceMinor,
              txid: gate.subscriptionId.replace(/-/g, "").slice(0, 25),
            })
          : paymentConfig.paymentCode,
      whatsappLink: paymentReportMessage({
        companyWhatsappPhone: paymentConfig.companyWhatsapp,
        barbershopName,
        planName: plan.name,
        country: barbershopCountry,
      }),
    }));
  }

  if (gate?.blocked) {
    const planOptions = await pixPlanOptions();
    if (planOptions.length > 0) {
      return (
        <BillingPaywall
          shopName={session.barbershopName}
          plans={planOptions}
          selectedPlanCode={gate.planCode}
          alreadyReported={Boolean(gate.paymentReportedAt)}
        />
      );
    }
    // Configuração de pagamento ausente para o país, ou nenhum plano ativo:
    // não trava o cliente por uma falha de configuração ou dado nossa — loga
    // alto e deixa passar.
    console.error(
      `[billing-gate] cobrança bloqueada mas faltou config de pagamento pro país ${session.barbershopCountry} ou plano ativo`
    );
  }

  // Lembrete não-bloqueante: aparece nos últimos dias do período pago (trial
  // ou ciclo mensal), pra ninguém ser pego de surpresa pelo bloqueio total.
  let reminder: React.ReactNode = null;
  if (gate && !gate.blocked && gate.currentPeriodEnd) {
    const msRestantes = gate.currentPeriodEnd.getTime() - Date.now();
    const diasRestantes = Math.ceil(msRestantes / (24 * 60 * 60 * 1000));
    if (diasRestantes <= DIAS_PARA_LEMBRETE) {
      const planOptions = await pixPlanOptions();
      const planoAtual = planOptions.find((plan) => plan.code === gate.planCode);
      if (planoAtual) {
        reminder = (
          <RenewalReminderBanner
            daysLeft={diasRestantes}
            dueDateLabel={gate.currentPeriodEnd.toLocaleDateString("pt-BR")}
            plan={planoAtual}
            alreadyReported={Boolean(gate.paymentReportedAt)}
          />
        );
      }
    }
  }

  const nav: Array<DashboardNavItem & { permission: Parameters<typeof can>[1] }> = [
    { href: "/hoje", label: "Hoje", iconKey: "hoje", permission: "appointments.read.own" as const },
    { href: "/agenda", label: "Agenda", iconKey: "agenda", permission: "appointments.read.own" as const },
    { href: "/clientes", label: "Clientes", iconKey: "clientes", permission: "customers.read" as const },
    { href: "/retorno", label: "Retorno", iconKey: "retorno", permission: "customers.read" as const },
    {
      href: "/agenda-inteligente",
      label: "Agenda Inteligente",
      iconKey: "agenda-inteligente",
      permission: "smart_agenda.read" as const,
    },
    {
      href: "/relatorios",
      label: "Relatórios",
      iconKey: "relatorios",
      permission: "reports.advanced.read" as const,
    },
    { href: "/equipe", label: "Equipe", iconKey: "equipe", permission: "professionals.read" as const },
    { href: "/gestao/servicos", label: "Serviços", iconKey: "servicos", permission: "services.read" as const },
    {
      href: "/gestao/integracoes",
      label: "Integrações",
      iconKey: "integracoes",
      permission: "integrations.read" as const,
    },
    {
      href: "/gestao/configuracoes",
      label: "Configurações",
      iconKey: "configuracoes",
      permission: "barbershop.settings.read" as const,
    },
  ].filter((item) => can(session.membership, item.permission));

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <DashboardNav
        items={nav.map(({ href, label, iconKey }) => ({ href, label, iconKey }))}
        shopName={session.barbershopName}
        userName={session.userName}
      />
      <div className="flex-1 lg:pl-64">
        {reminder}
        <main className="mx-auto max-w-3xl px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
