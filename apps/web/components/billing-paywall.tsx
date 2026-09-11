"use client";

// Bloqueio obrigatório de pagamento (§19 #3, caminho manual via Pix). Troca
// TODO o conteúdo do painel — não é um banner por cima, é a única coisa que
// a barbearia vê até a equipe confirmar o recebimento em /plataforma.

import { useState, useTransition } from "react";
import { Check, Copy } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { reportPixPayment } from "@/app/(dashboard)/billing-actions";

export function BillingPaywall({
  shopName,
  planName,
  amountLabel,
  pixCode,
  whatsappLink,
  alreadyReported,
}: {
  shopName: string;
  planName: string;
  amountLabel: string;
  pixCode: string;
  whatsappLink: string;
  alreadyReported: boolean;
}) {
  const [copiado, setCopiado] = useState(false);
  const [avisado, setAvisado] = useState(alreadyReported);
  const [isPending, startTransition] = useTransition();

  function copiarCodigo() {
    navigator.clipboard
      .writeText(pixCode)
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
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
    setAvisado(true);
    startTransition(() => {
      reportPixPayment().catch(() => {
        // Falhou silenciosamente do lado do servidor: o WhatsApp já foi
        // enviado (o que importa pra equipe conferir), então não bloqueamos
        // a pessoa por causa disso — só perde a prioridade na fila.
      });
    });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,90,31,.28) 0%, rgba(255,90,31,.06) 45%, transparent 72%)" }}
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark className="h-10 w-10 text-brand-500" />
          <h1 className="mt-4 text-2xl font-semibold text-ink">Falta renovar o acesso</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {shopName} · Plano {planName} · <span className="font-medium text-ink">{amountLabel}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-surface-1 p-6">
          <p className="text-sm leading-relaxed text-ink-secondary">
            O acesso ao painel fica pausado até a confirmação do pagamento. Pague com o código Pix
            abaixo e avise a equipe — a liberação é conferida à mão e costuma ser rápida.
          </p>

          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-secondary">
              Pix copia e cola
            </p>
            <div className="flex items-stretch gap-2">
              <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-xl border border-line-subtle bg-surface-2 px-3 py-2.5 text-xs text-ink">
                {pixCode}
              </code>
              <button
                type="button"
                onClick={copiarCodigo}
                aria-label="Copiar código Pix"
                title="Copiar código Pix"
                className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-line-subtle bg-surface-2 text-ink-secondary hover:text-ink"
              >
                {copiado ? <Check size={17} strokeWidth={2} className="text-success" /> : <Copy size={17} strokeWidth={1.9} />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-ink-muted">
              Cole esse código na opção "Pix Copia e Cola" do seu banco. O valor já vem certo.
            </p>
          </div>

          <button
            type="button"
            onClick={jaFizOPix}
            disabled={isPending}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3.5 font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {avisado ? "Avisar de novo no WhatsApp" : "Já fiz o Pix — avisar a equipe"}
          </button>

          {avisado ? (
            <p className="mt-3 text-center text-xs text-ink-secondary">
              Aviso enviado. Assim que a equipe confirmar o recebimento, é só recarregar a página.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
