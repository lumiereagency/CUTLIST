// Identidade visual da página pública (/b/{slug}), guardada solta no campo
// `settings` (Json) da Barbershop — não é modelo próprio porque só serve pra
// personalizar a página, nunca é usado em lógica de negócio.
//
// `settings` vem de fora (mesmo que só do próprio dono, pelo formulário), por
// isso nunca é lido direto: sempre passa por parseBranding, que ignora
// qualquer chave desconhecida e qualquer valor que não seja string.

export interface BarbershopBranding {
  logoUrl?: string;
  coverUrl?: string;
  bio?: string;
  instagramUrl?: string;
}

const CAMPOS: Array<keyof BarbershopBranding> = ["logoUrl", "coverUrl", "bio", "instagramUrl"];

export function parseBranding(settings: unknown): BarbershopBranding {
  if (!settings || typeof settings !== "object") return {};

  const resultado: BarbershopBranding = {};
  for (const campo of CAMPOS) {
    const valor = (settings as Record<string, unknown>)[campo];
    if (typeof valor === "string" && valor.trim()) {
      resultado[campo] = valor.trim();
    }
  }
  return resultado;
}

/// Mescla a marca nova por cima do `settings` já salvo, preservando chaves que
/// esta tela não conhece (nada usa isso ainda, mas é a diferença entre
/// "atualizar" e "apagar o resto do settings sem querer").
export function mergeBranding(existing: unknown, branding: BarbershopBranding): Record<string, unknown> {
  const base = existing && typeof existing === "object" ? { ...(existing as Record<string, unknown>) } : {};
  for (const campo of CAMPOS) {
    if (branding[campo]) {
      base[campo] = branding[campo];
    } else {
      delete base[campo];
    }
  }
  return base;
}
