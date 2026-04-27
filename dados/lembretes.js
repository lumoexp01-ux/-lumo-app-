// dados/lembretes.js — Banco de lembretes da intervenção

const LEMBRETES = [
  {
    id: 1,
    template: "{nome}, essa é sua {recaidas}ª tentativa. Cada uma te deixa mais forte.",
    tipo: "progresso"
  },
  {
    id: 2,
    template: "Você é {nivel}. {dias} dias de jornada. Isso é real.",
    tipo: "identidade"
  },
  {
    id: 3,
    template: "Você não está sozinho. Milhares estão na mesma luta agora.",
    tipo: "comunidade"
  },
  {
    id: 4,
    template: "Lembra por que você começou? Seu eu do futuro agradece.",
    tipo: "motivacao"
  },
  {
    id: 5,
    template: "O impulso dura em média 15 minutos. Você só precisa vencer agora.",
    tipo: "ciencia"
  },
  {
    id: 6,
    template: "Amanhã você vai agradecer a decisão que tomar agora.",
    tipo: "futuro"
  },
  {
    id: 7,
    template: "Cada vez que você vence um impulso, seu cérebro se reconecta.",
    tipo: "ciencia"
  },
  {
    id: 8,
    template: "{nome}, {dias} dias atrás você decidiu mudar. Honre essa decisão.",
    tipo: "identidade"
  }
];

// Lembrete especial — usado no primeiro ciclo se o usuário tem Carta do Futuro
const LEMBRETE_CARTA = {
  id: 99,
  template: "Você escreveu isso quando estava bem:\n\n\"{carta}\"\n\n— Você mesmo, em {dataCarta}",
  tipo: "carta"
};
