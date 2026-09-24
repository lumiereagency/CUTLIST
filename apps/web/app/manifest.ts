import type { MetadataRoute } from "next";
import { PRODUCT_NAME } from "@barber/config";

// Convenção nativa do App Router — vira /manifest.webmanifest sozinho.
// Existe só pra habilitar "Adicionar à Tela de Início": sem isso instalado,
// o iOS Safari não entrega push nenhum pro site (Web Push só funciona em PWA
// instalado no iOS 16.4+; no Android/desktop o site já recebe direto).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PRODUCT_NAME,
    short_name: PRODUCT_NAME,
    description: "Agendamento online, agenda da equipe e notificações de horário.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090b",
    theme_color: "#ff5a1f",
    icons: [
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
