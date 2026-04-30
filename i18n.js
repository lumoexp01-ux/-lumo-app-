// i18n.js — Fragmento 6.1 — Suporte a idiomas PT / EN / ES
// Todas as strings bundleadas aqui. lang/*.js são os arquivos de referência por idioma.
// Uso: window.t('chave') → string traduzida
//      window.lumoI18n.aplicar('en') → troca idioma e atualiza DOM

const STRINGS = {

  // ══════════════════════════════════════════════
  // PORTUGUÊS
  // ══════════════════════════════════════════════
  pt: {
    // Comum
    'btn.cancelar':  'Cancelar',
    'btn.salvar':    'Salvar',
    'btn.voltar':    'Voltar',
    'btn.fechar':    'Fechar',
    'btn.continuar': 'Continuar',
    'btn.proximo':   'Próximo',
    'unit.dias':     'dias',

    // Index — cabeçalho e rank
    'index.nivel-label':    'Seu nível',
    'index.proximo-label':  'Próximo:',
    'index.nivel-max':      'Nível máximo atingido.',
    'index.progresso-label':'Progresso no nível',
    'index.jornada':        'Jornada',
    'index.btn-crise':      'Alerta de Recaída',

    // Index — stats
    'stat.dias':      'Dias de controle',
    'stat.impulsos':  'Impulsos vencidos',
    'stat.recaidas':  'Recaídas',
    'stat.sequencia': 'Sequência atual',

    // Index — quick cards
    'quick.gatilhos-title':    'Meus gatilhos',
    'quick.gatilhos-desc':     'Conheça seus riscos',
    'quick.carta-title':       'Carta do futuro',
    'quick.carta-desc':        'Palavras suas, para o momento certo',
    'quick.config-title':      'Configurações',
    'quick.config-desc':       'FAB, contato, perfil',
    'quick.compromisso-title': 'Compromisso',
    'quick.compromisso-desc':  'Defina uma meta pessoal',

    // Index — Discord
    'discord.title': 'Grupo de apoio LUMO',
    'discord.desc':  'Você não está sozinho',

    // Níveis — nomes exibidos (chave interna é sempre PT)
    'nivel.Soldado': 'Soldado',
    'nivel.Cabo':    'Cabo',
    'nivel.Sargento':'Sargento',
    'nivel.Tenente': 'Tenente',
    'nivel.Capitão': 'Capitão',
    'nivel.Major':   'Major',
    'nivel.Coronel': 'Coronel',
    'nivel.General': 'General',
    'nivel.Rei':     'Rei',
    'nivel.Monge':   'Monge',

    // Chips de nível — intervalo de dias
    'chip.soldado':  '0–6 dias',
    'chip.cabo':     '7–13 dias',
    'chip.sargento': '14–20 dias',
    'chip.tenente':  '21–29 dias',
    'chip.capitao':  '30–44 dias',
    'chip.major':    '45–59 dias',
    'chip.coronel':  '60–89 dias',
    'chip.general':  '90–119 dias',
    'chip.rei':      '120–179 dias',
    'chip.monge':    '180+ dias',

    // Modal impulso
    'impulso.title':      'Você consegue.',
    'impulso.subtitle':   ', respira. Um passo de cada vez.',
    'impulso.inspire':    'Inspire 4s',
    'impulso.segure':     'Segure 4s',
    'impulso.solte':      'Solte 4s',
    'impulso.step1-title':'Saia do ambiente',
    'impulso.step1-desc': 'Mude de cômodo agora. Anda 10 passos.',
    'impulso.step2-title':'Beba água gelada',
    'impulso.step2-desc': 'Devagar. Sinta a temperatura.',
    'impulso.step3-title':'Lembre do seu nível',
    'impulso.step4-title':'Fale com a IA',
    'impulso.step4-desc': 'Se precisar de mais apoio, o chat está aqui.',
    'impulso.btn-venceu': 'Venci esse momento',
    'impulso.btn-ajuda':  'Preciso de mais ajuda',

    // Modal recaída
    'recaida.title':        'Respira.\nNão acabou.',
    'recaida.anchor-label': 'Você chegou até aqui',
    'recaida.anchor-cta':   'Volte a ser isso.',
    'recaida.btn-recomecar':'Recomeçar do zero',

    // Modal compromisso
    'compromisso.title':       'Compromisso',
    'compromisso.desc':        'Escreva sua razão para continuar. Isso aparece na tela principal como lembrete.',
    'compromisso.placeholder': 'Ex: Faço isso pelos meus filhos. Pela minha saúde. Por mim.',
    'compromisso.meta-label':  'Meta (opcional)',
    'compromisso.btn-ativar':  'Ativar compromisso',
    'compromisso.btn-salvar':  'Salvar alterações',
    'compromisso.btn-cancelar':'Cancelar compromisso',

    // Menu dropdown
    'menu.config':  'Configurações',
    'menu.recaida': 'Registrar recaída',
  },

  // ══════════════════════════════════════════════
  // ENGLISH
  // ══════════════════════════════════════════════
  en: {
    'btn.cancelar':  'Cancel',
    'btn.salvar':    'Save',
    'btn.voltar':    'Back',
    'btn.fechar':    'Close',
    'btn.continuar': 'Continue',
    'btn.proximo':   'Next',
    'unit.dias':     'days',

    'index.nivel-label':    'Your level',
    'index.proximo-label':  'Next:',
    'index.nivel-max':      'Maximum level reached.',
    'index.progresso-label':'Level progress',
    'index.jornada':        'Journey',
    'index.btn-crise':      'Crisis Alert',

    'stat.dias':      'Days of control',
    'stat.impulsos':  'Urges overcome',
    'stat.recaidas':  'Relapses',
    'stat.sequencia': 'Current streak',

    'quick.gatilhos-title':    'My triggers',
    'quick.gatilhos-desc':     'Know your risks',
    'quick.carta-title':       'Letter from the future',
    'quick.carta-desc':        'Your words, for the right moment',
    'quick.config-title':      'Settings',
    'quick.config-desc':       'FAB, contact, profile',
    'quick.compromisso-title': 'Commitment',
    'quick.compromisso-desc':  'Set a personal goal',

    'discord.title': 'LUMO support group',
    'discord.desc':  "You're not alone",

    'nivel.Soldado': 'Soldier',
    'nivel.Cabo':    'Private',
    'nivel.Sargento':'Corporal',
    'nivel.Tenente': 'Sergeant',
    'nivel.Capitão': 'Lieutenant',
    'nivel.Major':   'Captain',
    'nivel.Coronel': 'Major',
    'nivel.General': 'Colonel',
    'nivel.Rei':     'General',
    'nivel.Monge':   'Legend',

    'chip.soldado':  '0–6 days',
    'chip.cabo':     '7–13 days',
    'chip.sargento': '14–20 days',
    'chip.tenente':  '21–29 days',
    'chip.capitao':  '30–44 days',
    'chip.major':    '45–59 days',
    'chip.coronel':  '60–89 days',
    'chip.general':  '90–119 days',
    'chip.rei':      '120–179 days',
    'chip.monge':    '180+ days',

    'impulso.title':      "You've got this.",
    'impulso.subtitle':   ', breathe. One step at a time.',
    'impulso.inspire':    'Inhale 4s',
    'impulso.segure':     'Hold 4s',
    'impulso.solte':      'Exhale 4s',
    'impulso.step1-title':'Leave the room',
    'impulso.step1-desc': 'Change rooms now. Take 10 steps.',
    'impulso.step2-title':'Drink cold water',
    'impulso.step2-desc': 'Slowly. Feel the temperature.',
    'impulso.step3-title':'Remember your level',
    'impulso.step4-title':'Talk to the AI',
    'impulso.step4-desc': 'If you need more support, the chat is here.',
    'impulso.btn-venceu': 'I overcame this moment',
    'impulso.btn-ajuda':  'I need more help',

    'recaida.title':        "Breathe.\nIt's not over.",
    'recaida.anchor-label': 'You made it this far',
    'recaida.anchor-cta':   'Come back to this.',
    'recaida.btn-recomecar':'Start over',

    'compromisso.title':       'Commitment',
    'compromisso.desc':        'Write your reason to continue. This appears on the main screen as a reminder.',
    'compromisso.placeholder': 'E.g.: I do this for my kids. For my health. For me.',
    'compromisso.meta-label':  'Goal (optional)',
    'compromisso.btn-ativar':  'Activate commitment',
    'compromisso.btn-salvar':  'Save changes',
    'compromisso.btn-cancelar':'Cancel commitment',

    'menu.config':  'Settings',
    'menu.recaida': 'Log a relapse',
  },

  // ══════════════════════════════════════════════
  // ESPAÑOL
  // ══════════════════════════════════════════════
  es: {
    'btn.cancelar':  'Cancelar',
    'btn.salvar':    'Guardar',
    'btn.voltar':    'Volver',
    'btn.fechar':    'Cerrar',
    'btn.continuar': 'Continuar',
    'btn.proximo':   'Siguiente',
    'unit.dias':     'días',

    'index.nivel-label':    'Tu nivel',
    'index.proximo-label':  'Siguiente:',
    'index.nivel-max':      'Nivel máximo alcanzado.',
    'index.progresso-label':'Progreso en el nivel',
    'index.jornada':        'Jornada',
    'index.btn-crise':      'Alerta de recaída',

    'stat.dias':      'Días de control',
    'stat.impulsos':  'Impulsos vencidos',
    'stat.recaidas':  'Recaídas',
    'stat.sequencia': 'Racha actual',

    'quick.gatilhos-title':    'Mis detonadores',
    'quick.gatilhos-desc':     'Conoce tus riesgos',
    'quick.carta-title':       'Carta del futuro',
    'quick.carta-desc':        'Tus palabras, para el momento correcto',
    'quick.config-title':      'Configuración',
    'quick.config-desc':       'FAB, contacto, perfil',
    'quick.compromisso-title': 'Compromiso',
    'quick.compromisso-desc':  'Define una meta personal',

    'discord.title': 'Grupo de apoyo LUMO',
    'discord.desc':  'No estás solo',

    'nivel.Soldado': 'Recluta',
    'nivel.Cabo':    'Cabo',
    'nivel.Sargento':'Sargento',
    'nivel.Tenente': 'Teniente',
    'nivel.Capitão': 'Capitán',
    'nivel.Major':   'Mayor',
    'nivel.Coronel': 'Coronel',
    'nivel.General': 'General',
    'nivel.Rei':     'Rey',
    'nivel.Monge':   'Monje',

    'chip.soldado':  '0–6 días',
    'chip.cabo':     '7–13 días',
    'chip.sargento': '14–20 días',
    'chip.tenente':  '21–29 días',
    'chip.capitao':  '30–44 días',
    'chip.major':    '45–59 días',
    'chip.coronel':  '60–89 días',
    'chip.general':  '90–119 días',
    'chip.rei':      '120–179 días',
    'chip.monge':    '180+ días',

    'impulso.title':      'Tú puedes.',
    'impulso.subtitle':   ', respira. Un paso a la vez.',
    'impulso.inspire':    'Inhala 4s',
    'impulso.segure':     'Mantén 4s',
    'impulso.solte':      'Exhala 4s',
    'impulso.step1-title':'Sal del lugar',
    'impulso.step1-desc': 'Cambia de habitación ahora. Da 10 pasos.',
    'impulso.step2-title':'Bebe agua fría',
    'impulso.step2-desc': 'Despacio. Siente la temperatura.',
    'impulso.step3-title':'Recuerda tu nivel',
    'impulso.step4-title':'Habla con la IA',
    'impulso.step4-desc': 'Si necesitas más apoyo, el chat está aquí.',
    'impulso.btn-venceu': 'Superé este momento',
    'impulso.btn-ajuda':  'Necesito más ayuda',

    'recaida.title':        'Respira.\nNo acabó.',
    'recaida.anchor-label': 'Llegaste hasta aquí',
    'recaida.anchor-cta':   'Vuelve a ser eso.',
    'recaida.btn-recomecar':'Empezar de cero',

    'compromisso.title':       'Compromiso',
    'compromisso.desc':        'Escribe tu razón para continuar. Esto aparece en la pantalla principal como recordatorio.',
    'compromisso.placeholder': 'Ej: Lo hago por mis hijos. Por mi salud. Por mí.',
    'compromisso.meta-label':  'Meta (opcional)',
    'compromisso.btn-ativar':  'Activar compromiso',
    'compromisso.btn-salvar':  'Guardar cambios',
    'compromisso.btn-cancelar':'Cancelar compromiso',

    'menu.config':  'Configuración',
    'menu.recaida': 'Registrar recaída',
  },
};

