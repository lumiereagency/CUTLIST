"use client";

// Link público da página de agendamento, em destaque na tela de
// Configurações — é o que o dono cola na bio do Instagram ou manda no
// WhatsApp. Copiar e o QR code (pra material impresso) ficam aqui, junto do
// link, em vez de escondidos em outro lugar.

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function PublicLinkBox({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      })
      .catch(() => {
        // Clipboard bloqueado — o link continua selecionável à mão abaixo.
      });
  }

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line-subtle bg-surface-1 p-4 sm:flex-row sm:items-center">
      <img
        src={qrSrc}
        alt="QR code da sua página de agendamento"
        width={96}
        height={96}
        className="shrink-0 self-center rounded-lg border border-line-subtle bg-white p-1.5 sm:self-auto"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">Sua página de agendamento</p>
        <p className="mt-1 break-all text-sm text-ink-secondary">{url}</p>
        <p className="mt-2 text-xs text-ink-secondary">
          É este link (e o QR code) que você divulga na bio do Instagram, no WhatsApp ou em
          material impresso — os clientes chegam direto na tela de agendar.
        </p>

        <button
          type="button"
          onClick={copiar}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line-subtle bg-surface-2 px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-3"
        >
          {copiado ? (
            <>
              <Check size={14} strokeWidth={2} className="text-success" />
              Copiado
            </>
          ) : (
            <>
              <Copy size={14} strokeWidth={1.9} />
              Copiar link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
