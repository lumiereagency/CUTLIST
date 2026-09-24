"use client";

// Botão de inscrição em push, reutilizado pela equipe (dashboard, PT) e pelo
// cliente final (sucesso do agendamento + /a/{token}, PT/ES) — só os rótulos
// e a action de servidor mudam entre os dois usos.

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import {
  PushPermissionDeniedError,
  pushSupportStatus,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";

export interface PushSubscribeLabels {
  activate: string;
  activating: string;
  active: string;
  deactivate: string;
  iosHint: string;
  blocked: string;
  error: string;
}

interface PushSubscribeButtonProps {
  subscribe: (subscription: unknown) => Promise<{ ok: boolean }>;
  unsubscribe: (endpoint: string) => Promise<void>;
  labels: PushSubscribeLabels;
  className?: string;
}

type State = "idle" | "loading" | "subscribed" | "unsupported" | "ios-not-installed" | "blocked" | "error";

/// Inlinado pelo Next no bundle do cliente por causa do prefixo NEXT_PUBLIC_
/// — não é segredo (é a metade pública do par VAPID), só identifica o servidor.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;

export function PushSubscribeButton({ subscribe, unsubscribe, labels, className }: PushSubscribeButtonProps) {
  const [state, setState] = useState<State>("idle");
  const vapidPublicKey = VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!vapidPublicKey) {
      setState("unsupported");
      return;
    }
    const support = pushSupportStatus();
    if (support !== "ready") {
      setState(support);
      return;
    }
    if (Notification.permission === "denied") {
      setState("blocked");
      return;
    }
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((existing) => setState(existing ? "subscribed" : "idle"))
      .catch(() => setState("idle"));
  }, [vapidPublicKey]);

  async function handleActivate() {
    if (!vapidPublicKey) return;
    setState("loading");
    try {
      const subscription = await subscribeToPush(vapidPublicKey);
      const result = await subscribe(subscription);
      setState(result.ok ? "subscribed" : "error");
    } catch (error) {
      setState(error instanceof PushPermissionDeniedError ? "blocked" : "error");
    }
  }

  async function handleDeactivate() {
    setState("loading");
    try {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) await unsubscribe(endpoint);
      setState("idle");
    } catch {
      setState("subscribed");
    }
  }

  if (state === "unsupported") return null;

  if (state === "ios-not-installed") {
    return (
      <p className={`text-xs text-ink-muted ${className ?? ""}`}>
        <Bell size={13} strokeWidth={2} className="mr-1 inline-block align-[-2px]" />
        {labels.iosHint}
      </p>
    );
  }

  if (state === "blocked") {
    return (
      <p className={`text-xs text-ink-muted ${className ?? ""}`}>
        <BellOff size={13} strokeWidth={2} className="mr-1 inline-block align-[-2px]" />
        {labels.blocked}
      </p>
    );
  }

  if (state === "subscribed") {
    return (
      <button
        type="button"
        onClick={handleDeactivate}
        className={`inline-flex items-center gap-1.5 rounded-xl border border-line-subtle bg-surface-2 px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink ${className ?? ""}`}
      >
        <BellRing size={15} strokeWidth={2} className="text-brand-500" />
        {labels.active}
        <span className="ml-1 text-xs text-ink-muted underline">{labels.deactivate}</span>
      </button>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleActivate}
        disabled={state === "loading"}
        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-400 disabled:opacity-60"
      >
        {state === "loading" ? (
          <Loader2 size={15} strokeWidth={2} className="animate-spin" />
        ) : (
          <Bell size={15} strokeWidth={2} />
        )}
        {state === "loading" ? labels.activating : labels.activate}
      </button>
      {state === "error" ? <p className="mt-1.5 text-xs text-error">{labels.error}</p> : null}
    </div>
  );
}
