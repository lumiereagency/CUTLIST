"use client";

// Passo a passo de "Adicionar à Tela de Início" no iOS, mostrado sozinho na
// primeira visita — sem isto, a pessoa só descobre que precisa instalar
// quando já tentou ativar notificação e esbarrou na dica de uma linha do
// push-subscribe-button.tsx. Aparecer ANTES fecha esse gap: quando ela
// finalmente for ativar, já funciona de primeira.
//
// Só iOS: é a única plataforma que exige instalação pra push funcionar (ver
// pushSupportStatus em lib/push-client.ts). Android/desktop não precisam
// disto — o botão de ativar já funciona direto.

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Share, SquarePlus, X } from "lucide-react";
import { pushSupportStatus } from "@/lib/push-client";

const STORAGE_KEY = "cutlist-ios-install-seen";
const SHOW_DELAY_MS = 1600;

interface Copy {
  title: string;
  body: string;
  step1: string;
  step2: string;
  step3: string;
  dismiss: string;
}

const PT: Copy = {
  title: "Ative notificações neste iPhone",
  body: "No iPhone, o Safari só entrega notificações para sites adicionados à Tela de Início. Leva 10 segundos:",
  step1: "Toque no ícone de compartilhar, na barra do Safari",
  step2: 'Role e toque em "Adicionar à Tela de Início"',
  step3: "Abra a partir do ícone criado — só assim as notificações funcionam",
  dismiss: "Entendi",
};

const ES: Copy = {
  title: "Activá las notificaciones en este iPhone",
  body: "En el iPhone, Safari solo entrega notificaciones a sitios agregados a la pantalla de inicio. Lleva 10 segundos:",
  step1: "Tocá el ícono de compartir, en la barra de Safari",
  step2: 'Deslizá y tocá "Agregar a pantalla de inicio"',
  step3: "Abrí desde el ícono creado — solo así funcionan las notificaciones",
  dismiss: "Entendido",
};

export function IosInstallGuide({ locale }: { locale?: "pt" | "es" }) {
  const [visible, setVisible] = useState(false);
  const reduzMotion = useReducedMotion();

  useEffect(() => {
    if (pushSupportStatus() !== "ios-not-installed") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // Sem storage (modo privado etc.) — mostra mesmo assim, só não lembra
      // que já mostrou; melhor repetir uma vez do que nunca ensinar ninguém.
    }
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Não persistiu — reaparece na próxima visita, sem problema.
    }
  }

  const detectedLocale = locale ?? (typeof navigator !== "undefined" && navigator.language.startsWith("es") ? "es" : "pt");
  const t = detectedLocale === "es" ? ES : PT;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-label={t.title}
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-sm rounded-2xl border border-line-subtle bg-surface-1 p-4 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.45)] sm:inset-x-auto sm:right-5"
          initial={reduzMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduzMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <SquarePlus size={17} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{t.title}</p>
              <p className="mt-1 text-sm text-ink-secondary">{t.body}</p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t.dismiss}
              className="shrink-0 rounded-lg p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <ol className="mt-3 space-y-2 text-sm text-ink-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-ink">
                1
              </span>
              <span className="flex items-center gap-1.5">
                {t.step1}
                <Share size={14} strokeWidth={2} className="shrink-0 text-brand-500" />
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-ink">
                2
              </span>
              {t.step2}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-ink">
                3
              </span>
              {t.step3}
            </li>
          </ol>

          <button
            type="button"
            onClick={dismiss}
            className="mt-3 w-full rounded-xl border border-line-subtle px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-2 hover:text-ink"
          >
            {t.dismiss}
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
