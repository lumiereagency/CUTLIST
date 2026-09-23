import Link from "next/link";
import { notFound } from "next/navigation";
import { Link2, MessageCircle } from "lucide-react";
import { prisma } from "@barber/db";
import { parseBranding } from "@barber/domain";
import { billingGate } from "@barber/entitlements";
import { BookingUnavailable } from "@/components/booking-unavailable";

export const dynamic = "force-dynamic";

function formatPrice(minor: number): string {
  return (minor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function BarbershopPublicPage({ params }: { params: { slug: string } }) {
  const shop = await prisma.barbershop.findUnique({
    where: { slug: params.slug },
    include: {
      services: { where: { active: true }, orderBy: { publicOrder: "asc" } },
      professionals: { where: { active: true }, orderBy: { bookingPriority: "asc" } },
    },
  });

  if (!shop || shop.status === "SUSPENDED") notFound();

  const gate = await billingGate(shop.id);
  if (gate?.blocked) return <BookingUnavailable shopName={shop.name} shopPhone={shop.phone} />;

  const branding = parseBranding(shop.settings);
  const whatsappUrl = shop.phone ? `https://wa.me/${shop.phone.replace(/\D/g, "")}` : null;

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-surface-1 pb-8">
      {branding.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- link livre, sem domínio fixo pra otimizar
        <img src={branding.coverUrl} alt="" className="h-36 w-full object-cover" />
      ) : null}

      <header className={`px-5 ${branding.coverUrl ? "pt-4" : "pt-8"} mb-6`}>
        {branding.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- link livre, sem domínio fixo pra otimizar
          <img
            src={branding.logoUrl}
            alt={shop.name}
            className="h-16 w-16 rounded-full border-2 border-surface-1 bg-surface-1 object-cover shadow-sm"
          />
        ) : null}

        <h1 className={`${branding.logoUrl ? "mt-3" : ""} text-2xl font-semibold text-ink`}>{shop.name}</h1>
        {shop.address ? (
          <p className="mt-1 text-sm text-ink-secondary">
            {(shop.address as { district?: string; city?: string }).district}
            {(shop.address as { city?: string }).city
              ? ` · ${(shop.address as { city?: string }).city}`
              : null}
          </p>
        ) : null}
        {branding.bio ? <p className="mt-2 text-sm text-ink-secondary">{branding.bio}</p> : null}

        {whatsappUrl || branding.instagramUrl ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-2"
              >
                <MessageCircle size={14} strokeWidth={1.9} />
                WhatsApp
              </a>
            ) : null}
            {branding.instagramUrl ? (
              <a
                href={branding.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-2"
              >
                <Link2 size={14} strokeWidth={1.9} />
                Instagram
              </a>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="px-5">
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-secondary">
            Serviços
          </h2>

          {shop.services.length === 0 ? (
            <p className="rounded-lg bg-canvas p-4 text-sm text-ink-secondary">
              Ainda não há serviços publicados por aqui.
            </p>
          ) : (
            <ul className="space-y-3">
              {shop.services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/b/${shop.slug}/agendar?servico=${service.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-line-subtle p-4 transition hover:border-line-strong focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <span>
                      <span className="block font-medium text-ink">{service.name}</span>
                      <span className="block text-sm text-ink-secondary">
                        {service.durationMinutes} min
                      </span>
                    </span>
                    <span className="whitespace-nowrap font-medium text-ink">
                      {formatPrice(service.priceMinor)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {shop.professionals.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-secondary">
              Profissionais
            </h2>
            <ul className="flex flex-wrap gap-2">
              {shop.professionals.map((professional) => (
                <li
                  key={professional.id}
                  className="rounded-full bg-surface-2 px-3 py-1 text-sm text-ink"
                >
                  {professional.displayName}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
