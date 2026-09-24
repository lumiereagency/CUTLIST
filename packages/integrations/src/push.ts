// Notificação push (Web Push/PWA) — diferente de todo o resto da plataforma:
// é o único canal que sai sozinho, sem ninguém clicar em nada (ver nota em
// packages/domain/src/whatsapp.ts). Isso só é aceitável porque o consentimento
// é o próprio sistema de permissão do navegador — a pessoa aceita uma vez, por
// dispositivo, e pode revogar a qualquer momento pelo próprio navegador/OS.
//
// Vive aqui (não em @barber/web nem em apps/worker) porque quem manda o push
// de verdade é sempre o worker (reage a outbox_events e à varredura de
// lembrete), mas o formato do payload e o envio em si não deveriam depender
// de nenhum dos dois — o mesmo padrão do calendário nesta pasta.

import webpush from "web-push";

export interface PushSubscriptionKeys {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  /// Abre isto ao clicar na notificação — sempre relativo (ver sw.js)
  url: string;
  /// Diferencia o tipo de notificação pro service worker agrupar/substituir
  /// (ex.: dois lembretes do mesmo agendamento não duplicam na tela)
  tag?: string;
}

let vapidConfigured = false;

/// Fails-open como paymentConfigForCountry: sem as chaves, quem chama trata
/// como "push não disponível agora", nunca como travar o efeito principal
/// (o agendamento já é válido sem o push).
export function isPushConfigured(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;

  if (!vapidConfigured) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
  }
  return true;
}

export interface SendPushResult {
  /// Endpoints que devem ser apagados (410 Gone/404 — inscrição morta, o
  /// dispositivo desinstalou ou revogou a permissão)
  deadEndpoints: string[];
}

/// Manda pra várias inscrições em paralelo. Uma inscrição morta nunca derruba
/// as outras — cada falha é isolada e só entra em deadEndpoints pra limpeza.
export async function sendPushNotification(
  subscriptions: PushSubscriptionKeys[],
  payload: PushPayload
): Promise<SendPushResult> {
  if (!isPushConfigured() || subscriptions.length === 0) {
    return { deadEndpoints: [] };
  }

  const body = JSON.stringify(payload);
  const deadEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          body
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          deadEndpoints.push(subscription.endpoint);
        } else {
          console.error("[push] falha ao enviar", statusCode, error);
        }
      }
    })
  );

  return { deadEndpoints };
}
