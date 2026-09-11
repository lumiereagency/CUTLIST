"use server";

import { redirect } from "next/navigation";
import { prisma } from "@barber/db";
import { verifyPassword } from "@barber/domain";
import { createAdminSession, destroyAdminSession } from "@/lib/platform-admin-auth";

export interface FormState {
  error?: string;
}

// Mesmo raciocínio de tempo constante do login da equipe (ver (auth)/actions.ts):
// e-mail inexistente e senha errada custam o mesmo, pra tela não virar oráculo.
const DUMMY_HASH =
  "scrypt$65536$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

export async function signInAdmin(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Informe e-mail e senha." };

  const admin = await prisma.platformAdminUser.findUnique({ where: { email } });
  const valid = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !valid || !admin.active) {
    return { error: "E-mail ou senha incorretos." };
  }

  await prisma.platformAdminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await createAdminSession(admin.id);

  redirect("/plataforma/barbearias");
}

export async function signOutAdmin(): Promise<void> {
  await destroyAdminSession();
  redirect("/plataforma/entrar");
}
