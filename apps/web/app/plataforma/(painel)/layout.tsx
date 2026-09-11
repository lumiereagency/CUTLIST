import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/platform-admin-auth";
import { signOutAdmin } from "../actions";
import { BrandMark } from "@/components/brand-mark";

export const dynamic = "force-dynamic";

/// Guarda única do painel administrativo — mesma ideia do (dashboard)/layout.tsx
/// da equipe, mas checando a sessão de admin, nunca a de barbearia.
export default async function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/plataforma/entrar");

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line-subtle bg-surface-1">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <BrandMark className="h-6 w-6 shrink-0 text-brand-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">Painel da plataforma</p>
            <p className="truncate text-xs text-ink-secondary">{session.adminName}</p>
          </div>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-2 hover:text-ink"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-6">{children}</main>
    </div>
  );
}
