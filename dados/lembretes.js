// dados/lembretes.js — Banco de lembretes da intervenção (PT / EN / ES)

const _LEMBRETES = {
  pt: [
    { id: 1, template: "{nome}, essa é sua {recaidas}ª tentativa. Cada uma te deixa mais forte.", tipo: "progresso" },
    { id: 2, template: "Você é {nivel}. {dias} dias de jornada. Isso é real.", tipo: "identidade" },
    { id: 3, template: "Você não está sozinho. Milhares estão na mesma luta agora.", tipo: "comunidade" },
    { id: 4, template: "Lembra por que você começou? Seu eu do futuro agradece.", tipo: "motivacao" },
    { id: 5, template: "O impulso dura em média 15 minutos. Você só precisa vencer agora.", tipo: "ciencia" },
    { id: 6, template: "Amanhã você vai agradecer a decisão que tomar agora.", tipo: "futuro" },
    { id: 7, template: "Cada vez que você vence um impulso, seu cérebro se reconecta.", tipo: "ciencia" },
    { id: 8, template: "{nome}, {dias} dias atrás você decidiu mudar. Honre essa decisão.", tipo: "identidade" },
  ],
  en: [
    { id: 1, template: "{nome}, this is your {recaidas}th attempt. Each one makes you stronger.", tipo: "progresso" },
    { id: 2, template: "You are {nivel}. {dias} days on your journey. That's real.", tipo: "identidade" },
    { id: 3, template: "You're not alone. Thousands are fighting the same battle right now.", tipo: "comunidade" },
    { id: 4, template: "Remember why you started? Your future self is grateful.", tipo: "motivacao" },
    { id: 5, template: "Urges last an average of 15 minutes. You just need to win right now.", tipo: "ciencia" },
    { id: 6, template: "Tomorrow you'll be grateful for the choice you make right now.", tipo: "futuro" },
    { id: 7, template: "Every time you overcome an urge, your brain rewires itself.", tipo: "ciencia" },
    { id: 8, template: "{nome}, {dias} days ago you decided to change. Honor that decision.", tipo: "identidade" },
  ],
  es: [
    { id: 1, template: "{nome}, este es tu {recaidas}º intento. Cada uno te hace más fuerte.", tipo: "progresso" },
    { id: 2, template: "Eres {nivel}. {dias} días de jornada. Eso es real.", tipo: "identidade" },
    { id: 3, template: "No estás solo. Miles están en la misma lucha ahora mismo.", tipo: "comunidade" },
    { id: 4, template: "¿Recuerdas por qué empezaste? Tu yo del futuro te lo agradece.", tipo: "motivacao" },
    { id: 5, template: "El impulso dura en promedio 15 minutos. Solo necesitas ganar ahora.", tipo: "ciencia" },
    { id: 6, template: "Mañana agradecerás la decisión que tomes ahora.", tipo: "futuro" },
    { id: 7, template: "Cada vez que vences un impulso, tu cerebro se reconecta.", tipo: "ciencia" },
    { id: 8, template: "{nome}, hace {dias} días decidiste cambiar. Honra esa decisión.", tipo: "identidade" },
  ],
};

const _LEMBRETE_CARTA = {
  pt: { id: 99, template: "Você escreveu isso quando estava bem:\n\n\"{carta}\"\n\n— Você mesmo, em {dataCarta}", tipo: "carta" },
  en: { id: 99, template: "You wrote this when you were doing well:\n\n\"{carta}\"\n\n— You, on {dataCarta}", tipo: "carta" },
  es: { id: 99, template: "Escribiste esto cuando estabas bien:\n\n\"{carta}\"\n\n— Tú, el {dataCarta}", tipo: "carta" },
};

function getLEMBRETES() {
  const lang = window.lumoI18n?.idioma || 'pt';
  return _LEMBRETES[lang] || _LEMBRETES.pt;
}

function getLEMBRETECARTA() {
  const lang = window.lumoI18n?.idioma || 'pt';
  return { ...(_LEMBRETE_CARTA[lang] || _LEMBRETE_CARTA.pt) };
}
