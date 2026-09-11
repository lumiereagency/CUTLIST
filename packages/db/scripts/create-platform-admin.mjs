#!/usr/bin/env node
// Cria (ou reseta a senha de) um admin da plataforma. Não existe cadastro
// público disso de propósito — é acesso a todo cliente — então isso roda uma
// vez, à mão, direto no servidor. Duplica o hash de senha de
// packages/domain/src/password.ts (mesmo formato "scrypt$N$r$p$salt$hash",
// pra bater com verifyPassword) em vez de importar: este script roda como
// node puro, sem TypeScript, e @barber/db aponta pro código-fonte, não pra
// um build.
import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const COST = 65536;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 128 * COST * BLOCK_SIZE * 2;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: MAX_MEMORY,
  });
  return ["scrypt", COST, BLOCK_SIZE, PARALLELIZATION, salt.toString("base64"), derived.toString("base64")].join("$");
}

const [name, emailRaw, password] = process.argv.slice(2);

if (!name || !emailRaw || !password) {
  console.error('uso: node create-platform-admin.mjs "Nome" email@exemplo.com "senha-forte"');
  process.exit(1);
}
if (password.length < 10) {
  console.error("a senha precisa ter pelo menos 10 caracteres");
  process.exit(1);
}

const email = emailRaw.trim().toLowerCase();
const prisma = new PrismaClient();

const passwordHash = await hashPassword(password);
const admin = await prisma.platformAdminUser.upsert({
  where: { email },
  update: { name, passwordHash, active: true },
  create: { name, email, passwordHash },
});

console.log(`Admin pronto: ${admin.email} (id ${admin.id})`);
await prisma.$disconnect();
