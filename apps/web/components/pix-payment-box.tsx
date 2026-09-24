"use client";

// Bloco de pagamento reutilizado em dois lugares: o bloqueio total
// (BillingPaywall) e o lembrete não-bloqueante de vencimento próximo
// (RenewalReminderBanner). A lógica é a mesma em qualquer país: mostrar o
// código (Pix no Brasil, Alias no Paraguai/Uruguai), deixar copiar, e abrir
// o WhatsApp de quem recebe + registrar o aviso quando a pessoa diz que já
// pagou (Marco 7 generalizou isto — antes só existia Pix).

import { useState, useTransition } from "react";
import { Check, Copy } from "lucide-react";
import { reportPixPayment } from "@/app/(dashboard)/billing-actions";

export interface PixPaymentPlan {
  code: string;
  name: string;
  amountLabel: string;
  /// Payload Pix (BR) ou Alias cru (PY/UY) — o que a pessoa copia/cola.
  pixCode: string;
  /// "Pix copia e cola" ou "Alias (celular)" — rótulo mostrado acima do código.
  methodLabel: string;
  /// Instrução específica do método (onde colar, o que digitar).
  instructionsHint: string;
  whatsappLink: string;
}

// Usar `key={plan.code}` no componente pai quando o plano pode trocar (ex.:
// alternar Pro/Básico) — isso remonta o componente e reseta "avisado"/"copiado"
// automaticamente, em vez de precisar sincronizar estado com um efeito.
export function PixPaymentBox({ plan, alreadyReported }: { plan: PixPaymentPlan; alreadyReported: boolean }) {
  const [copiado, setCopiado] = useState(false);
  const [avisado, setAvisado] = useState(alreadyReported);
  const [isPending, startTransition] = useTransition();

  function copiarCodigo() {
    navigator.clipboard
      .writeText(plan.pixCode)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      })
      .catch(() => {
        // Clipboard bloqueado (contexto não seguro, permissão negada) — o
        // código continua selecionável à mão na caixa abaixo.
      });
  }

  function jaFizOPix() {
    window.open(plan.whatsappLink, "_blank", "noopener,noreferrer");
    setAvisado(true);
    startTransition(() => {
      reportPixPayment(plan.code).catch(() => {
        // Falhou silenciosamente do lado do servidor: o WhatsApp já foi
        // enviado (o que importa pra equipe conferir), então não bloqueamos
        // a pessoa por causa disso — só perde a prioridade na fila.
      });
    });
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-secondary">
        {plan.methodLabel} · {plan.name} · {plan.amountLabel}
      </p>
      <div className="flex items-stretch gap-2">
        <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-xl border border-line-subtle bg-surface-2 px-3 py-2.5 text-xs text-ink">
          {plan.pixCode}
        </code>
        <button
          type="button"
          onClick={copiarCodigo}
          aria-label={`Copiar ${plan.methodLabel}`}
          title={`Copiar ${plan.methodLabel}`}
          className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-line-subtle bg-surface-2 text-ink-secondary hover:text-ink"
        >
          {copiado ? <Check size={17} strokeWidth={2} className="text-success" /> : <Copy size={17} strokeWidth={1.9} />}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-ink-muted">{plan.instructionsHint}</p>

      <button
        type="button"
        onClick={jaFizOPix}
        disabled={isPending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
      >
        {avisado ? `Avisar de novo — plano ${plan.name}` : `Já paguei — plano ${plan.name}`}
      </button>

      {avisado ? (
        <p className="mt-2.5 text-center text-xs text-ink-secondary">
          Aviso enviado. Assim que a equipe confirmar o recebimento, é só recarregar a página.
        </p>
      ) : null}
    </div>
  );
}
