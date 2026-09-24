"use client";

import { useEffect } from "react";

/// Registra o service worker do push assim que a página carrega. Sem UI —
/// só a inscrição em si (feita pelos botões de push) depende do usuário agir;
/// o registro do worker em si pode acontecer sempre, de graça.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sem suporte (navegador antigo, contexto não seguro) — o site
      // funciona normalmente sem push, só os botões de inscrição não
      // aparecem (ver push-subscribe-button.tsx).
    });
  }, []);

  return null;
}
