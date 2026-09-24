"use client";

// Bloqueio obrigatório de pagamento (§19 #3, caminho manual via Pix). Troca
// TODO o conteúdo do painel — não é um banner por cima, é a única coisa que
// a barbearia vê até a equipe confirmar o recebimento em /plataforma.
//
// O Pro fica em evidência: é o plano que a barbearia já usou nos 7 dias de
// teste, então é a escolha padrão. O Básico existe, mas como uma saída
// discreta abaixo — não dois cartões do mesmo tamanho competindo por atenção.

import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { PixPaymentBox, type PixPaymentPlan } from "@/components/pix-payment-box";

export function BillingPaywall({
  shopName,
  plans,
  selectedPlanCode,
  alreadyReported,
}: {
  shopName: string;
  plans: PixPaymentPlan[];
  selectedPlanCode: string;
  alreadyReported: boolean;
}) {
  // O layout nunca renderiza este componente com `plans` vazio (ver
  // apps/web/app/(dashboard)/layout.tsx) — sem plano ativo, ele deixa passar
  // em vez de travar o cliente por uma falha de dado nossa.
  const proPlan = plans.find((plan) => plan.code === "pro") ?? plans[0]!;
  const basePlan = plans.find((plan) => plan.code !== proPlan.code);

  const [selected, setSelected] = useState(
    plans.find((plan) => plan.code === selectedPlanCode) ?? proPlan,
  );
  const noBasico = selected.code !== proPlan.code;

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
          <p className="mt-1 text-sm text-ink-secondary">{shopName}</p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-surface-1 p-6">
          <p className="text-sm leading-relaxed text-ink-secondary">
            O acesso ao painel fica pausado até a confirmação do pagamento. Pague com o{" "}
            {proPlan.methodLabel} abaixo e avise quem recebe — a liberação é conferida à mão e
            costuma ser rápida.
          </p>

          <div className="mt-4 rounded-xl border border-brand-500/50 bg-brand-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Plano Pro</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {proPlan.amountLabel}
              <span className="text-sm font-medium text-ink-secondary">/mês</span>
            </p>
          </div>

          {basePlan ? (
            noBasico ? (
              <p className="mt-3 text-center text-sm text-ink-secondary">
                Plano Básico selecionado —{" "}
                <button
                  type="button"
                  onClick={() => setSelected(proPlan)}
                  className="font-medium text-ink underline underline-offset-2"
                >
                  voltar para o Pro
                </button>
              </p>
            ) : (
              <p className="mt-3 text-center text-sm text-ink-secondary">
                <button
                  type="button"
                  onClick={() => setSelected(basePlan)}
                  className="font-medium text-ink underline underline-offset-2"
                >
                  Desejo o plano Básico
                </button>{" "}
                — {basePlan.amountLabel}/mês
              </p>
            )
          ) : null}

          <div className="mt-4">
            <PixPaymentBox key={selected.code} plan={selected} alreadyReported={alreadyReported} />
          </div>
        </div>
      </div>
    </main>
  );
}
