"use server";

import { redirect } from "next/navigation";
import { prisma } from "@barber/db";
import { verifyPassword } from "@barber/domain";
import { createSession, destroySession } from "@/lib/auth";
import {
  EmailAlreadyUsedError,
  InvalidSlugError,
  WeakPasswordError,
  signUpOwner,
} from "@/lib/onboarding";

export interface FormState {
  error?: string;
}

/// Só o cadastro (Marco 7) precisa disto — o login e o painel interno
/// continuam só em português (decisão de escopo: quem opera o negócio
/// tolera português, quem está criando conta pela landing em espanhol não).
type SignUpLang = "pt" | "es";

const SIGNUP_MESSAGES = {
  pt: {
    missingFields: "Preencha todos os campos.",
    emailUsed: "Já existe uma conta com este e-mail. Tente entrar.",
    weakPassword: {
      too_short: "A senha precisa ter pelo menos 10 caracteres",
      too_long: "A senha é longa demais",
      only_digits: "A senha não pode ser só números",
    },
    invalidSlug: {
      invalid: "Endereço da página inválido",
      taken: "Este endereço de página acabou de ser usado. Tente outro.",
    },
    failed: "Não foi possível criar a conta. Tente de novo.",
  },
  es: {
    missingFields: "Completá todos los campos.",
    emailUsed: "Ya existe una cuenta con este correo. Probá iniciar sesión.",
    weakPassword: {
      too_short: "La contraseña debe tener al menos 10 caracteres",
      too_long: "La contraseña es demasiado larga",
      only_digits: "La contraseña no puede ser solo números",
    },
    invalidSlug: {
      invalid: "Dirección de página inválida",
      taken: "Esta dirección de página se acaba de usar. Probá con otra.",
    },
    failed: "No pudimos crear la cuenta. Intentá de nuevo.",
  },
} as const satisfies Record<SignUpLang, unknown>;

function signUpLang(formData: FormData): SignUpLang {
  return formData.get("lang") === "es" ? "es" : "pt";
}

/// Tempo constante o suficiente: e-mail inexistente e senha errada devolvem a
/// mesma mensagem e passam pelo mesmo custo de verificação, para a tela não
/// virar um oráculo de quais e-mails têm conta (Parte 3 §10, enumeração).
const DUMMY_HASH =
  "scrypt$65536$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

export async function signIn(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Informe e-mail e senha." };

  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: { where: { status: "ACTIVE" }, take: 1 } },
  });

  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid || !user.active) {
    return { error: "E-mail ou senha incorretos." };
  }

  const membership = user.memberships[0];
  if (!membership) {
    return { error: "Sua conta não está vinculada a nenhum negócio ativo." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id, membership.barbershopId);

  redirect("/hoje");
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/entrar");
}

export async function signUp(_state: FormState, formData: FormData): Promise<FormState> {
  const lang = signUpLang(formData);
  const t = SIGNUP_MESSAGES[lang];
  const input = {
    ownerName: String(formData.get("ownerName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    barbershopName: String(formData.get("barbershopName") ?? "").trim(),
    timezone: String(formData.get("timezone") ?? "America/Sao_Paulo"),
    country: String(formData.get("country") ?? "BR"),
  };

  if (!input.ownerName || !input.email || !input.barbershopName) {
    return { error: t.missingFields };
  }

  try {
    const result = await signUpOwner(input);
    await createSession(result.userId, result.barbershopId);
  } catch (error) {
    if (error instanceof EmailAlreadyUsedError) {
      return { error: t.emailUsed };
    }
    if (error instanceof WeakPasswordError) {
      return { error: t.weakPassword[error.reason] };
    }
    if (error instanceof InvalidSlugError) {
      return { error: t.invalidSlug[error.reason] };
    }
    console.error("[signup] falhou", error);
    return { error: t.failed };
  }

  redirect("/hoje");
}
