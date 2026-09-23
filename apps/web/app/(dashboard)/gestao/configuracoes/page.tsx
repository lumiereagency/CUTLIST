import { prisma } from "@barber/db";
import { parseBranding } from "@barber/domain";
import { requirePermission } from "@/lib/auth";
import { BarbershopSettingsForm } from "@/components/barbershop-settings-form";
import { PublicLinkBox } from "@/components/public-link-box";

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
