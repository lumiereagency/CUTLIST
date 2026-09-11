import { redirect } from "next/navigation";
import { can, buildPixCopyPaste, paymentReportMessage } from "@barber/domain";
import { billingGate } from "@barber/entitlements";
import { getSession } from "@/lib/auth";
import { BillingPaywall } from "@/components/billing-paywall";
import { DashboardNav, type DashboardNavItem } from "@/components/dashboard-nav";
import { PRODUCT_NAME } from "@barber/config";

const money = (minor: number) =>
  (minor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dynamic = "force-dynamic";

/// Guarda única do painel: nenhuma tela abaixo daqui renderiza sem sessão, e
/// cada item de menu só aparece para quem tem a permissão correspondente.
/// A tela esconder não é a barreira — cada ação revalida no servidor.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/entrar");

  // Bloqueio de cobrança (§19 #3) vem antes de qualquer outra coisa: sem
  // acesso pago, nada do resto do painel deveria renderizar.
  const gate = await billingGate(session.barbershopId);
  if (gate?.blocked) {
    const pixKey = process.env.PIX_KEY;
    const companyWhatsapp = process.env.COMPANY_WHATSAPP_NUMBER;
    if (pixKey && companyWhatsapp) {
      const pixCode = buildPixCopyPaste({
        pixKey,
        merchantName: process.env.PIX_MERCHANT_NAME ?? PRODUCT_NAME,
        merchantCity: process.env.PIX_MERCHANT_CITY ?? "Sao Paulo",
        amountMinor: gate.priceMinor,
        txid: gate.subscriptionId.replace(/-/g, "").slice(0, 25),
      });
      const whatsappLink = paymentReportMessage({
        companyWhatsappPhone: companyWhatsapp,
        barbershopName: session.barbershopName,
        planName: gate.planName,
      });

      return (
        <BillingPaywall
          shopName={session.barbershopName}
          planName={gate.planName}
          amountLabel={money(gate.priceMinor)}
          pixCode={pixCode}
          whatsappLink={whatsappLink}
          alreadyReported={Boolean(gate.paymentReportedAt)}
        />
      );
    }
    // PIX_KEY/COMPANY_WHATSAPP_NUMBER não configurados: não trava o cliente
    // por uma falha de configuração nossa — loga alto e deixa passar.
    console.error("[billing-gate] cobrança bloqueada mas PIX_KEY/COMPANY_WHATSAPP_NUMBER ausentes");
  }

  const nav: Array<DashboardNavItem & { permission: Parameters<typeof can>[1] }> = [
    { href: "/hoje", label: "Hoje", iconKey: "hoje", permission: "appointments.read.own" as const },
    { href: "/agenda", label: "Agenda", iconKey: "agenda", permission: "appointments.read.own" as const },
    { href: "/clientes", label: "Clientes", iconKey: "clientes", permission: "customers.read" as const },
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
        <main className="mx-auto max-w-3xl px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
