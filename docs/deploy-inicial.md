# Primeiro deploy na VPS (teste interno)

Este runbook cobre o que falta em `docs/runbook-operacao.md`: aquele documento
assume o stack já no ar (backup, restauração, perda da VPS). Este aqui é o
"do zero até o primeiro `/criar-conta` funcionando".

Não confundir com lançamento para cliente real — ver "O que isto NÃO libera"
no fim.

## 0. Pré-requisitos

- Docker e Docker Compose v2 na VPS (`docker compose version`). Se não
  estiver instalado: `apt install docker.io docker-compose-v2`.
- Domínio apontando para o IP da VPS: registro `A` (e `AAAA` se houver IPv6)
  para o domínio raiz ou subdomínio escolhido (ex.: `app.seudominio.com`).
  Propague o DNS **antes** do passo 4 — quem emite o certificado TLS (Caddy
  ou certbot, dependendo do caminho abaixo) precisa que o domínio já resolva
  para a VPS.
- **Descubra antes de tudo se as portas 80/443 já têm dono**:
  `sudo ss -tlnp | grep -E ':80 |:443 '`. Vazio → siga o caminho **4a**
  (VPS dedicada a este app). Se aparecer `nginx`, `caddy`, `apache2` ou
  outro processo → siga o caminho **4b** (VPS compartilhada com outro app).
  Tentar usar o 4a com a porta já ocupada derruba o site que já está no ar.

## 1. Levar o código para a VPS

```bash
git clone <url-do-repo> barber
cd barber
git checkout claude/barber-saas-product-scope-vcp4q2   # ou a branch/tag de deploy
```

## 2. Gerar os segredos

Cada um destes é único por ambiente — não copiar do `.env` de desenvolvimento.

```bash
# AUTH_SECRET e TOKEN_HMAC_SECRET: qualquer string aleatória longa
openssl rand -base64 48   # rode duas vezes, uma para cada

# ENCRYPTION_KEY: 32 bytes em base64 (guarde-a fora da VPS também — ver
# docs/runbook-operacao.md, "ENCRYPTION_KEY merece cuidado próprio")
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Senha do Postgres
openssl rand -base64 24
```

## 3. Escrever `.env.prod`

Fora do controle de versão (já no `.gitignore`). Baseado em `.env.example`,
com os campos que o `docker-compose.prod.yml` exige.

**Sem aspas nos valores** — diferente do `.env` de desenvolvimento (lido pelo
`dotenv-cli`, que aceita aspas). `docker compose --env-file` remove aspas ao
interpolar, mas `docker run --env-file` (passo 5, migração) **não remove** —
um valor entre aspas vira literalmente `"valor"` dentro do container, e o
Prisma recusa a `DATABASE_URL` porque ela não começa mais com `postgresql://`.
Sem aspas, os dois comandos leem o mesmo arquivo do mesmo jeito.

```bash
APP_DOMAIN=app.seudominio.com
APP_BASE_URL=https://app.seudominio.com
NODE_ENV=production

POSTGRES_USER=barber
POSTGRES_PASSWORD=<gerado no passo 2>
POSTGRES_DB=barber_prod
DATABASE_URL=postgresql://barber:<mesma-senha>@postgres:5432/barber_prod
REDIS_URL=redis://redis:6379

AUTH_SECRET=<gerado no passo 2>
TOKEN_HMAC_SECRET=<gerado no passo 2>
ENCRYPTION_KEY=<gerado no passo 2>

# Teste interno: aceito explicitamente. Nunca para cliente real — ver
# apps/web/lib/messaging.ts. Sem isto, o boot falha em NODE_ENV=production.
SMS_PROVIDER=log

# Cobrança manual via Pix — enquanto não há gateway integrado (§19 #3), é
# assim que o paywall do painel gera o código de pagamento e o botão "já fiz
# o Pix" monta a mensagem de WhatsApp pra equipe conferir. Sem estas quatro,
# o gate loga erro e libera o cliente (nunca trava por falha de config nossa).
PIX_KEY=<chave Pix que recebe a assinatura — CPF/CNPJ, e-mail, telefone ou aleatória>
PIX_MERCHANT_NAME=<nome do beneficiário exibido no Pix, sem acento>
PIX_MERCHANT_CITY=<cidade do beneficiário, sem acento>
COMPANY_WHATSAPP_NUMBER=<número com DDI+DDD que recebe o aviso de pagamento>
```

