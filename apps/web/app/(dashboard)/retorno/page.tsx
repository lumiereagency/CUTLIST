import { MessageCircle, Undo2 } from "lucide-react";
import { formatPhoneBR, instantToLocalDate } from "@barber/domain";
import { prisma } from "@barber/db";
import { requirePermission } from "@/lib/auth";
import { customersDueForReturn } from "@/lib/retorno";

export const dynamic = "force-dynamic";

function shortDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function RetornoPage() {
  const session = await requirePermission("customers.read");

  const shop = await prisma.barbershop.findUniqueOrThrow({
    where: { id: session.barbershopId },
    select: { timezone: true },
  });

  const pendentes = await customersDueForReturn(session.barbershopId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-ink">Retorno</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Clientes que já passaram do prazo de manutenção de algum serviço. A mensagem já vem
          pronta — você decide quem recebe e quando.
        </p>
      </header>

      {pendentes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-subtle bg-surface-1 p-6 text-center">
          <Undo2 size={28} strokeWidth={1.5} className="mx-auto text-ink-muted" />
          <p className="mt-3 font-medium text-ink">Ninguém pendente agora</p>
          <p className="mt-1 text-sm text-ink-secondary">
            Configure o "retorno recomendado" nos serviços (em Serviços) para esta lista começar a
            preencher sozinha.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {pendentes.map((cliente) => (
            <li
              key={`${cliente.barbershopCustomerId}:${cliente.serviceId}`}
              className="flex items-center gap-3 rounded-xl border border-line-subtle bg-surface-1 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-ink-secondary">
                {iniciais(cliente.customerName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{cliente.customerName}</p>
                <p className="text-sm text-ink-secondary">
                  {formatPhoneBR(cliente.customerPhone)} · {cliente.serviceName}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Última vez em {shortDate(instantToLocalDate(cliente.lastVisitAt, shop.timezone))} · há{" "}
                  {cliente.daysSinceLastVisit} dias
                </p>
              </div>
              <a
                href={cliente.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-sm font-medium text-white"
              >
                <MessageCircle size={16} strokeWidth={1.9} />
                Chamar
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes.at(-1)?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}
