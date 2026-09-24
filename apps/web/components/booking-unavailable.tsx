// Estado exibido no lugar da página pública quando o negócio existe mas não
// está aceitando agendamento novo agora (pagamento pendente). Nunca menciona
// cobrança para quem está do lado do cliente — só que não dá pra agendar
// agora, com um jeito de falar direto com o negócio se tiver telefone.

import { bookingStrings } from "@/lib/booking-i18n";

export function BookingUnavailable({
  shopName,
  shopPhone,
  country = "BR",
}: {
  shopName: string;
  shopPhone: string | null;
  country?: string;
}) {
  const t = bookingStrings(country);
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-surface-1 px-5 py-8 text-center">
      <h1 className="text-xl font-semibold text-ink">{shopName}</h1>
      <p className="mt-4 text-base font-medium text-ink">{t.unavailableTitle}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-secondary">{t.unavailableBody}</p>
      {shopPhone ? (
        <a
          href={`https://wa.me/${shopPhone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 rounded-lg border border-line-subtle px-4 py-3 text-sm font-medium text-ink"
        >
          {t.unavailableWhatsapp(shopName)}
        </a>
      ) : null}
    </main>
  );
}