// ── Estado interno ──
let _idioma = 'pt';
let _t = STRINGS.pt;
const SUPORTADOS = Object.keys(STRINGS);

window.lumoI18n = {

  // Detecta idioma: preferência salva → navigator.language → fallback PT
  detectar(preferencia) {
    if (preferencia && SUPORTADOS.includes(preferencia)) return preferencia;
    const nav = (navigator.language || 'pt').slice(0, 2).toLowerCase();
    return SUPORTADOS.includes(nav) ? nav : 'pt';
  },

  // Aplica idioma ao DOM (elementos data-i18n e data-i18n-ph)
  aplicar(idioma) {
    _idioma = SUPORTADOS.includes(idioma) ? idioma : this.detectar(idioma);
    _t = STRINGS[_idioma];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (_t[k] !== undefined) el.textContent = _t[k];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const k = el.dataset.i18nPh;
      if (_t[k] !== undefined) el.placeholder = _t[k];
    });
    document.documentElement.lang = _idioma;
  },

  // Traduz uma chave (com substituições opcionais: {n}, {nome})
  t(chave, vars = {}) {
    let s = _t[chave] ?? STRINGS.pt[chave] ?? chave;
    Object.entries(vars).forEach(([k, v]) => { s = s.replace(`{${k}}`, v); });
    return s;
  },

  get idioma() { return _idioma; },
};

// Atalho global
window.t = (chave, vars) => window.lumoI18n.t(chave, vars);

// Aplica imediatamente com idioma detectado do navegador
document.addEventListener('DOMContentLoaded', () => {
  window.lumoI18n.aplicar(window.lumoI18n.detectar());
});
