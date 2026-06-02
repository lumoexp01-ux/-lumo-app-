// dados/acoes.js — Banco de ações da intervenção por níveis (PT / EN / ES)

const _ACOES = {
  pt: {
    leve: [
      { id: "la1", texto: "Nomeie 5 objetos que você consegue ver.", ciencia: "Direcionar atenção para o ambiente retira o cérebro do piloto automático e reduz a intensidade do impulso.", retorno: "Quando terminar, volte aqui." },
      { id: "la2", texto: "Alongue braços, costas e pescoço por 2 minutos.", ciencia: "Tensão física e emocional andam juntas. Relaxar o corpo envia sinais de segurança ao sistema nervoso.", retorno: "Quando terminar, volte aqui." },
      { id: "la3", texto: "Conte de 100 até 0 pulando os números pares.", ciencia: "Seu cérebro usa áreas de atenção e raciocínio, enfraquecendo o ciclo automático do impulso.", retorno: "Quando concluir, me avise." },
      { id: "la4", texto: "Organize uma pequena área próxima por 3 minutos.", ciencia: "Uma ação concreta troca a busca por recompensa imediata por uma sensação real de progresso.", retorno: "Quando terminar, volte aqui." },
      { id: "la5", texto: "Respire por 4 segundos e solte por 6 segundos. Repita por 2 minutos.", ciencia: "Expirações mais longas ativam mecanismos naturais de calma e reduzem a urgência emocional.", retorno: "Quando terminar, volte aqui." },
      { id: "la6", texto: "Observe sua respiração por 1 minuto sem tentar mudá-la.", ciencia: "Seu cérebro desacelera quando você volta a notar o que está acontecendo agora em vez de correr atrás do próximo estímulo.", retorno: "Quando terminar, volte aqui." },
      { id: "la7", texto: "Toque em 5 superfícies diferentes ao seu redor.", ciencia: "Texturas diferentes ajudam sua atenção a sair da imaginação e retornar ao mundo real.", retorno: "Quando terminar, volte aqui." },
      { id: "la8", texto: "Beba um copo de água prestando atenção em cada gole.", ciencia: "A atenção consciente interrompe o comportamento automático e cria espaço para escolha.", retorno: "Quando terminar, volte aqui." },
      { id: "la9", texto: "Abra uma janela ou vá até um local com luz natural.", ciencia: "Mudanças no ambiente ajudam o cérebro a sair do padrão mental em que estava preso.", retorno: "Quando chegar lá, volte aqui." },
      { id: "la10", texto: "Caminhe lentamente por 2 minutos observando o ambiente.", ciencia: "Movimento leve reduz a fixação mental e ajuda a recuperar clareza.", retorno: "Quando terminar, volte aqui." }
    ],
    moderado: [
      { id: "ma1", texto: "Faça o exercício dos 5 sentidos: 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia.", ciencia: "Esse exercício ancora a mente no presente e reduz a força dos pensamentos que alimentam o impulso.", retorno: "Quando concluir, volte aqui." },
      { id: "ma2", texto: "Caminhe por 3 minutos sem celular.", ciencia: "Movimento físico altera o estado cerebral e reduz a fixação mental no impulso.", retorno: "Quando terminar, volte aqui." },
      { id: "ma3", texto: "Passe água fria nas mãos por 30 segundos. Sinta cada detalhe.", ciencia: "A mudança de temperatura cria um estímulo físico forte que interrompe o ciclo mental em andamento.", retorno: "Quando terminar, me avise." },
      { id: "ma4", texto: "Recite o alfabeto ao contrário.", ciencia: "Seu cérebro precisa mudar o foco para uma tarefa cognitiva difícil, reduzindo espaço para o impulso crescer.", retorno: "Quando concluir, volte aqui." },
      { id: "ma5", texto: "Escreva três motivos para continuar sua jornada.", ciencia: "Lembrar seus motivos fortalece áreas do cérebro ligadas a propósito e tomada de decisão.", retorno: "Quando terminar, volte aqui." },
      { id: "ma6", texto: "Faça 10 agachamentos lentos.", ciencia: "Movimento físico ajuda a descarregar parte da energia acumulada que alimenta o impulso.", retorno: "Quando terminar, volte aqui." },
      { id: "ma7", texto: "Descreva mentalmente 3 objetos ao seu redor em detalhes.", ciencia: "Seu cérebro precisa mudar o foco para observação e atenção, reduzindo espaço para fantasias.", retorno: "Quando concluir, volte aqui." },
      { id: "ma8", texto: "Mude de cômodo e permaneça lá por 3 minutos.", ciencia: "O ambiente influencia muito mais o comportamento do que percebemos.", retorno: "Quando terminar, volte aqui." },
      { id: "ma9", texto: "Envie uma mensagem simples para alguém.", ciencia: "Conexão humana reduz a sensação de isolamento que costuma fortalecer impulsos.", retorno: "Quando enviar, volte aqui." },
      { id: "ma10", texto: "Coloque um cronômetro de 3 minutos e apenas espere.", ciencia: "Você está treinando a capacidade de sentir um impulso sem obedecê-lo imediatamente.", retorno: "Quando o tempo acabar, volte aqui." }
    ],
    critico: [
      { id: "ca1", texto: "Faça 30 segundos de corrida parada agora. Sem pensar.", ciencia: "Movimento intenso descarrega energia acumulada e reduz a sensação de urgência rapidamente.", retorno: "Quando recuperar o fôlego, volte aqui." },
      { id: "ca2", texto: "Segure algo bem gelado por 60 segundos. Uma garrafa, um copo de gelo.", ciencia: "O estímulo frio cria um sinal forte que ajuda seu cérebro a sair do ciclo de urgência.", retorno: "Quando terminar, volte aqui." },
      { id: "ca3", texto: "Grave um áudio dizendo o que está sentindo. Pode ser só para você.", ciencia: "Dar nome ao que você sente reduz a intensidade emocional e aumenta clareza mental.", retorno: "Quando terminar, me avise." },
      { id: "ca4", texto: "Vá agora para um local onde haja outras pessoas.", ciencia: "Mudar de ambiente reduz gatilhos e a presença de pessoas dificulta comportamentos impulsivos.", retorno: "Quando chegar lá, volte aqui." },
      { id: "ca5", texto: "Ligue para seu contato de confiança agora. Só para conversar.", ciencia: "Conexão humana real ativa o sistema de calma do cérebro e reduz a intensidade do impulso.", retorno: "Quando terminar, volte aqui." },
      { id: "ca6", texto: "Fique em pé e caminhe sem parar por 5 minutos.", ciencia: "É difícil permanecer preso no mesmo estado emocional enquanto o corpo está em movimento.", retorno: "Quando terminar, volte aqui." },
      { id: "ca7", texto: "Fale em voz alta exatamente o que está sentindo.", ciencia: "Dar nome às emoções reduz a intensidade delas e aumenta sua capacidade de escolha.", retorno: "Quando terminar, volte aqui." },
      { id: "ca8", texto: "Abra o chuveiro e tome um banho rápido de água fria.", ciencia: "A mudança brusca de temperatura altera o estado do sistema nervoso e interrompe o ciclo de urgência.", retorno: "Quando sair, volte aqui." },
      { id: "ca9", texto: "Configure um cronômetro de 5 minutos e faça apenas uma tarefa simples.", ciencia: "Seu objetivo agora não é resolver tudo. É atravessar os próximos minutos com segurança.", retorno: "Quando o tempo acabar, volte aqui." },
      { id: "ca10", texto: "Coloque uma música que te faz sentir forte. Ouça inteira.", ciencia: "Música ativa o sistema de recompensa do cérebro por um caminho diferente, reduzindo a busca pelo impulso.", retorno: "Quando terminar, volte aqui." }
    ]
  },
  en: {
    leve: [
      { id: "la1", texto: "Name 5 objects you can see.", ciencia: "Directing attention to the environment pulls the brain out of autopilot and reduces urge intensity.", retorno: "When you're done, come back." },
      { id: "la2", texto: "Stretch your arms, back, and neck for 2 minutes.", ciencia: "Physical and emotional tension go together. Relaxing the body sends safety signals to the nervous system.", retorno: "When you're done, come back." },
      { id: "la3", texto: "Count backwards from 100 to 0 skipping even numbers.", ciencia: "Your brain utilizes attention and reasoning areas, weakening the automatic cycle of the urge.", retorno: "When you are done, let me know." },
      { id: "la4", texto: "Organize a small nearby area for 3 minutes.", ciencia: "A concrete action replaces the search for immediate reward with a real sense of progress.", retorno: "When you're done, come back." },
      { id: "la5", texto: "Inhale for 4 seconds and exhale for 6 seconds. Repeat for 2 minutes.", ciencia: "Longer exhalations activate natural calming mechanisms and reduce emotional urgency.", retorno: "When you're done, come back." },
      { id: "la6", texto: "Observe your breathing for 1 minute without trying to change it.", ciencia: "Your brain slows down when you return to noticing what is happening now instead of chasing the next stimulus.", retorno: "When you're done, come back." },
      { id: "la7", texto: "Touch 5 different surfaces around you.", ciencia: "Different textures help your attention move out of imagination and return to the real world.", retorno: "When you're done, come back." },
      { id: "la8", texto: "Drink a glass of water paying attention to each sip.", ciencia: "Mindful attention interrupts automatic behavior and creates space for choice.", retorno: "When you're done, come back." },
      { id: "la9", texto: "Open a window or go to a spot with natural light.", ciencia: "Changes in the environment help the brain break out of the mental pattern in which it was stuck.", retorno: "When you get there, come back." },
      { id: "la10", texto: "Walk slowly for 2 minutes observing the environment.", ciencia: "Light movement reduces mental fixation and helps restore clarity.", retorno: "When you're done, come back." }
    ],
    moderado: [
      { id: "ma1", texto: "Do the 5 senses exercise: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.", ciencia: "This exercise anchors the mind in the present and reduces the strength of the thoughts that feed the urge.", retorno: "When you're done, come back." },
      { id: "ma2", texto: "Walk for 3 minutes without your phone.", ciencia: "Physical movement changes the brain state and reduces mental fixation on the urge.", retorno: "When you're done, come back." },
      { id: "ma3", texto: "Run cold water over your hands for 30 seconds. Feel every detail.", ciencia: "The change in temperature creates a strong physical stimulus that interrupts the ongoing mental cycle.", retorno: "When you're done, let me know." },
      { id: "ma4", texto: "Recite the alphabet backwards.", ciencia: "Your brain needs to shift focus to a difficult cognitive task, reducing space for the urge to grow.", retorno: "When you're done, come back." },
      { id: "ma5", texto: "Write down three reasons to continue your journey.", ciencia: "Remembering your reasons strengthens areas of the brain linked to purpose and decision-making.", retorno: "When you're done, come back." },
      { id: "ma6", texto: "Do 10 slow squats.", ciencia: "Physical movement helps discharge some of the accumulated energy that feeds the urge.", retorno: "When you're done, come back." },
      { id: "ma7", texto: "Mentally describe 3 objects around you in detail.", ciencia: "Your brain needs to shift focus to observation and attention, reducing space for fantasies.", retorno: "When you're done, come back." },
      { id: "ma8", texto: "Change rooms and stay there for 3 minutes.", ciencia: "The environment influences behavior much more than we realize.", retorno: "When you're done, come back." },
      { id: "ma9", texto: "Send a simple message to someone.", ciencia: "Real human connection reduces the feeling of isolation that often strengthens urges.", retorno: "When you send it, come back." },
      { id: "ma10", texto: "Set a timer for 3 minutes and just wait.", ciencia: "You are training the capacity to feel an urge without immediately obeying it.", retorno: "When the time is up, come back." }
    ],
    critico: [
      { id: "ca1", texto: "Do 30 seconds of high knees right now. Don't think.", ciencia: "Intense movement discharges accumulated energy and rapidly reduces the sense of urgency.", retorno: "When you catch your breath, come back." },
      { id: "ca2", texto: "Hold something very cold for 60 seconds. A bottle, a cup of ice.", ciencia: "The cold stimulus creates a strong signal that helps your brain step out of the urgency cycle.", retorno: "When you're done, come back." },
      { id: "ca3", texto: "Record an audio saying what you are feeling. It can be just for you.", ciencia: "Naming what you feel reduces emotional intensity and increases mental clarity.", retorno: "When you're done, let me know." },
      { id: "ca4", texto: "Go now to a place where there are other people.", ciencia: "Changing environment reduces triggers and the presence of people makes impulsive behaviors difficult.", retorno: "When you get there, come back." },
      { id: "ca5", texto: "Call your trusted contact now. Just to talk.", ciencia: "Real human connection activates the brain's calming system and reduces urge intensity.", retorno: "When you're done, come back." },
      { id: "ca6", texto: "Stand up and walk without stopping for 5 minutes.", ciencia: "It is hard to remain stuck in the same emotional state while the body is in motion.", retorno: "When you're done, come back." },
      { id: "ca7", texto: "Speak out loud exactly what you are feeling.", ciencia: "Naming your emotions out loud reduces their intensity and increases your capacity to choose.", retorno: "When you're done, come back." },
      { id: "ca8", texto: "Turn on the shower and take a quick cold shower.", ciencia: "A sudden change in temperature alters the nervous system's state and interrupts the cycle of urgency.", retorno: "When you get out, come back." },
      { id: "ca9", texto: "Set a timer for 5 minutes and do just one simple task.", ciencia: "Your goal now is not to solve everything. It is to get through the next few minutes safely.", retorno: "When the time is up, come back." },
      { id: "ca10", texto: "Put on a song that makes you feel strong. Listen to the whole thing.", ciencia: "Music activates the brain's reward system through a different pathway, reducing the search for the urge.", retorno: "When you're done, come back." }
    ]
  },
  es: {
    leve: [
      { id: "la1", texto: "Nombra 5 objetos que puedas ver.", ciencia: "Dirigir la atención al entorno saca al cerebro del piloto automático y reduce la intensidad del impulso.", retorno: "Cuando termines, vuelve aquí." },
      { id: "la2", texto: "Estira los brazos, la espalda y el cuello durante 2 minutos.", ciencia: "La tensión física y la emocional van juntas. Relajar el cuerpo envía señales de seguridad al sistema nervioso.", retorno: "Cuando termines, vuelve aquí." },
      { id: "la3", texto: "Cuenta hacia atrás de 100 a 0 saltándote los números pares.", ciencia: "Tu cerebro utiliza áreas de atención y razonamiento, debilitando el ciclo automático del impulso.", retorno: "Cuando termines, avísame." },
      { id: "la4", texto: "Organiza una pequeña área cercana durante 3 minutos.", ciencia: "Una acción concreta cambia la búsqueda de recompensa inmediata por una sensación real de progreso.", retorno: "Cuando termines, vuelve aquí." },
      { id: "la5", texto: "Inhala durante 4 segundos y exhala durante 6 segundos. Repite por 2 minutos.", ciencia: "Las exhalaciones más largas activan mecanismos naturales de calma y reducen la urgencia emocional.", retorno: "Cuando termines, vuelve aquí." },
      { id: "la6", texto: "Observa tu respiración durante 1 minuto sin intentar cambiarla.", ciencia: "Tu cerebro se desacelera cuando vuelves a notar lo que está pasando ahora en lugar de correr tras el siguiente estímulo.", retorno: "Cuando termines, vuelve aquí." },
      { id: "la7", texto: "Toca 5 superficies diferentes a tu alrededor.", ciencia: "Diferentes texturas ayudan a que tu atención salga de la imaginación y regrese al mundo real.", retorno: "Cuando termines, vuelve aquí." },
      { id: "la8", texto: "Bebe un vaso de agua prestando atención a cada sorbo.", ciencia: "La atención consciente interrumpe el comportamiento automático y crea espacio para elegir.", retorno: "Cuando termines, vuelve aquí." },
      { id: "la9", texto: "Abre una ventana o ve a un lugar com luz natural.", ciencia: "Cambios en el entorno ayudan al cerebro a salir del patrón mental en el que estaba atrapado.", retorno: "Cuando llegues allí, vuelve aquí." },
      { id: "la10", texto: "Camina lentamente durante 2 minutos observando el entorno.", ciencia: "El movimiento ligero reduce la fijación mental y ayuda a recuperar la claridad.", retorno: "Cuando termines, vuelve aquí." }
    ],
    moderado: [
      { id: "ma1", texto: "Haz el ejercicio de los 5 sentidos: 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas.", ciencia: "Este ejercicio ancla la mente en el presente y reduce la fuerza de los pensamientos que alimentan el impulso.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ma2", texto: "Camina durante 3 minutos sin celular.", ciencia: "El movimiento físico altera el estado cerebral y reduce la fijación mental en el impulso.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ma3", texto: "Pasa agua fría por tus manos durante 30 segundos. Siente cada detalle.", ciencia: "El cambio de temperatura crea un estímulo físico fuerte que interrumpe el ciclo mental en curso.", retorno: "Cuando termines, avísame." },
      { id: "ma4", texto: "Recita el abecedario al revés.", ciencia: "Tu cerebro necesita enfocar su atención en una tarea cognitiva difícil, reduciendo espacio para que el impulso crezca.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ma5", texto: "Escribe tres motivos para continuar tu jornada.", ciencia: "Recordar tus motivos fortalece áreas del cerebro ligadas al propósito y la toma de decisiones.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ma6", texto: "Haz 10 sentadillas lentas.", ciencia: "El movimiento físico ayuda a descargar parte de la energía acumulada que alimenta el impulso.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ma7", texto: "Describe mentalmente 3 objetos a tu alrededor en detalle.", ciencia: "Tu cerebro necesita cambiar el enfoque hacia la observación y atención, reduciendo espacio para fantasías.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ma8", texto: "Cambia de habitación y quédate allí durante 3 minutos.", ciencia: "El entorno influye en el comportamiento mucho más de lo que nos damos cuenta.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ma9", texto: "Envía un mensaje simple a alguien.", ciencia: "La conexión humana real reduce la sensación de aislamiento que suele fortalecer los impulsos.", retorno: "Cuando lo envíes, vuelve aquí." },
      { id: "ma10", texto: "Pon un temporizador de 3 minutos y solo espera.", ciencia: "Estás entrenando la capacidad de sentir un impulso sin obedecerlo inmediatamente.", retorno: "Cuando termine el tiempo, vuelve aquí." }
    ],
    critico: [
      { id: "ca1", texto: "Haz 30 segundos de carrera estática justo ahora. Sin pensar.", ciencia: "El movimiento intenso descarga energía acumulada y reduce la sensación de urgencia rápidamente.", retorno: "Cuando recuperes el aliento, vuelve aquí." },
      { id: "ca2", texto: "Sujeta algo muy frío durante 60 segundos. Una botella, un hielo.", ciencia: "El estímulo frío crea una señal fuerte que ayuda a tu cerebro a salir del ciclo de urgencia.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ca3", texto: "Graba un audio diciendo lo que estás sintiendo. Puede ser solo para ti.", ciencia: "Nombrar lo que sientes reduce la intensidad emocional y aumenta la claridad mental.", retorno: "Cuando termines, avísame." },
      { id: "ca4", texto: "Ve ahora a un lugar donde haya otras personas.", ciencia: "Cambiar de entorno reduce los detonadores y la presencia de personas dificulta comportamientos impulsivos.", retorno: "Cuando llegues allí, vuelve aquí." },
      { id: "ca5", texto: "Llama a tu contacto de confianza ahora. Solo para hablar.", ciencia: "La conexión humana real activa el sistema de calma del cerebro y reduce la intensidad del impulso.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ca6", texto: "Ponte de pie y camina sin parar durante 5 minutos.", ciencia: "Es difícil permanecer atrapado en el mismo estado emocional mientras el cuerpo está en movimiento.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ca7", texto: "Habla en voz alta exactamente de lo que estás sintiendo.", ciencia: "Dar nombre a las emociones en voz alta reduce su intensidad y aumenta tu capacidad de elección.", retorno: "Cuando termines, vuelve aquí." },
      { id: "ca8", texto: "Abre la ducha y toma una ducha rápida de agua fría.", ciencia: "El cambio repentino de temperatura altera el estado del sistema nervioso e interrumpe el ciclo de urgencia.", retorno: "Cuando salgas, vuelve aquí." },
      { id: "ca9", texto: "Configura un temporizador de 5 minutos y haz solo una tarea simple.", ciencia: "Tu objetivo ahora no es resolverlo todo. Es atravesar los próximos minutos con seguridad.", retorno: "Cuando termine el tiempo, vuelve aquí." },
      { id: "ca10", texto: "Pon una canción que te haga sentir fuerte. Escúchala completa.", ciencia: "La música activa el sistema de recompensa del cerebro por una vía diferente, reduciendo la búsqueda del impulso.", retorno: "Cuando termines, vuelve aquí." }
    ]
  }
};

function getACOES() {
  const lang = window.lumoI18n?.idioma || 'pt';
  return _ACOES[lang] || _ACOES.pt;
}
