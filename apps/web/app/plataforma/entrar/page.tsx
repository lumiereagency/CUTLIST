"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInAdmin, type FormState } from "../actions";
import { BrandMark } from "@/components/brand-mark";
import { Field, inputClass } from "@/components/field";
import { PRODUCT_NAME } from "@barber/config";

const initialState: FormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-gradient px-4 py-3 font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-50"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export default function PlatformAdminSignInPage() {
  const [state, formAction] = useFormState(signInAdmin, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark className="h-10 w-10 text-brand-500" />
          <p className="mt-3 text-sm font-semibold tracking-wide text-ink-secondary">{PRODUCT_NAME}</p>
          <h1 className="mt-4 text-2xl font-semibold text-ink">Painel da plataforma</h1>
          <p className="mt-1 text-sm text-ink-secondary">Acesso restrito à equipe interna.</p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-surface-1 p-6">
          <form action={formAction} className="space-y-4">
            {state.error ? (
              <p role="alert" className="rounded-xl bg-error/12 p-4 text-sm text-error">
                {state.error}
              </p>
            ) : null}

            <Field label="E-mail">
              <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
            </Field>

            <Field label="Senha">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className={inputClass}
              />
            </Field>

            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  );
}
