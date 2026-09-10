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

export default function HomePage() {
  return (
    <main className="bg-canvas">
      <header className="border-b border-line-subtle">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <BrandMark className="h-6 w-6 shrink-0 text-brand-500" />
          <p className="flex-1 truncate text-sm font-semibold tracking-wide text-ink">{PRODUCT_NAME}</p>
          <ThemeToggle />
          <Link
            href="/entrar"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-2 hover:text-ink sm:block"
          >
            Entrar
          </Link>
          <Link
            href="/criar-conta"
            className="whitespace-nowrap rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-400 active:bg-brand-600"
          >
            Criar conta
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,90,31,.28) 0%, rgba(255,90,31,.06) 45%, transparent 72%)" }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            O sistema completo pra sua barbearia parar de perder cliente no WhatsApp.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-secondary sm:text-lg">
            Agendamento online, agenda da equipe, cadastro automático de clientes e recuperação
            de horário cancelado — tudo em um só lugar, com sua própria página.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/criar-conta"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 font-semibold text-ink-inverse transition-colors hover:bg-brand-400 active:bg-brand-600 sm:w-auto"
            >
              Testar grátis agora
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <Link
              href="/entrar"
              className="w-full rounded-xl border border-line-strong px-6 py-3.5 text-center font-semibold text-ink hover:bg-surface-2 sm:w-auto"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-muted">Sem cartão de crédito. Teste completo do plano Pro.</p>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-sm font-medium uppercase tracking-wide text-ink-secondary">
            Tudo o que você precisa, em um só lugar
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-line-subtle bg-surface-1 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-500">
                    <Icon size={19} strokeWidth={1.9} />
                  </div>
                  <p className="mt-4 font-semibold text-ink">{feature.title}</p>
                  <p className="mt-1.5 text-sm text-ink-secondary">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line-subtle bg-surface-1 px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-sm font-medium uppercase tracking-wide text-ink-secondary">
            Como funciona
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="text-center">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-semibold text-ink-inverse">
                  {step.n}
                </div>
                <p className="mt-3 font-semibold text-ink">{step.title}</p>
                <p className="mt-1.5 text-sm text-ink-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl bg-brand-gradient p-10 text-center">
          <p className="text-xl font-semibold text-white sm:text-2xl">
            Comece a receber agendamento online hoje.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
            Período de teste completo, sem compromisso e sem cartão de crédito.
          </p>
          <ul className="mx-auto mt-5 flex max-w-sm flex-col gap-2 text-left text-sm text-white/90">
            {["Página de agendamento própria", "Agenda da equipe e clientes automáticos", "Suporte durante o teste"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check size={16} strokeWidth={2.4} />
                  {item}
                </li>
              ),
            )}
          </ul>
          <Link
            href="/criar-conta"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-ink-inverse transition-opacity hover:opacity-90"
          >
            Criar minha barbearia
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
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
