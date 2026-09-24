// Lado do navegador da inscrição de push. Fica fora do componente porque as
// duas telas que oferecem push (cliente e equipe) fazem exatamente a mesma
// dança do browser — só o servidor que recebe o resultado muda.

/// A Push API só aceita a chave VAPID como Uint8Array, não como a string
/// base64url que o servidor gera — conversão padrão do protocolo, sem
/// biblioteca porque é upstream trivial.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export type PushSupportStatus = "unsupported" | "ios-not-installed" | "ready";

/// iOS só entrega push pra PWA instalado (Adicionar à Tela de Início) —
/// detectável por `navigator.standalone` (Safari) ou pelo display-mode do
/// manifest quando já rodando instalado.
export function pushSupportStatus(): PushSupportStatus {
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!isIOS) return "ready";

  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone ||
    window.matchMedia("(display-mode: standalone)").matches;
  return standalone ? "ready" : "ios-not-installed";
}

export interface PushClientSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export class PushPermissionDeniedError extends Error {}

/// Pede permissão (se ainda não decidida), inscreve no push manager do
/// navegador e devolve a forma crua que o servidor grava. Não fala com o
/// servidor — quem chama decide pra qual action mandar (staff ou cliente).
export async function subscribeToPush(vapidPublicKey: string): Promise<PushClientSubscription> {
  const registration = await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new PushPermissionDeniedError();

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource,
    }));

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Inscrição de push incompleta");
  }
  return { endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } };
}

export async function unsubscribeFromPush(): Promise<string | null> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}
