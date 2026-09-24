"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signUp, type FormState } from "../actions";
import { BrandMark } from "@/components/brand-mark";
import { Field, inputClass } from "@/components/field";
import { ThemeToggle } from "@/components/theme-toggle";
import { PRODUCT_NAME } from "@barber/config";
import { landingLocaleFromParam, type LandingLocale } from "@/lib/landing-i18n";

const initialState: FormState = {};

// Só o Brasil tem múltiplos fusos de verdade — os demais países entram com
// um só, então não faz sentido perguntar região deles também (o funil fica
// "país" primeiro, e só o Brasil abre uma segunda pergunta).
const COUNTRIES: Record<LandingLocale, { value: string; label: string; timezone: string | null }[]> = {
  pt: [
    { value: "BR", label: "Brasil", timezone: null },
    { value: "PY", label: "Paraguai", timezone: "America/Asuncion" },
  ],
  es: [
    { value: "BR", label: "Brasil", timezone: null },
    { value: "PY", label: "Paraguay", timezone: "America/Asuncion" },
  ],
};

// Fusos do Brasil. O campo é obrigatório porque sem ele a agenda não existe,
// mas ninguém deveria precisar pensar nisso: o padrão cobre a maioria.
const BR_TIMEZONES = [
  { value: "America/Sao_Paulo", label: "Brasília, São Paulo, Sul e Sudeste" },
  { value: "America/Manaus", label: "Manaus, Cuiabá, Porto Velho" },
  { value: "America/Belem", label: "Belém, Fortaleza, Recife, Salvador" },
  { value: "America/Rio_Branco", label: "Rio Branco" },
  { value: "America/Noronha", label: "Fernando de Noronha" },
];

const STRINGS: Record<
  LandingLocale,
  {
    heading: string;
    subheading: string;
    businessName: string;
    businessNameHint: string;
    country: string;
    timezone: string;
    ownerName: string;
    email: string;
    password: string;
    passwordHint: string;
    submit: string;
    submitting: string;
    hasAccount: string;
    signIn: string;
  }
> = {
  pt: {
    heading: "Cadastre seu negócio",
    subheading: "Leva um minuto. Depois você configura serviços e horários.",
    businessName: "Nome do negócio",
    businessNameHint: "É o nome que aparece na sua página de agendamento.",
    country: "País",
    timezone: "Onde fica seu negócio",
    ownerName: "Seu nome",
    email: "Seu e-mail",
    password: "Senha",
    passwordHint: "Pelo menos 10 caracteres.",
    submit: "Criar meu negócio",
    submitting: "Criando…",
    hasAccount: "Já tem conta?",
    signIn: "Entrar",
  },
  es: {
    heading: "Registrá tu negocio",
    subheading: "Lleva un minuto. Después configurás servicios y horarios.",
    businessName: "Nombre del negocio",
    businessNameHint: "Es el nombre que aparece en tu página de reservas.",
    country: "País",
    timezone: "Dónde queda tu negocio",
    ownerName: "Tu nombre",
    email: "Tu correo",
    password: "Contraseña",
    passwordHint: "Al menos 10 caracteres.",
    submit: "Crear mi negocio",
    submitting: "Creando…",
    hasAccount: "¿Ya tenés cuenta?",
    signIn: "Iniciar sesión",
  },
};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-ink-inverse transition-colors hover:bg-brand-400 active:bg-brand-600 disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function SignUpPage({ searchParams }: { searchParams: { lang?: string } }) {
  const locale = landingLocaleFromParam(searchParams.lang);
  const t = STRINGS[locale];
  const countries = COUNTRIES[locale];
  const [state, formAction] = useFormState(signUp, initialState);
  const [country, setCountry] = useState(locale === "es" ? "PY" : "BR");
  const selectedCountry = countries.find((item) => item.value === country) ?? countries[0]!;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,90,31,.28) 0%, rgba(255,90,31,.06) 45%, transparent 72%)" }}
      />

      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark className="h-10 w-10 text-brand-500" />
          <p className="mt-3 text-sm font-semibold tracking-wide text-ink-secondary">{PRODUCT_NAME}</p>
          <h1 className="mt-4 text-2xl font-semibold text-ink">{t.heading}</h1>
          <p className="mt-1 text-sm text-ink-secondary">{t.subheading}</p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-surface-1 p-6">
          <form action={formAction} className="space-y-4">
            {state.error ? (
              <p role="alert" className="rounded-xl bg-error/12 p-4 text-sm text-error">
                {state.error}
              </p>
            ) : null}

            <input type="hidden" name="lang" value={locale} />

            <Field label={t.businessName} hint={t.businessNameHint}>
              <input id="barbershopName" name="barbershopName" required className={inputClass} />
            </Field>

            <Field label={t.country}>
              <select
                name="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className={inputClass}
              >
                {countries.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            {selectedCountry.timezone ? (
              <input type="hidden" name="timezone" value={selectedCountry.timezone} />
            ) : (
              <Field label={t.timezone}>
                <select id="timezone" name="timezone" defaultValue="America/Sao_Paulo" className={inputClass}>
                  {BR_TIMEZONES.map((zone) => (
                    <option key={zone.value} value={zone.value}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <hr className="border-line-subtle" />

            <Field label={t.ownerName}>
              <input id="ownerName" name="ownerName" required autoComplete="name" className={inputClass} />
            </Field>

            <Field label={t.email}>
              <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
            </Field>

            <Field label={t.password} hint={t.passwordHint}>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                className={inputClass}
              />
            </Field>

            <SubmitButton label={t.submit} pendingLabel={t.submitting} />
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          {t.hasAccount}{" "}
          <Link href="/entrar" className="font-medium text-ink underline">
            {t.signIn}
          </Link>
        </p>
      </div>
    </main>
  );
}
