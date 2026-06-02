// dados/lembretes.js — Banco de lembretes da intervenção por níveis (PT / EN / ES)

const _LEMBRETES = {
  pt: {
    leve: [
      { id: "ll1", template: "{nome}, você não precisa obedecer tudo o que sente." },
      { id: "ll2", template: "Nem todo impulso merece uma resposta." },
      { id: "ll3", template: "Seu cérebro está procurando recompensa. Você pode escolher outra direção." },
      { id: "ll4", template: "{dias} dias não foram construídos por acaso." },
      { id: "ll5", template: "A vontade é forte. Sua capacidade de escolha também." },
      { id: "ll6", template: "{nome}, você não precisa resolver sua vida inteira agora." },
      { id: "ll7", template: "Às vezes o que parece desejo é apenas cansaço usando outra roupa." },
      { id: "ll8", template: "Você já atravessou momentos parecidos antes." },
      { id: "ll9", template: "{dias} dias foram construídos decisão por decisão." },
      { id: "ll10", template: "Nem todo pensamento merece virar ação." }
    ],
    moderado: [
      { id: "ml1", template: "O que parece urgente agora provavelmente será pequeno amanhã." },
      { id: "ml2", template: "{nome}, o desconforto que você sente é temporário. A decisão que você toma não." },
      { id: "ml3", template: "Cada minuto que passa fortalece circuitos diferentes dentro de você." },
      { id: "ml4", template: "Seu cérebro aprende com repetição. Hoje é mais uma repetição da pessoa que você quer ser." },
      { id: "ml5", template: "Você não está lutando contra si mesmo. Está treinando uma nova versão de si." },
      { id: "ml6", template: "O impulso promete alívio imediato. Nem sempre entrega o que promete." },
      { id: "ml7", template: "{nome}, você não está preso. Ainda está escolhendo." },
      { id: "ml8", template: "Seu cérebro está seguindo um caminho conhecido. Você pode mostrar outro caminho." },
      { id: "ml9", template: "A vontade aumenta, atinge um pico e depois diminui. Ela não cresce para sempre." },
      { id: "ml10", template: "Você não precisa acreditar em tudo que sua mente diz quando está cansada." }
    ],
    critico: [
      { id: "cl1", template: "{nome}, espere apenas mais 10 minutos. Não decida nada agora." },
      { id: "cl2", template: "O impulso quer velocidade. A recuperação cresce na pausa." },
      { id: "cl3", template: "Seu cérebro lembra do prazer imediato. Você lembra do resultado completo." },
      { id: "cl4", template: "{nivel} não é apenas um título. É a prova das decisões que você já tomou." },
      { id: "cl5", template: "Neste exato momento, sua vitória não depende de força. Depende de alguns minutos." },
      { id: "cl6", template: "{nome}, você não precisa vencer hoje inteiro. Só este momento." },
      { id: "cl7", template: "A intensidade que você sente agora não é permanente." },
      { id: "cl8", template: "Seu cérebro está pedindo um caminho antigo. Isso não significa que você precisa seguir por ele." },
      { id: "cl9", template: "Alguns minutos de coragem podem mudar como você vai se sentir pelo resto do dia." },
      { id: "cl10", template: "Você já chegou até aqui. Continue por mais alguns minutos." }
    ]
  },
  en: {
    leve: [
      { id: "ll1", template: "{nome}, you don't have to obey everything you feel." },
      { id: "ll2", template: "Not every urge deserves a response." },
      { id: "ll3", template: "Your brain is looking for a reward. You can choose another direction." },
      { id: "ll4", template: "{dias} days were not built by chance." },
      { id: "ll5", template: "The will is strong. Your capacity to choose is too." },
      { id: "ll6", template: "{nome}, you don't have to solve your whole life right now." },
      { id: "ll7", template: "Sometimes what seems like desire is just fatigue wearing different clothes." },
      { id: "ll8", template: "You have crossed similar moments before." },
      { id: "ll9", template: "{dias} days were built decision by decision." },
      { id: "ll10", template: "Not every thought deserves to become an action." }
    ],
    moderado: [
      { id: "ml1", template: "What seems urgent now will probably be small tomorrow." },
      { id: "ml2", template: "{nome}, the discomfort you feel is temporary. The decision you make is not." },
      { id: "ml3", template: "Every minute that passes strengthens different circuits inside you." },
      { id: "ml4", template: "Your brain learns by repetition. Today is one more repetition of the person you want to be." },
      { id: "ml5", template: "You are not fighting yourself. You are training a new version of yourself." },
      { id: "ml6", template: "The urge promises immediate relief. It doesn't always deliver what it promises." },
      { id: "ml7", template: "{nome}, you are not trapped. You are still choosing." },
      { id: "ml8", template: "Your brain is following a familiar path. You can show it another way." },
      { id: "ml9", template: "The urge increases, reaches a peak, and then decreases. It doesn't grow forever." },
      { id: "ml10", template: "You don't need to believe everything your mind says when it is tired." }
    ],
    critico: [
      { id: "cl1", template: "{nome}, wait just 10 more minutes. Do not decide anything now." },
      { id: "cl2", template: "The urge wants speed. Recovery grows in the pause." },
      { id: "cl3", template: "Your brain remembers the immediate pleasure. You remember the complete result." },
      { id: "cl4", template: "{nivel} is not just a title. It is proof of the decisions you have already made." },
      { id: "cl5", template: "At this exact moment, your victory doesn't depend on strength. It depends on a few minutes." },
      { id: "cl6", template: "{nome}, you don't need to win the whole day. Just this moment." },
      { id: "cl7", template: "The intensity you feel right now is not permanent." },
      { id: "cl8", template: "Your brain is asking for an old path. That doesn't mean you need to follow it." },
      { id: "cl9", template: "A few minutes of courage can change how you will feel for the rest of the day." },
      { id: "cl10", template: "You have made it this far. Keep going for a few more minutes." }
    ]
  },
  es: {
    leve: [
      { id: "ll1", template: "{nome}, no tienes que obedecer todo lo que sientes." },
      { id: "ll2", template: "No todo impulso merece una respuesta." },
      { id: "ll3", template: "Tu cerebro está buscando una recompensa. Puedes elegir otra dirección." },
      { id: "ll4", template: "{dias} días no se construyeron por casualidad." },
      { id: "ll5", template: "La voluntad es fuerte. Tu capacidad de elección también." },
      { id: "ll6", template: "{nome}, no tienes que resolver toda tu vida ahora mismo." },
      { id: "ll7", template: "A veces lo que parece deseo es solo cansancio usando otra ropa." },
      { id: "ll8", template: "Ya has cruzado momentos similares antes." },
      { id: "ll9", template: "{dias} días se construyeron decisión por decisión." },
      { id: "ll10", template: "No todo pensamiento merece convertirse en acción." }
    ],
    moderado: [
      { id: "ml1", template: "Lo que parece urgente ahora probablemente será pequeño mañana." },
      { id: "ml2", template: "{nome}, la incomodidad que sientes es temporal. La decisión que tomas no lo es." },
      { id: "ml3", template: "Cada minuto que pasa fortalece circuitos diferentes dentro de ti." },
      { id: "ml4", template: "Tu cerebro aprende con la repetición. Hoy es una repetición más de la persona que quieres ser." },
      { id: "ml5", template: "No estás luchando contra ti mismo. Estás entrenando una nueva versión de ti." },
      { id: "ml6", template: "El impulso promete alivio inmediato. No siempre cumple lo que promete." },
      { id: "ml7", template: "{nome}, no estás atrapado. Todavía estás eligiendo." },
      { id: "ml8", template: "Tu cerebro está siguiendo un camino conocido. Puedes mostrarle otro camino." },
      { id: "ml9", template: "La voluntad aumenta, alcanza un pico y luego disminuye. No crece para siempre." },
      { id: "ml10", template: "No necesitas creer en todo lo que tu mente dice cuando está cansada." }
    ],
    critico: [
      { id: "cl1", template: "{nome}, espera solo 10 minutos más. No decidas nada ahora." },
      { id: "cl2", template: "El impulso quiere velocidad. La recuperación crece en la pausa." },
      { id: "cl3", template: "Tu cerebro recuerda el placer inmediato. Tú recuerdas el resultado completo." },
      { id: "cl4", template: "{nivel} no es solo un título. Es la prueba de las decisiones que ya has tomado." },
      { id: "cl5", template: "En este preciso momento, tu victoria no depende de la fuerza. Depende de unos minutos." },
      { id: "cl6", template: "{nome}, no necesitas vencer todo el día hoy. Solo este momento." },
      { id: "cl7", template: "La intensidad que sientes ahora no es permanente." },
      { id: "cl8", template: "Tu cerebro está pidiendo un camino antiguo. Eso no significa que tengas que seguirlo." },
      { id: "cl9", template: "Unos minutos de coraje pueden cambiar cómo te sentirás por el resto del día." },
      { id: "cl10", template: "Ya has llegado hasta aquí. Continúa por unos minutos más." }
    ]
  }
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
