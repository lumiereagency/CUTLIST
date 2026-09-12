# Padrão premium para posts de redes sociais

Extraído de 5 referências de mercado enviadas pelo cliente (RealSphere/VR,
Acepace/storage SaaS, Cedar Equity Ventures/fintech-VC, fourmula.ai/fashion-tech,
app fintech mobile). Aplicar **sempre** que for pedida produção de post/carrossel,
em cima — nunca em vez — dos tokens reais do produto (`apps/web/app/globals.css`,
`apps/web/tailwind.config.ts`, `apps/web/components/brand-mark.tsx`). O objetivo
dessas peças é converter (cliente em potencial vira teste grátis), não só "ficar
bonito".

Esta é a v2 do padrão. A v1 (primeira tentativa de elevar o design) errou em três
pontos que o cliente rejeitou: laranja chapado como fundo cheio, texto solto sem
âncora clara, e margens/ritmo vertical inconsistentes. As regras abaixo corrigem
isso — leia antes de qualquer produção nova.

## Grid e margem (obrigatório, todo slide)

- Canvas 1080×1080. Margem lateral fixa de **96px** dos dois lados (medida útil:
  888px) em **todo** slide, sem exceção.
- Lockup do logo (BrandMark + "CUTLIST") sempre no mesmo y = **88px** do topo,
  canto esquerdo, mesmo tamanho (24px símbolo + wordmark 17px/800), em todo slide
  da série — só a cor muda conforme o fundo. Contador "0X / 0Y" na mesma linha,
  canto direito, cor apagada (~65-70% opacidade).
- Margem inferior de segurança de **96px**. Nenhum elemento cola na borda.
- **Todo texto/bloco precisa de uma âncora clara** — nunca um valor de `top`
  arbitrário só porque "sobrou espaço ali". Use um dos 4 arquétipos abaixo; não
  invente um quinto por slide.

## Os 4 arquétipos de layout (reusar, não reinventar)

1. **Afirmação ancorada embaixo.** Logo no topo, meio do quadro respirando vazio
   de propósito, título grande (2 linhas no máximo, quebra deliberada, não
   orgânica) ancorado para que a BASE do bloco de texto fique perto do terço
   inferior (não o topo do texto — a base). Um subtítulo curto (1 linha) abaixo,
   opcional. É o padrão da Acepace e da fourmula.ai: nunca centralizado
   verticalmente, sempre pesando para baixo.
2. **Afirmação central.** Título + uma linha de apoio centralizados no eixo
   vertical do quadro (por volta de y=480-560). Usar no máximo 1x por carrossel,
   como "pausa" — é o tile "WE CRAFT CAPTIVATING PRESENTATIONS" da RealSphere,
   não o padrão de todo slide.
3. **Vitrine cinematográfica.** Título pequeno e compacto no topo (não compete
   com a peça visual). A peça — nosso mockup de produto, um grid de stats, uma
   lista — é a massa visual dominante, centralizada no quadro com margens
   equilibradas em cima E embaixo (sem "zona morta"), com glow ambiente atrás e
   sombra forte (`box-shadow: 0 40px 80px -20px rgba(0,0,0,.6)` ou similar).
4. **Passo numerado.** Selo pequeno "PASSO X DE Y" + ícone, título médio,
   parágrafo curto, e um cartão de mockup ancorado à margem inferior — sem
   numeral gigante decorativo no fundo (nenhuma referência usa esse recurso;
   corta ruído, não soma).

## Uso de laranja (regra estratégica — é o que mais mudou)

**Laranja nunca é um fundo chapado, sólido, cobrindo o quadro inteiro.** Nenhuma
das 5 referências faz isso de forma barata — é sempre uma destas três formas:

- **Glow/degradê radial atrás de um fundo escuro** (a capa do primeiro carrossel
  já fazia isso certo: `#08090B` + glow radial laranja no topo) — usar em capas.
- **Degradê diagonal profundo, laranja vivo → quase preto** (não laranja→laranja
  só um tom mais escuro): `linear-gradient(135deg, #FF7A35 0%, #FF4D16 35%,
  #C92C0A 70%, #2B0D04 100%)`. Só em 1 slide por carrossel — o fechamento/CTA —
  como "momento de cor" bookend, nunca repetido.
- **Acento pontual**: uma palavra destacada numa frase, preenchimento de um
  ícone/badge/pill, uma tag, uma barra de progresso. Nunca o fundo inteiro.

Se um slide "precisa" de laranja como protagonista, ele deve ser o
glow-sobre-escuro (abertura) ou o degradê-para-preto (fechamento) — nunca um
preenchimento uniforme `#FF5A1F` sólido cobrindo 1080×1080. Foi exatamente esse
erro na capa da "Agenda Inteligente" v1 que o cliente rejeitou.

## O que mais vale (herdado da v1, continua valendo)

- **Tipografia ousada, não texto de UI.** Título grande (60–96px numa arte de
  1080px conforme o arquétipo), peso 800, tracking apertado. Uma frase de
  impacto por slide.
- **Grid assimétrico entre slides.** Nem todo slide usa o mesmo arquétipo em
  sequência — variar dentro do carrossel.
- **O mockup de tela É a nossa fotografia.** Tratar a interface real do produto
  como peça hero (arquétipo 3): grande, central, com glow atrás, sombra forte.
- **Motivo de marca repetido.** Símbolo da marca como textura de fundo —
  repetido, rotacionado, opacidade baixa — em slides de abertura/fechamento.
- **CTA em pílula com seta circulada.**
- **Nunca inventar número.** Comparação qualitativa em vez de estatística
  fabricada.
- **Nunca overclaim de automação.** Se uma etapa do fluxo real exige uma ação
  manual da equipe (ex.: tocar em enviar no WhatsApp), a copy não pode dizer
  "sozinho" ou "automático" para essa etapa — só para a parte que é, de fato,
  automática (decisão/ranqueamento). Checar contra o código do produto antes de
  publicar.

## O que continua igual (não é "estilo", é a marca)

- Paleta escura (base): `#08090B` / `#0F1114` / `#15181D` / `#262B33` /
  `#F7F7F4` / `#B2B7C0` / `#747B86`. Paleta clara (contraste, usar 1x por
  carrossel): `#F5F5F2` / `#15171A` / `#626872` / `#E1E3E6`. Laranja de marca:
  `#FF5A1F` (`--brand-500`); texto escuro (`#16171A`, token `text-inverse`)
  sempre que o fundo for a cor da marca ou branco — nunca texto branco sobre
  laranja.
- Fonte Manrope.
- Símbolo da marca: paths SVG em `apps/web/components/brand-mark.tsx`.
