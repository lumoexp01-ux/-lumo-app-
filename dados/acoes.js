// dados/acoes.js — Banco de ações da intervenção (PT / EN / ES)

const _ACOES = {
  pt: [
    { id: 1,  texto: "Saia do ambiente agora. Vá para outro cômodo.",                        retorno: "Quando sair, volte aqui." },
    { id: 2,  texto: "Beba um copo de água gelada. Devagar, sinta a temperatura.",            retorno: "Quando terminar, volte aqui." },
    { id: 3,  texto: "Converse com alguém próximo por 2 minutos. Sobre qualquer coisa.",     retorno: "Quando terminar, volte aqui." },
    { id: 4,  texto: "Faça 20 polichinelos agora. Sem pensar.",                               retorno: "Quando terminar, volte aqui." },
    { id: 5,  texto: "Lave o rosto com água fria.",                                           retorno: "Quando terminar, volte aqui." },
    { id: 6,  texto: "Saia de casa. Ande 5 minutos em qualquer direção.",                     retorno: "Quando voltar, me avise aqui." },
    { id: 7,  texto: "Ligue para seu contato de confiança agora.",                            retorno: "Quando terminar, volte aqui." },
    { id: 8,  texto: "Abra o chuveiro. Tome um banho rápido de água fria.",                   retorno: "Quando sair, volte aqui." },
    { id: 9,  texto: "Coloque uma música que te faz sentir forte. Ouça inteira.",             retorno: "Quando terminar, volte aqui." },
    { id: 10, texto: "Escreva no papel o que está sentindo. Qualquer coisa, sem filtro.",     retorno: "Quando terminar, volte aqui." },
  ],
  en: [
    { id: 1,  texto: "Leave the room now. Go to another space.",                              retorno: "When you're done, come back." },
    { id: 2,  texto: "Drink a glass of cold water. Slowly, feel the temperature.",            retorno: "When you're done, come back." },
    { id: 3,  texto: "Talk to someone nearby for 2 minutes. About anything.",                 retorno: "When you're done, come back." },
    { id: 4,  texto: "Do 20 jumping jacks now. Don't think.",                                 retorno: "When you're done, come back." },
    { id: 5,  texto: "Wash your face with cold water.",                                        retorno: "When you're done, come back." },
    { id: 6,  texto: "Go outside. Walk for 5 minutes in any direction.",                      retorno: "When you're back, let me know." },
    { id: 7,  texto: "Call your trusted contact now.",                                         retorno: "When you're done, come back." },
    { id: 8,  texto: "Turn on the shower. Take a quick cold shower.",                          retorno: "When you're done, come back." },
    { id: 9,  texto: "Put on a song that makes you feel strong. Listen to the whole thing.",  retorno: "When you're done, come back." },
    { id: 10, texto: "Write down what you're feeling on paper. Anything, unfiltered.",        retorno: "When you're done, come back." },
  ],
  es: [
    { id: 1,  texto: "Sal del lugar ahora. Ve a otro ambiente.",                              retorno: "Cuando salgas, vuelve aquí." },
    { id: 2,  texto: "Bebe un vaso de agua helada. Despacio, siente la temperatura.",         retorno: "Cuando termines, vuelve aquí." },
    { id: 3,  texto: "Habla con alguien cercano por 2 minutos. Sobre cualquier cosa.",        retorno: "Cuando termines, vuelve aquí." },
    { id: 4,  texto: "Haz 20 saltos ahora. Sin pensar.",                                      retorno: "Cuando termines, vuelve aquí." },
    { id: 5,  texto: "Lávate la cara con agua fría.",                                         retorno: "Cuando termines, vuelve aquí." },
    { id: 6,  texto: "Sal de casa. Camina 5 minutos en cualquier dirección.",                 retorno: "Cuando vuelvas, avísame aquí." },
    { id: 7,  texto: "Llama a tu contacto de confianza ahora.",                               retorno: "Cuando termines, vuelve aquí." },
    { id: 8,  texto: "Abre la ducha. Date una ducha rápida de agua fría.",                    retorno: "Cuando salgas, vuelve aquí." },
    { id: 9,  texto: "Pon una canción que te haga sentir fuerte. Escúchala completa.",        retorno: "Cuando termines, vuelve aquí." },
    { id: 10, texto: "Escribe en papel lo que estás sintiendo. Cualquier cosa, sin filtro.", retorno: "Cuando termines, vuelve aquí." },
  ],
};

function getACOES() {
  const lang = window.lumoI18n?.idioma || 'pt';
  return _ACOES[lang] || _ACOES.pt;
}