`DATABASE_URL`/`REDIS_URL` apontam para `postgres`/`redis` porque esses são os
nomes dos serviços na rede interna do Compose — não para `localhost` nem para
o IP da VPS (Postgres e Redis não têm porta exposta, de propósito).

## 4a. Subir o stack — VPS dedicada a este app

Só quando o passo 0 confirmou que 80/443 estão livres.

```bash
docker compose -f infra/docker/docker-compose.prod.yml --profile standalone-tls --env-file .env.prod up -d --build
docker compose -f infra/docker/docker-compose.prod.yml --profile standalone-tls ps   # todos "healthy"
```

O Caddy (`--profile standalone-tls`) pede o certificado Let's Encrypt sozinho
na primeira subida — se o DNS ainda não tiver propagado, ele fica tentando;
corrija o DNS e ele resolve sem precisar reiniciar nada.

Pule para o passo 5.

## 4b. Subir o stack — VPS compartilhada com outro app

Quando o passo 0 encontrou `nginx` (ou outro proxy) já dono de 80/443 — o
caso de uma VPS que já hospeda outro site. Aqui é o nginx do host que fala
com a internet; o container `web` fica só em `127.0.0.1`, inalcançável de
fora, e o nginx repassa por nome de domínio.

**Sem `proxy` no compose** (por isso o `--profile standalone-tls` do 4a fica
de fora) **e com o override que publica a porta em loopback**:

**Importante**: o `web` da base (`docker-compose.prod.yml`) não tem `ports`
nenhum, só `expose` — de propósito, é o override abaixo que publica a porta.
Isso significa que **todo** comando (`down`, `up`, `ps`) tem que levar os
dois `-f` sempre juntos; usar só um deles em qualquer um deles faz o `web`
subir sem a porta publicada (`docker inspect` mostraria `"3000/tcp":null`).
Para não depender de digitar os dois `-f` toda vez, fixe-os numa variável:

```bash
COMPOSE="docker compose -f infra/docker/docker-compose.prod.yml -f infra/docker/docker-compose.shared-host.yml --env-file .env.prod"

$COMPOSE up -d --build
$COMPOSE ps   # web/worker/postgres/redis "healthy"
```

Confirme que só o `web` publicou porta (`docker compose ps` mostra
`127.0.0.1:3010->3000/tcp`) — `postgres` e `redis` continuam sem nenhuma.
Se quiser reconferir por fora do `ps`, `$COMPOSE port web 3000` deve
responder `127.0.0.1:3010`.

Novo site no nginx do host, `/etc/nginx/sites-available/app.seudominio.com`:

```nginx
server {
    listen 80;
    server_name app.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/app.seudominio.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# TLS — o mesmo mecanismo que provavelmente já emitiu o certificado do outro
# app neste host; confirme com `certbot certificates` antes, e ajuste se o
# outro app usar algo diferente de certbot
certbot --nginx -d app.seudominio.com
```

O certbot reescreve o bloco acima para redirecionar 80→443 e servir TLS
sozinho — não precisa escrever o `listen 443` à mão.

**Redação de log**: o `Caddyfile` deste repo (`infra/docker/Caddyfile`)
redige token de URL (`/a/{token}`, `/vaga/{token}`) do log antes dele existir
em texto puro em disco — sem isso, quem lê o log do proxy consegue cancelar a
reserva de qualquer cliente (Parte 3 §10). Sem o Caddy nesse caminho, é o
nginx do host que grava o log de acesso — ou aplique a mesma redação no
`log_format` do site, ou desligue o access log para esse `server{}`
(`access_log off;`).

