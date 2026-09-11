"use client";

// Navegação do painel — barra lateral fixa no desktop, gaveta deslizante no
// mobile (era barra horizontal com scroll; §"visualizar tudo sem deslizar").
// Vive num Client Component pra saber a rota ativa (usePathname) e abrir/
// fechar a gaveta; os itens em si (com permissão já aplicada) vêm do layout,
// que é quem tem a sessão.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  House,
  Link as LinkIcon,
  LogOut,
  Menu,
  Scissors,
  Settings,
  Sparkles,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/(auth)/actions";

const ICONS: Record<string, LucideIcon> = {
  hoje: House,
  agenda: CalendarDays,
  clientes: UserRound,
  "agenda-inteligente": Sparkles,
  relatorios: BarChart3,
  equipe: Users,
  servicos: Scissors,
  integracoes: LinkIcon,
  configuracoes: Settings,
};

export interface DashboardNavItem {
  href: string;
  label: string;
  iconKey: string;
}

function NavLinks({ items, pathname, onNavigate }: { items: DashboardNavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto">
      {items.map((item) => {
        const Icon = ICONS[item.iconKey] ?? House;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-surface-2 font-medium text-ink"
                : "text-ink-secondary hover:bg-surface-2 hover:text-ink"
            }`}
          >
            <Icon size={17} strokeWidth={1.9} className={active ? "text-brand-500" : undefined} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-3 flex items-center gap-1 border-t border-line-subtle pt-3">
      <ThemeToggle />
      <form action={signOut} className="flex-1">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-secondary hover:bg-surface-2 hover:text-ink"
        >
          <LogOut size={16} strokeWidth={1.9} />
          Sair
        </button>
      </form>
    </div>
  );
}

export function DashboardNav({
  items,
  shopName,
  userName,
}: {
  items: DashboardNavItem[];
  shopName: string;
  userName: string;
}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const reduzMotion = useReducedMotion();

  return (
    <>
      {/* Barra compacta do mobile — abre a gaveta em vez de rolar na horizontal */}
      <div className="flex items-center gap-3 border-b border-line-subtle bg-surface-1 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg p-1.5 text-ink-secondary hover:bg-surface-2 hover:text-ink"
        >
          <Menu size={20} strokeWidth={1.9} />
        </button>
        <BrandMark className="h-5 w-5 shrink-0 text-brand-500" />
        <p className="truncate text-sm font-medium text-ink">{shopName}</p>
      </div>

      {/* Sidebar fixa — todas as seções visíveis de uma vez, sem scroll horizontal */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-line-subtle lg:bg-surface-1 lg:px-3 lg:py-5">
        <div className="flex items-center gap-3 px-2 pb-6">
          <BrandMark className="h-7 w-7 shrink-0 text-brand-500" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{shopName}</p>
            <p className="truncate text-xs text-ink-secondary">{userName}</p>
          </div>
        </div>
        <NavLinks items={items} pathname={pathname} />
        <SidebarFooter />
      </aside>

      {/* Gaveta do mobile */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={reduzMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduzMotion ? undefined : { opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line-subtle bg-surface-1 px-3 py-5 lg:hidden"
              initial={reduzMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduzMotion ? undefined : { x: "-100%" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="absolute right-3 top-3 rounded-lg p-1.5 text-ink-secondary hover:bg-surface-2 hover:text-ink"
              >
                <X size={18} strokeWidth={1.9} />
              </button>
              <div className="flex items-center gap-3 px-2 pb-6 pt-1">
                <BrandMark className="h-7 w-7 shrink-0 text-brand-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{shopName}</p>
                  <p className="truncate text-xs text-ink-secondary">{userName}</p>
                </div>
              </div>
              <NavLinks items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
              <SidebarFooter />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
