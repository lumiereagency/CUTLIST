"use client";

// Aviso não-bloqueante nos últimos dias do período pago (trial ou ciclo
// mensal) — pedido explícito do cliente: como nenhuma mensagem sai sozinha
// (ver PixPaymentBox), o lembrete precisa acontecer onde a pessoa realmente
// está, que é dentro do próprio painel, não por um canal que exigiria enviar
// alguma coisa por conta própria.

import { useState } from "react";
import { PixPaymentBox, type PixPaymentPlan } from "@/components/pix-payment-box";

export function RenewalReminderBanner({
  daysLeft,
  dueDateLabel,
  plan,
  alreadyReported,
}: {
  daysLeft: number;
  dueDateLabel: string;
  plan: PixPaymentPlan;
  alreadyReported: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const dueText =
    daysLeft <= 0 ? "vence hoje" : daysLeft === 1 ? "vence amanhã" : `vence em ${daysLeft} dias`;

  return (
    <div className="border-b border-warning/30 bg-warning/10 px-5 py-3">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink">
          <span className="font-semibold">Seu acesso {dueText}</span> ({dueDateLabel}). Pague agora
          e não perca o painel.
        </p>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="shrink-0 rounded-lg border border-warning/40 bg-canvas px-3 py-1.5 text-xs font-semibold text-ink"
        >
          {expanded ? "Ocultar" : "Pagar agora"}
        </button>
      </div>

      {expanded ? (
        <div className="mx-auto mt-3 max-w-3xl rounded-xl border border-line-subtle bg-surface-1 p-4">
          <PixPaymentBox key={plan.code} plan={plan} alreadyReported={alreadyReported} />
        </div>
      ) : null}
    </div>
  );
}
