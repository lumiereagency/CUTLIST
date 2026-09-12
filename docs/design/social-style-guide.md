# Padrão premium para posts de redes sociais

Extraído de 5 referências de mercado enviadas pelo cliente (marca de VR,
storage SaaS, fintech/VC, fashion-tech, app fintech mobile). Aplicar **sempre**
que for pedida produção de post/carrossel, em cima — nunca em vez — dos tokens
reais do produto (`apps/web/app/globals.css`, `apps/web/tailwind.config.ts`,
`apps/web/components/brand-mark.tsx`). O objetivo dessas peças é converter
(cliente em potencial vira teste grátis), não só "ficar bonito".

## O que muda em relação à primeira leva (guia de 7 dias)

- **Tipografia ousada, não texto de UI.** Título gigante (80–140px numa arte
  de 1080px), peso 800, tracking apertado. Uma frase de impacto por slide,
  não um parágrafo. A primeira leva usava tamanho de headline de app; isso é
  pequeno demais pra parar o dedo no feed.
- **Blocagem de cor sólida, não só o fundo escuro padrão.** Alternar
  deliberadamente: bloco 100% `--brand-500`, canvas escuro padrão, e um bloco
  claro/creme quando pedir contraste (texto escuro sobre claro). Repetir o
  mesmo fundo em todo slide é o que faz a primeira leva parecer "template",
  não campanha.
- **Grid assimétrico.** Nem todo slide segue a mesma estrutura
  (ícone + título + texto). Variar: slide só-tipografia, slide-vitrine (uma
  imagem/mockup grande, quase sem texto), slide de comparação. Ver as
  referências: nenhuma delas repete o mesmo layout 9 vezes.
- **O mockup de tela É a nossa fotografia.** Não temos fotografia de pessoas
  real (as referências usam muito disso) — o que temos de mais forte é a
  própria interface. Tratar um recorte fiel da tela do produto como peça
  hero: grande, central, com luz/glow ambiente atrás, não pequeno dentro de
  um cartão genérico.
- **Motivo de marca repetido.** Usar o próprio símbolo (BrandMark) como
  textura de fundo — repetido, rotacionado, opacidade baixa — não só cravado
  no canto superior.
- **CTA em pílula com seta circulada.** Reforça o ícone de seta com um
  círculo ao redor (como nas referências), não só a seta solta.
- **Nunca inventar número.** As referências usam estatística (`+245.4%`)
  porque é o produto delas mostrando dado real do cliente. Nós não temos
  esse dado ainda — usar comparação qualitativa ("menos vaga vazia") em vez
  de inventar uma porcentagem.

## O que continua igual (não é "estilo", é a marca)

- Paleta: `#08090B` / `#0F1114` / `#15181D` / `#262B33` / `#F7F7F4` /
  `#B2B7C0` / `#747B86`; gradiente
  `linear-gradient(135deg,#FF7A35 0%,#FF4D16 48%,#C92C0A 100%)`; texto
  escuro (`#16171A`, token `text-inverse`) sempre que o fundo for a cor da
  marca ou branco — nunca texto branco sobre laranja.
- Fonte Manrope.
- Símbolo da marca: paths SVG em `apps/web/components/brand-mark.tsx`.
