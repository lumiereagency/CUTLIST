import { IosInstallGuide } from "@/components/ios-install-guide";

// Layout comum às páginas públicas (/b/{slug}, /a/{token}, /vaga/{token}) —
// hoje só existe pra dar um lugar único pro guia de instalação do iOS, sem
// repetir em cada página. O guia decide sozinho, no cliente, se e quando
// aparece (ver ios-install-guide.tsx); aqui não sabemos o país da loja ainda
// (cada página busca o próprio shop), então o idioma vem do navegador da
// pessoa, não do country — aceitável para um elemento auxiliar como este,
// diferente do fluxo de agendamento em si (que segue sempre o country).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <IosInstallGuide />
    </>
  );
}
