// Toggle de idioma da landing (Marco 7). Fica em ?lang na URL em vez de
// cookie/localStorage — de propósito: dá pra mandar pro parceiro paraguaio
// um link que já abre em espanhol, sem depender de nada salvo no navegador
// dele (decisão registrada na conversa que pediu isto).

import Link from "next/link";
import type { LandingLocale } from "@/lib/landing-i18n";

const OPTIONS: { value: LandingLocale; label: string }[] = [
  { value: "pt", label: "PT" },
  { value: "es", label: "ES" },
];

export function LanguageToggle({ locale }: { locale: LandingLocale }) {
  return (
    <div className="flex h-9 shrink-0 items-center rounded-xl border border-line-subtle bg-surface-2 p-0.5 text-xs font-semibold">
      {OPTIONS.map((option) => {
        const active = option.value === locale;
        return (
          <Link
            key={option.value}
            href={option.value === "pt" ? "/" : "/?lang=es"}
            aria-current={active ? "true" : undefined}
            className={`flex h-full items-center rounded-[10px] px-2.5 transition-colors ${
              active ? "bg-surface-1 text-ink shadow-sm" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
