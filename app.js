// app.js — Lógica principal do LUMO
// Funções canônicas: NUNCA reescrever ou duplicar em outro arquivo.

// ─────────────────────────────────────────
// SEGURANÇA — Sanitização XSS (Fragmento 4.1)
// Usar em TODO innerHTML que exibe dado do usuário
// ─────────────────────────────────────────

function sanitizar(texto) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(String(texto)));
  return div.innerHTML;
}

// ─────────────────────────────────────────
// FUNÇÕES CANÔNICAS (Fragmento 3.1)
// ─────────────────────────────────────────

function calcularDias(startDate) {
  // Força noon local para evitar o parse UTC que desloca o dia no fuso brasileiro
  const agora  = new Date();
  const inicio = new Date(startDate + 'T12:00:00');
  return Math.floor((agora - inicio) / (1000 * 60 * 60 * 24));
}

function calcularNivel(dias) {
  if (dias < 7)   return { nome: 'Soldado',  proximo: 'Cabo',     diasFaltam: 7   - dias };
  if (dias < 14)  return { nome: 'Cabo',     proximo: 'Sargento', diasFaltam: 14  - dias };
  if (dias < 21)  return { nome: 'Sargento', proximo: 'Tenente',  diasFaltam: 21  - dias };
  if (dias < 30)  return { nome: 'Tenente',  proximo: 'Capitão',  diasFaltam: 30  - dias };
  if (dias < 45)  return { nome: 'Capitão',  proximo: 'Major',    diasFaltam: 45  - dias };
  if (dias < 60)  return { nome: 'Major',    proximo: 'Coronel',  diasFaltam: 60  - dias };
  if (dias < 90)  return { nome: 'Coronel',  proximo: 'General',  diasFaltam: 90  - dias };
  if (dias < 120) return { nome: 'General',  proximo: 'Rei',      diasFaltam: 120 - dias };
  if (dias < 180) return { nome: 'Rei',      proximo: 'Monge',    diasFaltam: 180 - dias };
  return { nome: 'Monge', proximo: null, diasFaltam: 0 };
}

function calcularProgresso(dias) {
  const limites  = [7, 14, 21, 30, 45, 60, 90, 120, 180];
  const anterior = [0,  7, 14, 21, 30, 45, 60,  90, 120];
  for (let i = 0; i < limites.length; i++) {
    if (dias < limites[i]) {
      return Math.round(((dias - anterior[i]) / (limites[i] - anterior[i])) * 100);
    }
  }
  return 100;
}

// ─────────────────────────────────────────
// OBJETO DO USUÁRIO (sem Firebase — Fase 3)
// ─────────────────────────────────────────

// Carrega dados do sessionStorage (salvos no onboarding) ou usa defaults
const _dadosSessao = JSON.parse(sessionStorage.getItem('usuario') || 'null');

const usuario = {
  nome:             _dadosSessao?.nome      || 'Rafael',
  email:            _dadosSessao?.email     || '',
  startDate:        _dadosSessao?.startDate || '2026-02-26',
  impulsosVencidos: _dadosSessao?.impulsosVencidos ?? 12,
  recaidas:         _dadosSessao?.recaidas  ?? 3,
};

function salvarSessao() {
  sessionStorage.setItem('usuario', JSON.stringify(usuario));
}

// ─────────────────────────────────────────
// RENDERIZAÇÃO DA INDEX (Fragmento 3.2)
// ─────────────────────────────────────────

const ORDEM_NIVEIS = [
  'Soldado', 'Cabo', 'Sargento', 'Tenente',
  'Capitão', 'Major', 'Coronel', 'General', 'Rei', 'Monge',
];

function renderizarIndex() {
  // ── FONTE ÚNICA DE VERDADE ──
  // calcularDias e calcularNivel são chamados UMA VEZ aqui.
  // Nenhuma outra parte do código chama essas funções para renderizar a tela.
  const dias      = calcularDias(usuario.startDate);
  const nivel     = calcularNivel(dias);
  const progresso = calcularProgresso(dias);
  // A partir daqui, APENAS as variáveis dias / nivel / progresso são usadas.

  // Badge de dias (header)
  const elDias = document.getElementById('badge-dias');
  if (elDias) elDias.textContent = `${dias} dias`;

  // Card de rank — nível
  const elNivel = document.getElementById('rank-nivel');
  if (elNivel) elNivel.textContent = nivel.nome.toUpperCase();

  // Card de rank — próximo nível
  const elProximo = document.getElementById('rank-proximo');
  if (elProximo) {
    if (nivel.proximo) {
      elProximo.innerHTML = `Próximo: <strong>${nivel.proximo}</strong> em ${nivel.diasFaltam} dias`;
    } else {
      elProximo.textContent = 'Nível máximo atingido.';
    }
  }

  // Barra de progresso
  const elBarra = document.getElementById('progress-fill');
  if (elBarra) elBarra.style.width = `${progresso}%`;
  const elPct = document.getElementById('progress-pct');
  if (elPct) elPct.textContent = `${progresso}%`;

  // Stats — todos usam as mesmas variáveis dias/nivel calculadas acima
  const elStatDias      = document.getElementById('stat-dias');
  const elStatImpulsos  = document.getElementById('stat-impulsos');
  const elStatRecaidas  = document.getElementById('stat-recaidas');
  const elStatSequencia = document.getElementById('stat-sequencia');
  if (elStatDias)      elStatDias.textContent      = dias;
  if (elStatImpulsos)  elStatImpulsos.textContent  = usuario.impulsosVencidos;
  if (elStatRecaidas)  elStatRecaidas.textContent  = usuario.recaidas;
  if (elStatSequencia) elStatSequencia.textContent = dias;

  // Saudação com nome
  const elSaudacao = document.getElementById('saudacao-nome');
  if (elSaudacao) elSaudacao.textContent = usuario.nome;

  // Chips da jornada — usa nivel.nome calculado acima, não recalcula
  renderizarChipsNivel(nivel.nome);

  // Modais — usa nivel e dias calculados acima, não recalcula
  atualizarTextoModais(nivel, dias);
}

