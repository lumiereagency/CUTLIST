# Imagem de manutenção — não é runtime da aplicação, é só um ambiente com
# @barber/db instalado e o client do Prisma gerado, pronta pra `docker run`
# pontual: `prisma migrate deploy` no deploy, ou scripts avulsos como
# create-platform-admin.mjs. Contexto de build: raiz do repositório (mesmo
# padrão de web.Dockerfile).

FROM node:22-alpine
# O binário do Prisma detecta a versão do OpenSSL em tempo de execução — sem
# o pacote, a detecção falha (mesma nota em web.Dockerfile).
RUN apk add --no-cache openssl
RUN corepack enable
RUN corepack prepare pnpm@10.33.0 --activate
WORKDIR /repo

# Instala o workspace inteiro: pnpm --frozen-lockfile precisa do grafo
# completo declarado em pnpm-workspace.yaml, mesmo só usando @barber/db.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
COPY packages/db/package.json packages/db/
COPY packages/domain/package.json packages/domain/
COPY packages/api-contracts/package.json packages/api-contracts/
COPY packages/config/package.json packages/config/
COPY packages/integrations/package.json packages/integrations/
COPY packages/entitlements/package.json packages/entitlements/
RUN pnpm install --frozen-lockfile

COPY packages/db ./packages/db
RUN pnpm --filter @barber/db exec prisma generate

WORKDIR /repo/packages/db
