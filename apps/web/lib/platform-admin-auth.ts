// Sessão do admin da plataforma (lumiereagency, não a equipe de uma
// barbearia). Espelha lib/auth.ts de propósito — mesmo padrão de cookie
// httpOnly + hash revogável no banco — mas com cookie, tabela e namespace
// próprios: PlatformAdminUser nunca é um Membership, e um vazamento de um
// lado não pode virar acesso administrativo do outro.

import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@barber/db";
import { generateToken, hashToken } from "@barber/domain";

const COOKIE_NAME = "platform_admin_session";
const SESSION_DAYS = 7; // mais curto que a sessão de equipe: é acesso a todo cliente

export class UnauthenticatedAdminError extends Error {
  constructor() {
    super("Sessão de admin ausente ou expirada");
    this.name = "UnauthenticatedAdminError";
  }
}

function sessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurado");
  return secret;
}

export interface ActiveAdminSession {
  adminId: string;
  adminName: string;
  adminEmail: string;
}

export async function createAdminSession(adminId: string): Promise<void> {
  const token = generateToken();

  await prisma.platformAdminSession.create({
    data: {
      adminId,
      tokenHash: hashToken(token, sessionSecret()),
      expiresAt: new Date(Date.now() + SESSION_DAYS * 864e5),
    },
  });

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.platformAdminSession
      .updateMany({
        where: { tokenHash: hashToken(token, sessionSecret()), revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => {});
  }
  cookies().delete(COOKIE_NAME);
}

export const getAdminSession = cache(async (): Promise<ActiveAdminSession | null> => {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.platformAdminSession.findUnique({
    where: { tokenHash: hashToken(token, sessionSecret()) },
    include: { admin: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (!session.admin.active) return null;

  return {
    adminId: session.admin.id,
    adminName: session.admin.name,
    adminEmail: session.admin.email,
  };
});

export async function requireAdminSession(): Promise<ActiveAdminSession> {
  const session = await getAdminSession();
  if (!session) throw new UnauthenticatedAdminError();
  return session;
}