function renderizarChipsNivel(nomeAtual) {
  const chips = document.querySelectorAll('.level-chip');
  const idxAtual = ORDEM_NIVEIS.indexOf(nomeAtual);

  chips.forEach((chip, i) => {
    chip.classList.remove('level-chip--done', 'level-chip--active', 'level-chip--locked');
    if (i < idxAtual)      chip.classList.add('level-chip--done');
    else if (i === idxAtual) chip.classList.add('level-chip--active');
    else                   chip.classList.add('level-chip--locked');
  });
}

// ─────────────────────────────────────────
// PERSONALIZAÇÃO DE MENSAGENS (Fragmento 3.6)
// ─────────────────────────────────────────

function atualizarTextoModais(nivel, dias) {
  // Modal impulso — nome do usuário
  const elNomeImpulso = document.getElementById('modal-impulso-nome');
  if (elNomeImpulso) elNomeImpulso.textContent = usuario.nome;

  // Modal impulso — nível no passo 3
  const elNivelImpulso = document.getElementById('modal-impulso-nivel');
  if (elNivelImpulso) {
    elNivelImpulso.textContent = `Você é ${nivel.nome}. ${dias} dias não se jogam fora.`;
  }

  // Modal recaída — nome
  const elNomeRecaida = document.getElementById('modal-recaida-nome');
  if (elNomeRecaida) elNomeRecaida.textContent = usuario.nome;

  // Modal recaída — nível âncora
  const elNivelAncora = document.getElementById('anchor-nivel');
  if (elNivelAncora) elNivelAncora.textContent = nivel.nome.toUpperCase();

  const elDiasAncora = document.getElementById('anchor-dias');
  if (elDiasAncora) elDiasAncora.textContent = `${dias} dias construídos`;
}

// ─────────────────────────────────────────
// REGISTRO DE IMPULSO VENCIDO (Fragmento 3.3)
// ─────────────────────────────────────────

let impulsoEmProcesso = false;

function registrarImpulsoVencido() {
  if (impulsoEmProcesso) return;
  impulsoEmProcesso = true;

  usuario.impulsosVencidos += 1;
  salvarSessao();
  renderizarIndex();

  // Debounce de 1.5s para evitar duplo clique
  setTimeout(() => { impulsoEmProcesso = false; }, 1500);
}

// ─────────────────────────────────────────
// LÓGICA DE RECAÍDA (Fragmento 3.4)
// ─────────────────────────────────────────

function registrarRecaida() {
  usuario.startDate = new Date().toISOString().split('T')[0];
  usuario.recaidas  += 1;
  salvarSessao();
  renderizarIndex();
}

// ─────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────

// Oculta splash screen — chamada por app.js agora e por Fragment 4.4 via Firebase
// Fragment 4.4 substituirá a chamada automática por onAuthStateChanged
function ocultarSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('splash--oculto');
  setTimeout(() => { splash.style.display = 'none'; }, 350);
}

document.addEventListener('DOMContentLoaded', () => {
  // Só renderiza se estiver na index
  if (document.getElementById('rank-nivel')) {
    renderizarIndex();
    // TODO Fragment 4.4: remover esta linha — o splash será ocultado após onAuthStateChanged
    ocultarSplash();

    // "Venci esse momento" — registra vitória e fecha modal (app.js é dono deste handler)
    const btnVenceu = document.getElementById('btn-venceu');
    if (btnVenceu) {
      btnVenceu.addEventListener('click', () => {
        registrarImpulsoVencido();
        const modal = document.getElementById('modal-impulso');
        if (modal && window.fecharModal) window.fecharModal(modal);
      });
    }

    // "Recomeçar do zero" — registra recaída e fecha modal (app.js é dono deste handler)
    const btnRecomecar = document.getElementById('btn-recomecar');
    if (btnRecomecar) {
      btnRecomecar.addEventListener('click', () => {
        registrarRecaida();
        const modal = document.getElementById('modal-recaida');
        if (modal && window.fecharModal) window.fecharModal(modal);
      });
    }
  }
});
