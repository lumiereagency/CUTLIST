import { notFound } from "next/navigation";
import { instantToLocalDate, instantToLocalTime } from "@barber/domain";
import { findByManagementToken } from "@/lib/booking";
import { ManageActions } from "@/components/manage-appointment";
import { bookingStrings, formatDayLabel, formatPrice } from "@/lib/booking-i18n";

export const dynamic = "force-dynamic";

export default async function ManageAppointmentPage({ params }: { params: { token: string } }) {
  const appointment = await findByManagementToken(params.token);

  // Link inválido e link expirado levam à mesma página: distinguir os dois
  // ajudaria quem estivesse tentando adivinhar links.
  if (
    !appointment ||
    (appointment.managementTokenExpiresAt && appointment.managementTokenExpiresAt < new Date())
  ) {
    notFound();
  }

  const shop = appointment.barbershop;
  const t = bookingStrings(shop.country);
  const active = appointment.status === "CONFIRMED";
  const noticeLimit = new Date(Date.now() + shop.cancellationNoticeMinutes * 60000);
  const withinNotice = appointment.startsAt > noticeLimit;

  const localDate = instantToLocalDate(appointment.startsAt, shop.timezone);
  const localTime = instantToLocalTime(appointment.startsAt, shop.timezone);
  const dayLabel = formatDayLabel(localDate, shop.country);

  const STATUS_LABEL: Record<string, string> = {
    CONFIRMED: t.statusConfirmed,
    CANCELLED_BY_CUSTOMER: t.statusCancelledByCustomer,
    CANCELLED_BY_SHOP: t.statusCancelledByShop,
    COMPLETED: t.statusCompleted,
    NO_SHOW: t.statusNoShow,
    RESCHEDULED: t.statusRescheduled,
  };

  let blockedReason: string | null = null;
  if (!active) blockedReason = t.notActiveAnymore;
  else if (!withinNotice) {
    blockedReason = t.pastNoticeDeadline(shop.name);
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-surface-1 px-5 py-8">
      <header className="mb-6">
        <p className="text-sm text-ink-secondary">{shop.name}</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">{t.manageTitle}</h1>
      </header>

      <section
        className={`rounded-xl p-5 ${active ? "bg-success/12" : "bg-surface-2"}`}
      >
        <p className="text-sm font-medium uppercase tracking-wide text-ink-secondary">
          {STATUS_LABEL[appointment.status] ?? appointment.status}
        </p>
        <p className="mt-2 text-lg font-semibold text-ink">
          {appointment.serviceNameSnapshot}
        </p>
        <p className="text-ink">
          {t.withProfessional} {appointment.professionalNameSnapshot}
        </p>
        <p className="mt-1 text-ink first-letter:uppercase">
          {dayLabel}, {localTime}
        </p>
        <p className="mt-2 text-ink">{formatPrice(appointment.priceSnapshotMinor, shop.country)}</p>
      </section>

      {shop.cancellationPolicy ? (
        <p className="mt-4 text-sm text-ink-secondary">{shop.cancellationPolicy}</p>
      ) : null}

      <p className="mt-4 text-sm text-ink-secondary">
        {t.seeAllAppointmentsHint}{" "}
        <a href="/entrar-cliente" className="font-medium text-ink underline">
          {t.createAccountLink}
        </a>
      </p>

      <div className="mt-6">
        <ManageActions
          token={params.token}
          canCancel={active && withinNotice}
          blockedReason={blockedReason}
          shopPhone={shop.phone}
          shopName={shop.name}
          country={shop.country}
          whatsappText={t.whatsappAboutAppointment(appointment.serviceNameSnapshot, dayLabel, localTime)}
        />
      </div>
    </main>
  );
}
