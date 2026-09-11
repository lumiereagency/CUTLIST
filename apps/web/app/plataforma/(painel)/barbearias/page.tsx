import { prisma } from "@barber/db";
import { subscriptionGrantsAccess } from "@barber/domain";
import { requireAdminSession } from "@/lib/platform-admin-auth";
import { confirmPayment } from "./actions";

export const dynamic = "force-dynamic";

const money = (minor: number) =>
  (minor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dateLabel = (date: Date | null) =>
  date ? date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const STATUS_LABEL: Record<string, string> = {
  TRIALING: "Em teste",
  ACTIVE: "Ativa",
  PAST_DUE: "Atrasada",
  CANCELED: "Cancelada",
};

export default async function PlatformAdminBarbershopsPage() {
  await requireAdminSession();

  const subscriptions = await prisma.subscription.findMany({
    include: {
      barbershop: { select: { name: true, slug: true, createdAt: true } },
      plan: { select: { name: true, priceMinor: true } },
    },
    // Postgres põe NULL por último em DESC: quem avisou que pagou sobe pro topo.
    orderBy: [{ paymentReportedAt: "desc" }, { currentPeriodEnd: "asc" }],
  });

  const total = subscriptions.length;
  const pendentes = subscriptions.filter((item) => item.paymentReportedAt !== null).length;
  const bloqueadas = subscriptions.filter(
    (item) => !subscriptionGrantsAccess(item.status, item.currentPeriodEnd)
  ).length;
  const ativas = subscriptions.filter((item) => item.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-ink">Barbearias</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Todas as barbearias cadastradas e o estado da assinatura de cada uma.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-surface-1 p-4">
          <p className="text-xs uppercase tracking-wide text-ink-secondary">Total</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{total}</p>
        </div>
        <div className="rounded-xl bg-surface-1 p-4">
          <p className="text-xs uppercase tracking-wide text-ink-secondary">Ativas</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{ativas}</p>
        </div>
        <div className="rounded-xl bg-surface-1 p-4">
          <p className="text-xs uppercase tracking-wide text-ink-secondary">Bloqueadas</p>
          <p className="mt-1 text-2xl font-semibold text-error">{bloqueadas}</p>
        </div>
        <div className="rounded-xl border border-warning/35 bg-warning/12 p-4">
          <p className="text-xs uppercase tracking-wide text-warning">Avisaram que pagaram</p>
          <p className="mt-1 text-2xl font-semibold text-warning">{pendentes}</p>
        </div>
      </section>

      <section className="space-y-2">
        {subscriptions.length === 0 ? (
          <p className="rounded-xl bg-surface-1 p-6 text-center text-sm text-ink-secondary">
            Nenhuma barbearia cadastrada ainda.
          </p>
        ) : (
          subscriptions.map((subscription) => {
            const acesso = subscriptionGrantsAccess(subscription.status, subscription.currentPeriodEnd);
            const avisouPagamento = subscription.paymentReportedAt !== null;

            return (
              <div
                key={subscription.id}
                className={`rounded-xl border p-4 ${
                  avisouPagamento
                    ? "border-warning/35 bg-warning/12"
                    : acesso
                      ? "border-line-subtle bg-surface-1"
                      : "border-error/30 bg-error/10"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{subscription.barbershop.name}</p>
                    <p className="text-xs text-ink-secondary">
                      /{subscription.barbershop.slug} · cliente desde {dateLabel(subscription.barbershop.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <p className="text-xs text-ink-secondary">Plano</p>
                      <p className="text-ink">
                        {subscription.plan.name} · {money(subscription.plan.priceMinor)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-secondary">Status</p>
                      <p className={acesso ? "text-ink" : "text-error"}>
                        {STATUS_LABEL[subscription.status] ?? subscription.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-secondary">Vence em</p>
                      <p className="text-ink">{dateLabel(subscription.currentPeriodEnd)}</p>
                    </div>
                  </div>

                  <form action={confirmPayment.bind(null, subscription.id)}>
                    <button
                      type="submit"
                      className="whitespace-nowrap rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95"
                    >
                      Confirmar pagamento
                    </button>
                  </form>
                </div>

                {avisouPagamento ? (
                  <p className="mt-2 text-xs font-medium text-warning">
                    Avisou que pagou em {subscription.paymentReportedAt?.toLocaleString("pt-BR")} — confira o
                    extrato antes de confirmar.
                  </p>
                ) : null}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
