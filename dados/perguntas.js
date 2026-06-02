// dados/perguntas.js — Banco de perguntas da intervenção por níveis (PT / EN / ES)

const _PERGUNTAS = {
  pt: {
    leve: [
      { id: "l1", texto: "Se alguém pudesse ver seus pensamentos agora, o que perceberia?", opcoes: ["Cansaço", "Pressão", "Carência", "Agitação", "Não sei"] },
      { id: "l2", texto: "O que seu corpo está pedindo neste momento?", opcoes: ["Descanso", "Movimento", "Comida", "Companhia", "Silêncio"] },
      { id: "l3", texto: "Você está tentando buscar prazer ou fugir de algo?", opcoes: ["Prazer", "Fuga", "Os dois", "Não sei", "Nenhum"] },
      { id: "l4", texto: "Como está sua energia agora?", opcoes: ["Muito baixa", "Baixa", "Média", "Alta", "Muito alta"] },
      { id: "l5", texto: "Qual palavra descreve melhor este momento?", opcoes: ["Vazio", "Ansiedade", "Impulso", "Tensão", "Confusão"] },
      { id: "l6", texto: "O que você estava fazendo antes desse impulso aparecer?", opcoes: ["Trabalhando", "Descansando", "Navegando", "Pensando", "Não sei"] },
      { id: "l7", texto: "Seu corpo parece mais acelerado ou mais cansado?", opcoes: ["Muito acelerado", "Um pouco acelerado", "Normal", "Cansado", "Exausto"] },
      { id: "l8", texto: "Se pudesse resolver uma coisa da sua vida hoje, qual seria?", opcoes: ["Dinheiro", "Relacionamento", "Trabalho", "Saúde", "Outra"] },
      { id: "l9", texto: "Você está buscando distração ou conexão?", opcoes: ["Distração", "Conexão", "Os dois", "Nenhum", "Não sei"] },
      { id: "l10", texto: "Como você se tratou hoje?", opcoes: ["Com carinho", "Com respeito", "No automático", "Com cobrança", "Mal"] }
    ],
    moderado: [
      { id: "m1", texto: "O que aconteceu hoje que ainda está ocupando sua mente?", opcoes: ["Trabalho", "Relacionamento", "Dinheiro", "Família", "Outra coisa"] },
      { id: "m2", texto: "Se esse impulso falasse, o que ele diria?", opcoes: ["Você merece", "Só hoje", "Ninguém vai saber", "Vai passar", "Outra coisa"] },
      { id: "m3", texto: "Existe alguma necessidade sua que ficou sem atenção hoje?", opcoes: ["Afeto", "Descanso", "Diversão", "Reconhecimento", "Conexão"] },
      { id: "m4", texto: "Você está tentando preencher qual sensação?", opcoes: ["Solidão", "Frustração", "Insegurança", "Tédio", "Vazio"] },
      { id: "m5", texto: "O que você mais precisa ouvir agora?", opcoes: ["Coragem", "Calma", "Esperança", "Apoio", "Verdade"] },
      { id: "m6", texto: "O que você espera sentir se seguir esse impulso?", opcoes: ["Alívio", "Prazer", "Esquecimento", "Conforto", "Não sei"] },
      { id: "m7", texto: "O que está mais difícil hoje?", opcoes: ["Solidão", "Pressão", "Insegurança", "Cansaço", "Ansiedade"] },
      { id: "m8", texto: "Você está evitando pensar em alguma coisa?", opcoes: ["Sim", "Talvez", "Não sei", "Não", "Prefiro não responder"] },
      { id: "m9", texto: "Se alguém que você admira estivesse ao seu lado agora, o que diria?", opcoes: ["Aguente firme", "Respire", "Saia daí", "Você consegue", "Não sei"] },
      { id: "m10", texto: "O que está precisando de atenção neste momento?", opcoes: ["Corpo", "Emoções", "Descanso", "Relacionamentos", "Mente"] }
    ],
    critico: [
      { id: "c1", texto: "Daqui a uma hora, qual decisão faria você sentir orgulho?", opcoes: ["Resistir", "Pedir ajuda", "Caminhar", "Descansar", "Desconectar"] },
      { id: "c2", texto: "Isso realmente resolve o que você está sentindo?", opcoes: ["Sim", "Não", "Só por minutos", "Não sei", "Talvez"] },
      { id: "c3", texto: "O que seu 'eu de amanhã' diria para você agora?", opcoes: ["Aguente firme", "Saia daí", "Respire", "Procure alguém", "Continue"] },
      { id: "c4", texto: "Quem seria impactado positivamente pela decisão certa agora?", opcoes: ["Eu mesmo", "Parceiro(a)", "Família", "Amigos", "Futuro eu"] },
      { id: "c5", texto: "Se este impulso passar sem ação, o que sobra?", opcoes: ["Alívio", "Orgulho", "Paz", "Força", "Liberdade"] },
      { id: "c6", texto: "Daqui a 30 minutos, qual decisão faria você se sentir mais leve?", opcoes: ["Resistir", "Pedir ajuda", "Caminhar", "Respirar", "Desconectar"] },
      { id: "c7", texto: "O que você está arriscando perder neste momento?", opcoes: ["Confiança", "Paz", "Progresso", "Energia", "Tempo"] },
      { id: "c8", texto: "Quem você quer ser quando isso passar?", opcoes: ["Mais forte", "Mais livre", "Mais calmo", "Mais presente", "Mais consciente"] },
      { id: "c9", texto: "O que você realmente precisa agora?", opcoes: ["Apoio", "Descanso", "Movimento", "Clareza", "Carinho"] },
      { id: "c10", texto: "Se você esperar apenas mais 10 minutos, o que pode mudar?", opcoes: ["O impulso", "Meu humor", "Minha clareza", "Minha decisão", "Não sei"] }
    ]
  },
  en: {
    leve: [
      { id: "l1", texto: "If someone could see your thoughts right now, what would they notice?", opcoes: ["Fatigue", "Pressure", "Loneliness", "Restlessness", "Don't know"] },
      { id: "l2", texto: "What is your body asking for at this moment?", opcoes: ["Rest", "Movement", "Food", "Company", "Silence"] },
      { id: "l3", texto: "Are you trying to seek pleasure or run away from something?", opcoes: ["Pleasure", "Escape", "Both", "Don't know", "Neither"] },
      { id: "l4", texto: "How is your energy right now?", opcoes: ["Very low", "Low", "Medium", "High", "Very high"] },
      { id: "l5", texto: "Which word best describes this moment?", opcoes: ["Emptiness", "Anxiety", "Urge", "Tension", "Confusion"] },
      { id: "l6", texto: "What were you doing before this urge appeared?", opcoes: ["Working", "Resting", "Browsing", "Thinking", "Don't know"] },
      { id: "l7", texto: "Does your body feel more speeded up or more tired?", opcoes: ["Very speeded up", "Slightly speeded up", "Normal", "Tired", "Exhausted"] },
      { id: "l8", texto: "If you could solve one thing in your life today, what would it be?", opcoes: ["Money", "Relationship", "Work", "Health", "Other"] },
      { id: "l9", texto: "Are you looking for distraction or connection?", opcoes: ["Distraction", "Connection", "Both", "Neither", "Don't know"] },
      { id: "l10", texto: "How did you treat yourself today?", opcoes: ["With care", "With respect", "On autopilot", "With pressure", "Poorly"] }
    ],
    moderado: [
      { id: "m1", texto: "What happened today that is still occupying your mind?", opcoes: ["Work", "Relationship", "Money", "Family", "Something else"] },
      { id: "m2", texto: "If this urge could speak, what would it say?", opcoes: ["You deserve it", "Just today", "No one will know", "It will pass", "Something else"] },
      { id: "m3", texto: "Is there any need of yours that went ignored today?", opcoes: ["Affection", "Rest", "Fun", "Recognition", "Connection"] },
      { id: "m4", texto: "What feeling are you trying to fill?", opcoes: ["Loneliness", "Frustration", "Insecurity", "Boredom", "Emptiness"] },
      { id: "m5", texto: "What do you need to hear the most right now?", opcoes: ["Courage", "Calm", "Hope", "Support", "Truth"] },
      { id: "m6", texto: "What do you expect to feel if you follow this urge?", opcoes: ["Relief", "Pleasure", "Forgetting", "Comfort", "Don't know"] },
      { id: "m7", texto: "What is hardest today?", opcoes: ["Loneliness", "Pressure", "Insecurity", "Fatigue", "Anxiety"] },
      { id: "m8", texto: "Are you avoiding thinking about something?", opcoes: ["Yes", "Maybe", "Don't know", "No", "Prefer not to say"] },
      { id: "m9", texto: "If someone you admire were next to you right now, what would they say?", opcoes: ["Hold on", "Breathe", "Get out of there", "You can do it", "Don't know"] },
      { id: "m10", texto: "What is needing attention at this moment?", opcoes: ["Body", "Emotions", "Rest", "Relationships", "Mind"] }
    ],
    critico: [
      { id: "c1", texto: "An hour from now, which decision would make you feel proud?", opcoes: ["Resist", "Ask for help", "Walk", "Rest", "Disconnect"] },
      { id: "c2", texto: "Does this really solve what you are feeling?", opcoes: ["Yes", "No", "Only for minutes", "Don't know", "Maybe"] },
      { id: "c3", texto: "What would your 'tomorrow self' say to you right now?", opcoes: ["Hold on", "Get out of there", "Breathe", "Find someone", "Continue"] },
      { id: "c4", texto: "Who would be positively impacted by the right decision right now?", opcoes: ["Myself", "Partner", "Family", "Friends", "Future self"] },
      { id: "c5", texto: "If this urge passes without action, what is left?", opcoes: ["Relief", "Pride", "Peace", "Strength", "Freedom"] },
      { id: "c6", texto: "30 minutes from now, which decision would make you feel lighter?", opcoes: ["Resist", "Ask for help", "Walk", "Breathe", "Disconnect"] },
      { id: "c7", texto: "What are you risking losing at this moment?", opcoes: ["Trust", "Peace", "Progress", "Energy", "Time"] },
      { id: "c8", texto: "Who do you want to be when this passes?", opcoes: ["Stronger", "Freer", "Calmer", "More present", "More mindful"] },
      { id: "c9", texto: "What do you really need right now?", opcoes: ["Support", "Rest", "Movement", "Clareza", "Care"] },
      { id: "c10", texto: "If you wait just 10 more minutes, what can change?", opcoes: ["The urge", "My mood", "My clarity", "My decision", "Don't know"] }
    ]
  },
  es: {
    leve: [
      { id: "l1", texto: "Si alguien pudiera ver tus pensamientos ahora, ¿qué notaría?", opcoes: ["Cansancio", "Presión", "Carencia", "Agitación", "No lo sé"] },
      { id: "l2", texto: "¿Qué está pidiendo tu cuerpo en este momento?", opcoes: ["Descanso", "Movimiento", "Comida", "Compañía", "Silencio"] },
      { id: "l3", texto: "¿Estás intentando buscar placer o huir de algo?", opcoes: ["Placer", "Fuga", "Ambos", "No lo sé", "Ninguno"] },
      { id: "l4", texto: "¿Cómo está tu energía ahora?", opcoes: ["Muy baja", "Baja", "Media", "Alta", "Muy alta"] },
      { id: "l5", texto: "¿Qué palabra describe mejor este momento?", opcoes: ["Vacío", "Ansiedad", "Impulso", "Tensión", "Confusión"] },
      { id: "l6", texto: "¿Qué estabas haciendo antes de que apareciera este impulso?", opcoes: ["Trabajando", "Descansando", "Navegando", "Pensando", "No lo sé"] },
      { id: "l7", texto: "¿Tu cuerpo se siente más acelerado o más cansado?", opcoes: ["Muy acelerado", "Un poco acelerado", "Normal", "Cansado", "Agotado"] },
      { id: "l8", texto: "Si pudieras resolver una cosa en tu vida hoy, ¿cuál sería?", opcoes: ["Dinero", "Relación", "Trabajo", "Salud", "Otra"] },
      { id: "l9", texto: "¿Estás buscando distracción o conexión?", opcoes: ["Distracción", "Conexión", "Ambos", "Ninguno", "No lo sé"] },
      { id: "l10", texto: "¿Cómo te trataste hoy?", opcoes: ["Con cariño", "Con respeto", "En automático", "Con exigencia", "Mal"] }
    ],
    moderado: [
      { id: "m1", texto: "¿Qué pasó hoy que todavía ocupa tu mente?", opcoes: ["Trabajo", "Relación", "Dinero", "Familia", "Otra cosa"] },
      { id: "m2", texto: "Si este impulso hablara, ¿qué diría?", opcoes: ["Te lo mereces", "Solo hoy", "Nadie lo sabrá", "Pasará", "Otra cosa"] },
      { id: "m3", texto: "¿Hay alguna necesidad tuya que quedó desatendida hoy?", opcoes: ["Afecto", "Descanso", "Diversión", "Reconocimiento", "Conexión"] },
      { id: "m4", texto: "¿Qué sensación estás intentando llenar?", opcoes: ["Soledad", "Frustración", "Inseguridad", "Aburrimiento", "Vacío"] },
      { id: "m5", texto: "¿Qué es lo que más necesitas escuchar ahora?", opcoes: ["Coraje", "Calma", "Esperanza", "Apoyo", "Verdad"] },
      { id: "m6", texto: "¿Qué esperas sentir si sigues este impulso?", opcoes: ["Alivio", "Placer", "Olvido", "Confort", "No lo sé"] },
      { id: "m7", texto: "¿Qué está siendo lo más difícil hoy?", opcoes: ["Soledad", "Presión", "Inseguridad", "Cansancio", "Ansiedad"] },
      { id: "m8", texto: "¿Estás evitando pensar en algo?", opcoes: ["Sí", "Tal vez", "No lo sé", "No", "Prefiero no responder"] },
      { id: "m9", texto: "Si alguien a quien admiras estuviera a tu lado ahora, ¿qué te diría?", opcoes: ["Resiste", "Respira", "Sal de ahí", "Tú puedes", "No lo sé"] },
      { id: "m10", texto: "¿Qué está necesitando atención en este momento?", opcoes: ["Cuerpo", "Emociones", "Descanso", "Relaciones", "Mente"] }
    ],
    critico: [
      { id: "c1", texto: "Dentro de una hora, ¿qué decisión te haría sentir orgulloso?", opcoes: ["Resistir", "Pedir ayuda", "Caminar", "Descansar", "Desconectar"] },
      { id: "c2", texto: "¿Esto realmente resuelve lo que estás sintiendo?", opcoes: ["Sí", "No", "Solo por minutos", "No lo sé", "Tal vez"] },
      { id: "c3", texto: "¿Qué te diría tu 'yo de mañana' justo ahora?", opcoes: ["Resiste", "Sal de ahí", "Respira", "Busca a alguien", "Continúa"] },
      { id: "c4", texto: "¿Quién se vería afectado positivamente por la decisión correcta ahora?", opcoes: ["Yo mismo", "Pareja", "Familia", "Amigos", "Mi yo futuro"] },
      { id: "c5", texto: "Si este impulso pasa sin acción, ¿qué queda?", opcoes: ["Alivio", "Orgullo", "Paz", "Fuerza", "Libertad"] },
      { id: "c6", texto: "Dentro de 30 minutos, ¿qué decisión te haría sentir más ligero?", opcoes: ["Resistir", "Pedir ayuda", "Caminar", "Respirar", "Desconectar"] },
      { id: "c7", texto: "¿Qué estás arriesgando perder en este momento?", opcoes: ["Confianza", "Paz", "Progreso", "Energía", "Tiempo"] },
      { id: "c8", texto: "¿Quién quieres ser cuando esto pase?", opcoes: ["Más fuerte", "Más libre", "Más tranquilo", "Más presente", "Más consciente"] },
      { id: "c9", texto: "¿Qué necesitas realmente ahora?", opcoes: ["Apoyo", "Descanso", "Movimiento", "Claridad", "Cariño"] },
      { id: "c10", texto: "Si esperas solo 10 minutos más, ¿qué puede cambiar?", opcoes: ["El impulso", "Mi humor", "Mi claridad", "Mi decisión", "No lo sé"] }
    ]
  }
};

function getPERGUNTAS() {
  const lang = window.lumoI18n?.idioma || 'pt';
  return _PERGUNTAS[lang] || _PERGUNTAS.pt;
}