Pule para o passo 5.

## 5. Aplicar as migrações

Nem a imagem `web` nem a `worker` levam o Prisma CLI (o build final é
enxuto de propósito). Rode a partir do estágio `build`, que ainda tem o
monorepo inteiro, contra a mesma rede interna:

```bash
docker build --target build -t barber-migrate -f infra/docker/web.Dockerfile .
docker run --rm --network barber_internal --env-file .env.prod \
  barber-migrate pnpm --filter @barber/db exec prisma migrate deploy
```

(`barber_internal` é o nome que o Compose dá à rede `internal` deste projeto
— confirme com `docker network ls` se o nome do projeto não for `barber`.)

## 5b. Criar o admin da plataforma

Sem isto, `/plataforma/entrar` não deixa ninguém entrar — não existe cadastro
público de admin de propósito, é acesso a todo cliente cadastrado. Roda uma
vez, reaproveitando a mesma imagem `barber-migrate` do passo anterior:

```bash
docker run --rm --network barber_internal --env-file .env.prod \
  barber-migrate node packages/db/scripts/create-platform-admin.mjs \
  "Seu Nome" "seu-email@empresa.com" "senha-forte-aqui"
```

Rodar de novo com o mesmo e-mail troca a senha (é upsert) — útil se perder o
acesso. A senha exigida é a mesma regra do login da equipe: 10+ caracteres.

## 6. Verificar

```bash
curl -s https://app.seudominio.com/api/health   # {"status":"ok"}
```

Depois, pelo navegador: `/criar-conta` cria a conta e a barbearia. Não precisa
semear nada — a barbearia criada já nasce com um período de teste (Marco 6.1).

## 7. Cobrança manual via Pix — como funciona no dia a dia

Enquanto não há gateway integrado (Marco 7), a renovação é assim:

1. Quando a assinatura de uma barbearia não dá mais acesso (trial vencido,
   `PAST_DUE` ou `CANCELED`), o painel inteiro dela vira uma tela obrigatória
   de pagamento com o código Pix (copia e cola, valor já certo) — ela não
   acessa mais nada até isso ser resolvido.
2. A barbearia paga e clica em "Já fiz o Pix" — isso abre o WhatsApp dela com
   uma mensagem pronta pro número em `COMPANY_WHATSAPP_NUMBER`, e marca no
   banco que ela avisou (só prioriza a fila, não libera sozinho).
3. Você confere o Pix recebido no extrato do banco e entra em
   `https://app.seudominio.com/plataforma/entrar` com o admin criado no passo
   5b. A barbearia que avisou aparece destacada no topo da lista.
4. Clicar em "Confirmar pagamento" reativa a assinatura por mais 30 dias — é
   a única forma de liberar; não existe confirmação automática.

## O que isto NÃO libera

Isto sobe o produto para **teste interno da equipe**, não para clientes reais.
Antes de aceitar o primeiro cliente de verdade, ver
`docs/delivery-part3.md` §10 ("Dúvidas que continuam bloqueando o
lançamento"):

- **Textos legais definitivos** — o consentimento do cliente grava a versão do
  texto aceito (`TERMS_VERSION`, hoje `dev-0`). É o mais urgente dos
  pendentes.
- **Provedor de SMS real** — `SMS_PROVIDER=log` escreve o código de acesso no
  log do servidor em vez de mandar por SMS. Ótimo para teste interno,
  inaceitável para cliente real.
- **Backup testado** — `docs/runbook-operacao.md` cobre isso; o ensaio de
  restauração é obrigatório antes de declarar "produção pronta" (Parte 3
  §16), não antes de testar internamente.
- Provedor de cobrança (Marco 7, ainda não construído) e limites numéricos de
  plano não bloqueiam o teste interno — a barbearia usa o trial do plano Pro
  automaticamente.
