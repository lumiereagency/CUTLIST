// Textos da landing institucional (apps/web/app/page.tsx).
//
// Escopo deliberadamente separado de booking-i18n.ts: aquele traduz a
// jornada de uma barbearia já cadastrada (decidido pelo `country` dela);
// este traduz a página de marketing e o funil de cadastro, que ainda não
// têm barbearia nenhuma — o visitante escolhe o idioma na hora (toggle
// ?lang=es), não o sistema.

export type LandingLocale = "pt" | "es";

export function landingLocaleFromParam(lang: string | string[] | undefined): LandingLocale {
  return lang === "es" ? "es" : "pt";
}

interface LandingStrings {
  nav: { signIn: string; signUp: string };
  hero: {
    badge: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    note: string;
  };
  features: {
    heading: string;
    items: { title: string; description: string }[];
  };
  steps: {
    heading: string;
    items: { title: string; description: string }[];
  };
  closingCta: {
    title: string;
    subtitle: string;
    bullets: string[];
    button: string;
  };
  footer: { signIn: string };
}

const PT: LandingStrings = {
  nav: { signIn: "Entrar", signUp: "Criar conta" },
  hero: {
    badge: "Feito para negócios de agenda cheia que querem crescer sem bagunça",
    titleBefore: "O sistema completo pra seu negócio parar de ",
    titleHighlight: "perder cliente",
    titleAfter: " no WhatsApp.",
    subtitle:
      "Agendamento online, agenda da equipe, cadastro automático de clientes e recuperação de horário cancelado — tudo em um só lugar, com sua própria página.",
    ctaPrimary: "Testar grátis agora",
    ctaSecondary: "Já tenho conta",
    note: "Sem cartão de crédito. Teste completo do plano Pro.",
  },
  features: {
    heading: "Tudo o que você precisa, em um só lugar",
    items: [
      {
        title: "Página de agendamento própria",
        description: "Seu cliente marca o horário sozinho, a qualquer hora, pelo link do seu negócio.",
      },
      {
        title: "Agenda da equipe",
        description: "Todo mundo vê os horários do dia num só lugar, sem grupo de WhatsApp nem caderno.",
      },
      {
        title: "Clientes, no automático",
        description: "O histórico de cada cliente se monta sozinho a cada agendamento — sem planilha.",
      },
      {
        title: "Agenda Inteligente",
        description: "Cancelou um horário? O sistema já avisa quem tem mais chance de aceitar aquela vaga.",
      },
      {
        title: "Relatórios",
        description: "Faturamento, serviços mais vendidos e desempenho da equipe, direto no painel.",
      },
      {
        title: "Equipe com permissão certa",
        description: "O profissional vê a própria agenda; o dono vê tudo. Cada um enxerga só o que precisa.",
      },
    ],
  },
  steps: {
    heading: "Como funciona",
    items: [
      { title: "Cadastre seu negócio", description: "Leva um minuto, sem cartão de crédito." },
      { title: "Configure serviços e equipe", description: "Preço, duração e quem atende cada serviço." },
      { title: "Compartilhe o link", description: "Pronto — seus clientes já podem agendar sozinhos." },
    ],
  },
  closingCta: {
    title: "Comece a receber agendamento online hoje.",
    subtitle: "Período de teste completo, sem compromisso e sem cartão de crédito.",
    bullets: ["Página de agendamento própria", "Agenda da equipe e clientes automáticos", "Suporte durante o teste"],
    button: "Criar meu negócio",
  },
  footer: { signIn: "Entrar no painel" },
};

const ES: LandingStrings = {
  nav: { signIn: "Iniciar sesión", signUp: "Crear cuenta" },
  hero: {
    badge: "Hecho para negocios con agenda llena que quieren crecer sin desorden",
    titleBefore: "El sistema completo para que tu negocio deje de ",
    titleHighlight: "perder clientes",
    titleAfter: " por WhatsApp.",
    subtitle:
      "Reservas online, agenda del equipo, registro automático de clientes y recuperación de turnos cancelados — todo en un solo lugar, con tu propia página.",
    ctaPrimary: "Probar gratis ahora",
    ctaSecondary: "Ya tengo cuenta",
    note: "Sin tarjeta de crédito. Prueba completa del plan Pro.",
  },
  features: {
    heading: "Todo lo que necesitás, en un solo lugar",
    items: [
      {
        title: "Página de reservas propia",
        description: "Tu cliente reserva el turno solo, a cualquier hora, con el link de tu negocio.",
      },
      {
        title: "Agenda del equipo",
        description: "Todos ven los turnos del día en un solo lugar, sin grupo de WhatsApp ni cuaderno.",
      },
      {
        title: "Clientes, en automático",
        description: "El historial de cada cliente se arma solo con cada reserva — sin planilla.",
      },
      {
        title: "Agenda Inteligente",
        description: "¿Se canceló un turno? El sistema ya avisa a quién tiene más chances de aceptar ese lugar.",
      },
      {
        title: "Informes",
        description: "Facturación, servicios más vendidos y desempeño del equipo, directo en el panel.",
      },
      {
        title: "Equipo con el permiso justo",
        description: "El profesional ve su propia agenda; el dueño ve todo. Cada uno ve solo lo que necesita.",
      },
    ],
  },
  steps: {
    heading: "Cómo funciona",
    items: [
      { title: "Registrá tu negocio", description: "Lleva un minuto, sin tarjeta de crédito." },
      { title: "Configurá servicios y equipo", description: "Precio, duración y quién atiende cada servicio." },
      { title: "Compartí el link", description: "Listo — tus clientes ya pueden reservar solos." },
    ],
  },
  closingCta: {
    title: "Empezá a recibir reservas online hoy.",
    subtitle: "Período de prueba completo, sin compromiso y sin tarjeta de crédito.",
    bullets: ["Página de reservas propia", "Agenda del equipo y clientes automáticos", "Soporte durante la prueba"],
    button: "Crear mi negocio",
  },
  footer: { signIn: "Entrar al panel" },
};

export function landingStrings(locale: LandingLocale): LandingStrings {
  return locale === "es" ? ES : PT;
}
