// dados/perguntas.js — Banco de perguntas da intervenção (PT / EN / ES)

const _PERGUNTAS = {
  pt: [
    { id: 1, texto: "O que você está sentindo agora?",
      opcoes: ["Ansiedade", "Tédio", "Solidão", "Estresse", "Tristeza", "Raiva"] },
    { id: 2, texto: "O que provocou isso?",
      opcoes: ["Rede social", "Vídeo", "Pensamento", "Lugar", "Horário", "Conversa"] },
    { id: 3, texto: "Onde você está agora?",
      opcoes: ["Quarto", "Banheiro", "Trabalho", "Transporte", "Sala", "Outro"] },
    { id: 4, texto: "Há quanto tempo está sentindo isso?",
      opcoes: ["Agora mesmo", "Alguns minutos", "Mais de 1 hora"] },
    { id: 5, texto: "Alguém está perto de você?",
      opcoes: ["Estou sozinho", "Tem gente perto", "Estou com alguém"] },
    { id: 6, texto: "Você dormiu bem?",
      opcoes: ["Sim", "Mais ou menos", "Mal", "Não dormi"] },
    { id: 7, texto: "Você comeu algo nas últimas horas?",
      opcoes: ["Sim", "Não lembro", "Não"] },
  ],
  en: [
    { id: 1, texto: "What are you feeling right now?",
      opcoes: ["Anxiety", "Boredom", "Loneliness", "Stress", "Sadness", "Anger"] },
    { id: 2, texto: "What triggered this?",
      opcoes: ["Social media", "Video", "Thought", "Place", "Time of day", "Conversation"] },
    { id: 3, texto: "Where are you right now?",
      opcoes: ["Bedroom", "Bathroom", "Work", "Transit", "Living room", "Other"] },
    { id: 4, texto: "How long have you been feeling this?",
      opcoes: ["Just now", "A few minutes", "More than 1 hour"] },
    { id: 5, texto: "Is anyone near you?",
      opcoes: ["I'm alone", "People nearby", "I'm with someone"] },
    { id: 6, texto: "Did you sleep well?",
      opcoes: ["Yes", "Sort of", "Poorly", "I didn't sleep"] },
    { id: 7, texto: "Have you eaten in the last few hours?",
      opcoes: ["Yes", "I don't remember", "No"] },
  ],
  es: [
    { id: 1, texto: "¿Qué estás sintiendo ahora?",
      opcoes: ["Ansiedad", "Aburrimiento", "Soledad", "Estrés", "Tristeza", "Rabia"] },
    { id: 2, texto: "¿Qué lo provocó?",
      opcoes: ["Red social", "Video", "Pensamiento", "Lugar", "Horario", "Conversación"] },
    { id: 3, texto: "¿Dónde estás ahora?",
      opcoes: ["Habitación", "Baño", "Trabajo", "Transporte", "Sala", "Otro"] },
    { id: 4, texto: "¿Hace cuánto tiempo sientes esto?",
      opcoes: ["Ahora mismo", "Unos minutos", "Más de 1 hora"] },
    { id: 5, texto: "¿Hay alguien cerca de ti?",
      opcoes: ["Estoy solo", "Hay gente cerca", "Estoy con alguien"] },
    { id: 6, texto: "¿Dormiste bien?",
      opcoes: ["Sí", "Más o menos", "Mal", "No dormí"] },
    { id: 7, texto: "¿Comiste algo en las últimas horas?",
      opcoes: ["Sí", "No recuerdo", "No"] },
  ],
};

function getPERGUNTAS() {
  const lang = window.lumoI18n?.idioma || 'pt';
  return _PERGUNTAS[lang] || _PERGUNTAS.pt;
}
