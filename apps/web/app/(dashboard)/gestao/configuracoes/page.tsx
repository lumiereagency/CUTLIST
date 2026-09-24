import { prisma } from "@barber/db";
import { parseBranding } from "@barber/domain";
import { requirePermission } from "@/lib/auth";
import { BarbershopSettingsForm } from "@/components/barbershop-settings-form";
import { PublicLinkBox } from "@/components/public-link-box";
import { PushSubscribeButton } from "@/components/push-subscribe-button";
import { subscribeStaffPush, unsubscribeStaffPush } from "@/app/(dashboard)/push-actions";

const PUSH_LABELS = {
  activate: "Ativar notificações neste aparelho",
  activating: "Ativando…",
  active: "Notificações ativas neste aparelho",
  deactivate: "desativar",
  iosHint: "No iPhone, adicione a Cutlist à Tela de Início para poder ativar.",
  blocked: "Notificações bloqueadas nas configurações do navegador.",
  error: "Não foi possível ativar agora. Tente de novo.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requirePermission("barbershop.settings.read");

  const shop = await prisma.barbershop.findUniqueOrThrow({
    where: { id: session.barbershopId },
  });

  const canWrite = session.membership.role === "OWNER" || session.membership.role === "ADMIN";
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const publicUrl = `${baseUrl}/b/${shop.slug}`;
  const branding = parseBranding(shop.settings);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-ink">Configurações</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Dados do negócio, endereço da página e regras de agendamento.
        </p>
      </header>

      <PublicLinkBox url={publicUrl} />

      <div className="rounded-2xl border border-line-subtle bg-surface-1 p-5">
        <h2 className="font-medium text-ink">Notificações no celular</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Receba um aviso neste aparelho sempre que um cliente marcar ou cancelar um horário pela
          página pública. É por dispositivo — ative em cada celular ou computador que a equipe usa.
        </p>
        <PushSubscribeButton
          subscribe={subscribeStaffPush}
          unsubscribe={unsubscribeStaffPush}
          labels={PUSH_LABELS}
          className="mt-3"
        />
      </div>

      {canWrite ? (
        <BarbershopSettingsForm
          shop={{
            name: shop.name,
            slug: shop.slug,
            timezone: shop.timezone,
            phone: shop.phone,
            cancellationPolicy: shop.cancellationPolicy,
            holdDurationMinutes: shop.holdDurationMinutes,
            slotGranularityMinutes: shop.slotGranularityMinutes,
            minimumNoticeMinutes: shop.minimumNoticeMinutes,
            cancellationNoticeMinutes: shop.cancellationNoticeMinutes,
            bookingWindowDays: shop.bookingWindowDays,
            ...branding,
          }}
        />
      ) : (
        <p className="rounded-lg bg-surface-2 p-4 text-sm text-ink-secondary">
          Só o proprietário e administradores alteram estas configurações.
        </p>
      )}
    </div>
  );
}
