import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Link2,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { PRODUCT_NAME } from "@barber/config";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/landing/reveal";

const FEATURES = [
  {
    icon: Link2,
    title: "Página de agendamento própria",
    description: "Seu cliente marca o horário sozinho, a qualquer hora, pelo link da sua barbearia.",
  },
  {
    icon: CalendarDays,
    title: "Agenda da equipe",
    description: "Todo mundo vê os horários do dia num só lugar, sem grupo de WhatsApp nem caderno.",
  },
  {
    icon: UserRound,
    title: "Clientes, no automático",
    description: "O histórico de cada cliente se monta sozinho a cada agendamento — sem planilha.",
  },
  {
    icon: Sparkles,
    title: "Agenda Inteligente",
    description: "Cancelou um horário? O sistema já avisa quem tem mais chance de aceitar aquela vaga.",
  },
  {
    icon: BarChart3,
    title: "Relatórios",
    description: "Faturamento, serviços mais vendidos e desempenho da equipe, direto no painel.",
  },
  {
    icon: Users,
    title: "Equipe com permissão certa",
    description: "O barbeiro vê a própria agenda; o dono vê tudo. Cada um enxerga só o que precisa.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Cadastre sua barbearia",
    description: "Leva um minuto, sem cartão de crédito.",
  },
  {
    n: "2",
    title: "Configure serviços e equipe",
    description: "Preço, duração e quem atende cada serviço.",
  },
  {
    n: "3",
    title: "Compartilhe o link",
    description: "Pronto — seus clientes já podem agendar sozinhos.",
  },
];

const primaryButton =
  "bg-brand-gradient shadow-[0_8px_30px_-8px_rgba(255,90,31,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(255,90,31,0.65)] active:translate-y-0 active:shadow-[0_6px_18px_-8px_rgba(255,90,31,0.5)]";

function Glow({ className, tone = "brand" }: { className: string; tone?: "brand" | "soft" }) {
  const color = tone === "brand" ? "255,90,31" : "255,140,90";
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{
        background: `radial-gradient(circle, rgba(${color},.24) 0%, rgba(${color},.05) 45%, transparent 72%)`,
      }}
    />
  );
}

export default function HomePage() {
  return (
    <main className="bg-canvas">
      <header className="sticky top-0 z-50 border-b border-line-subtle/70 bg-canvas/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <BrandMark className="h-6 w-6 shrink-0 text-brand-500" />
          <p className="flex-1 truncate text-sm font-semibold tracking-wide text-ink">{PRODUCT_NAME}</p>
          <ThemeToggle />
          <Link
            href="/entrar"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink sm:block"
          >
            Entrar
          </Link>
          <Link
            href="/criar-conta"
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold text-white ${primaryButton}`}
          >
            Criar conta
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 pb-24 pt-24 sm:pb-32 sm:pt-32">
        <Glow className="left-1/2 top-0 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/3 opacity-70" />
        <Reveal className="relative mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface-1/80 px-3.5 py-1.5 text-xs font-medium text-ink-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Feito para barbearias que querem crescer sem bagunça
          </div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            O sistema completo pra sua barbearia parar de{" "}
            <span className="bg-brand-gradient bg-clip-text text-transparent">perder cliente</span> no
            WhatsApp.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg">
            Agendamento online, agenda da equipe, cadastro automático de clientes e recuperação
            de horário cancelado — tudo em um só lugar, com sua própria página.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/criar-conta"
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white sm:w-auto ${primaryButton}`}
            >
              Testar grátis agora
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <Link
              href="/entrar"
              className="w-full rounded-xl border border-line-strong px-6 py-3.5 text-center font-semibold text-ink transition-colors hover:border-line-strong hover:bg-surface-2 sm:w-auto"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-muted">Sem cartão de crédito. Teste completo do plano Pro.</p>
        </Reveal>
      </section>

      <section className="relative px-5 py-20 sm:py-28">
        <Glow className="right-0 top-1/4 h-[420px] w-[420px] translate-x-1/3 opacity-40" tone="soft" />
        <div className="relative mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-center text-sm font-medium uppercase tracking-wide text-ink-secondary">
              Tudo o que você precisa, em um só lugar
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.title} delay={0.06 * (index % 3)}>
                  <div className="group h-full rounded-2xl border border-line-subtle bg-surface-1 p-5 transition-colors duration-200 hover:border-line-strong">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-[0_6px_18px_-6px_rgba(255,90,31,0.5)]">
                      <Icon size={19} strokeWidth={1.9} />
                    </div>
                    <p className="mt-4 font-semibold text-ink">{feature.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{feature.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line-subtle bg-surface-1 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="text-center text-sm font-medium uppercase tracking-wide text-ink-secondary">
              Como funciona
            </h2>
          </Reveal>
          <div className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-[18px] hidden h-px bg-gradient-to-r from-transparent via-line-strong to-transparent sm:block"
            />
            {STEPS.map((step, index) => (
              <Reveal key={step.n} delay={0.08 * index} className="relative text-center">
                <div className="relative mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient font-semibold text-white shadow-[0_6px_18px_-6px_rgba(255,90,31,0.55)]">
                  {step.n}
                </div>
                <p className="mt-4 font-semibold text-ink">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-5 py-20 sm:py-28">
        <Glow className="left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <Reveal className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl bg-brand-gradient p-10 text-center shadow-[0_40px_80px_-24px_rgba(255,90,31,0.5)] sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          />
          <p className="relative text-xl font-semibold text-white sm:text-2xl">
            Comece a receber agendamento online hoje.
          </p>
          <p className="relative mx-auto mt-2 max-w-md text-sm text-white/85">
            Período de teste completo, sem compromisso e sem cartão de crédito.
          </p>
          <ul className="relative mx-auto mt-6 flex max-w-sm flex-col gap-2.5 text-left text-sm text-white/90">
            {["Página de agendamento própria", "Agenda da equipe e clientes automáticos", "Suporte durante o teste"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check size={16} strokeWidth={2.4} className="shrink-0" />
                  {item}
                </li>
              ),
            )}
          </ul>
          <Link
            href="/criar-conta"
            className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-ink-inverse transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.35)]"
          >
            Criar minha barbearia
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-line-subtle px-5 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-sm text-ink-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <BrandMark className="h-4 w-4 text-brand-500" />
            {PRODUCT_NAME}
          </div>
          <Link href="/entrar" className="hover:text-ink-secondary">
            Entrar no painel
          </Link>
        </div>
      </footer>
    </main>
  );
}
