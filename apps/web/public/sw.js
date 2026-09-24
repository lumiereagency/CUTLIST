// Service worker do Web Push (Marco "Notificações"). Arquivo puro, sem
// bundler — service worker roda como está, direto do /public.
//
// Só faz duas coisas: mostrar a notificação que chega (evento "push") e abrir
// a página certa quando a pessoa toca nela (evento "notificationclick").
// Nenhuma lógica de negócio mora aqui — o payload já vem pronto do worker
// (apps/worker/handlers/push.ts).

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const { title, body, url, tag } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/apple-icon.png",
      badge: "/apple-icon.png",
      tag: tag || "cutlist-notification",
      // Substitui uma notificação anterior da mesma "tag" em vez de empilhar
      // (ex.: dois eventos do mesmo agendamento não viram duas linhas).
      renotify: true,
      vibrate: [80, 40, 80],
      data: { url: url || "/" },
      actions: [{ action: "open", title: "Abrir" }],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        // Já tem uma aba do site aberta: foca nela e navega, em vez de abrir
        // outra — evita acumular abas duplicadas a cada notificação tocada.
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
