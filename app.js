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
// OBJETO DO USUÁRIO (Fragmento 4.4)
// Preenchido pelo Firestore após auth. Nunca usar hardcoded.
// ─────────────────────────────────────────

const usuario = {
  nome:              '',
  email:             '',
  startDate:         new Date().toISOString().split('T')[0],
  impulsosVencidos:  0,
  recaidas:          0,
  historicoRecaidas: [],
  configFab:         {},
  carta:             null,
  compromisso:       null,
  idioma:            'pt',
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
  if (elNivel) elNivel.textContent = (window.t?.('nivel.' + nivel.nome) ?? nivel.nome).toUpperCase();

  // Card de rank — próximo nível
  const elProximo = document.getElementById('rank-proximo');
  if (elProximo) {
    if (nivel.proximo) {
      const proxLabel = window.t?.('index.proximo-label') ?? 'Próximo:';
      const proxNome  = window.t?.('nivel.' + nivel.proximo) ?? nivel.proximo;
      const unitDias  = window.t?.('unit.dias') ?? 'dias';
      elProximo.innerHTML = `${proxLabel} <strong>${proxNome}</strong> em ${nivel.diasFaltam} ${unitDias}`;
    } else {
      elProximo.textContent = window.t?.('index.nivel-max') ?? 'Nível máximo atingido.';
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

  // Persiste no Firestore em background
  const sessao = JSON.parse(sessionStorage.getItem('usuario') || 'null');
  const uid = window.lumo?.auth?.currentUser?.uid;
  if (uid && window.lumo) {
    const { db, doc, updateDoc, increment } = window.lumo;
    updateDoc(doc(db, 'usuarios', uid), {
      'progresso.impulsosVencidos': increment(1),
    }).catch(() => {});
  }

  // Debounce de 1.5s para evitar duplo clique
  setTimeout(() => { impulsoEmProcesso = false; }, 1500);
}

// ─────────────────────────────────────────
// LÓGICA DE RECAÍDA (Fragmento 3.4)
// ─────────────────────────────────────────

function registrarRecaida() {
  const hoje = new Date().toISOString().split('T')[0];
  usuario.startDate         = hoje;
  usuario.recaidas         += 1;
  usuario.historicoRecaidas = [...(usuario.historicoRecaidas || []), hoje];
  salvarSessao();
  renderizarIndex();

  const uid = window.lumo?.auth?.currentUser?.uid;
  if (uid && window.lumo) {
    const { db, doc, updateDoc, increment, arrayUnion } = window.lumo;
    updateDoc(doc(db, 'usuarios', uid), {
      'perfil.startDate':             hoje,
      'progresso.recaidas':           increment(1),
      'progresso.sequenciaAtual':     0,
      'progresso.historicoRecaidas':  arrayUnion(hoje),
    }).catch(() => {});
  }
}

// ─────────────────────────────────────────
// MODO COMPROMISSO (Fragmento 5.5)
// ─────────────────────────────────────────

function renderizarCompromisso() {
  const c      = usuario.compromisso;
  const banner = document.getElementById('compromisso-banner');
  if (!banner) return;

  if (!c?.ativo) { banner.classList.add('hidden'); return; }
  banner.classList.remove('hidden');

  const elTexto = document.getElementById('compromisso-texto');
  const elMeta  = document.getElementById('compromisso-meta');
  if (elTexto) elTexto.textContent = c.texto || '';

  if (elMeta) {
    if (c.meta && c.inicio) {
      const fim = new Date(c.inicio + 'T12:00:00');
      fim.setDate(fim.getDate() + c.meta);
      if (new Date() >= fim) {
        elMeta.textContent  = 'Meta atingida!';
        elMeta.style.color  = 'var(--green-win)';
      } else {
        const dias = Math.ceil((fim - new Date()) / (1000 * 60 * 60 * 24));
        elMeta.textContent = `Meta: ${c.meta} dias · Faltam ${dias}`;
        elMeta.style.color = '';
      }
    } else {
      elMeta.textContent = '';
    }
  }
}

let _compromissoIniciado = false;
function inicializarModalCompromisso() {
  if (_compromissoIniciado) { renderizarCompromisso(); return; }
  _compromissoIniciado = true;

  const modal       = document.getElementById('modal-compromisso');
  const inputTexto  = document.getElementById('compromisso-input');
  const counter     = document.getElementById('compromisso-count');
  const btnSalvar   = document.getElementById('btn-salvar-compromisso');
  const btnCancelar = document.getElementById('btn-cancelar-compromisso');
  const btnFechar   = document.getElementById('btn-fechar-compromisso');
  if (!modal) return;

  function abrirModalCompromisso() {
    const c    = usuario.compromisso;
    const chips = modal.querySelectorAll('.chip');
    if (c?.ativo) {
      if (inputTexto) inputTexto.value = c.texto || '';
      if (counter)    counter.textContent = (c.texto || '').length;
      chips.forEach(ch => ch.classList.toggle('active', Number(ch.dataset.dias) === c.meta));
      if (btnCancelar) btnCancelar.style.display = 'block';
      if (btnSalvar)   btnSalvar.textContent = 'Salvar alterações';
    } else {
      if (inputTexto) inputTexto.value = '';
      if (counter)    counter.textContent = 0;
      chips.forEach(ch => ch.classList.remove('active'));
      if (btnCancelar) btnCancelar.style.display = 'none';
      if (btnSalvar)   btnSalvar.textContent = 'Ativar compromisso';
    }
    window.abrirModal(modal);
  }

  document.getElementById('btn-abrir-compromisso')?.addEventListener('click', abrirModalCompromisso);
  document.getElementById('btn-ver-compromisso')?.addEventListener('click', abrirModalCompromisso);

  inputTexto?.addEventListener('input', () => {
    if (counter) counter.textContent = inputTexto.value.length;
  });

  modal.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const jaAtivo = chip.classList.contains('active');
      modal.querySelectorAll('.chip').forEach(ch => ch.classList.remove('active'));
      if (!jaAtivo) chip.classList.add('active');
    });
  });

  btnSalvar?.addEventListener('click', async () => {
    const texto = inputTexto?.value.trim() || '';
    if (!texto) { inputTexto?.focus(); return; }

    const uid = window.lumo?.auth?.currentUser?.uid;
    if (!uid) return;

    const chipAtivo = modal.querySelector('.chip.active');
    const meta  = chipAtivo ? Number(chipAtivo.dataset.dias) : null;
    const hoje  = new Date().toISOString().split('T')[0];
    const compromisso = {
      ativo:  true,
      texto,
      meta,
      inicio: usuario.compromisso?.inicio ?? hoje,
    };

    usuario.compromisso = compromisso;
    renderizarCompromisso();
    window.fecharModal(modal);

    const { db, doc, updateDoc } = window.lumo;
    updateDoc(doc(db, 'usuarios', uid), { compromisso }).catch(() => {});
  });

  btnCancelar?.addEventListener('click', async () => {
    const uid = window.lumo?.auth?.currentUser?.uid;
    if (!uid) return;

    usuario.compromisso = null;
    renderizarCompromisso();
    window.fecharModal(modal);

    const { db, doc, updateDoc, deleteField } = window.lumo;
    updateDoc(doc(db, 'usuarios', uid), { compromisso: deleteField() }).catch(() => {});
  });

  btnFechar?.addEventListener('click', () => window.fecharModal(modal));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) window.fecharModal(modal);
  });
}

// ─────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// SPLASH
// ─────────────────────────────────────────

function ocultarSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('splash--oculto');
  setTimeout(() => { splash.style.display = 'none'; }, 350);
}

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────

async function logout() {
  const { auth, signOut } = window.lumo;
  await signOut(auth);
  usuario.nome = '';
  sessionStorage.clear();
  window.location.href = 'onboarding.html';
}

// ─────────────────────────────────────────
// INICIALIZAÇÃO — Fragmento 4.4
// Guard de autenticação: só entra na index
// se estiver logado E tiver perfil no Firestore.
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('rank-nivel')) return;

  console.log('Index aberto, verificando auth');

  const { auth, db, onAuthStateChanged, doc, getDoc } = window.lumo;

  onAuthStateChanged(auth, async (userFirebase) => {

    // Não autenticado → onboarding
    if (!userFirebase) {
      console.log('Auth não detectado, voltando para onboarding');
      window.location.href = 'onboarding.html';
      return;
    }

    console.log('Auth detectado: ' + userFirebase.uid);

    // Busca perfil no Firestore
    const snap = await getDoc(doc(db, 'usuarios', userFirebase.uid));

    if (snap.exists()) {
      // Suporta estrutura v2.0 (aninhada) e v1.x (plana)
      const dados = snap.data();
      usuario.nome              = dados.perfil?.nome              ?? dados.nome              ?? '';
      usuario.email             = dados.perfil?.email             ?? dados.email             ?? userFirebase.email ?? '';
      usuario.startDate         = dados.perfil?.startDate         ?? dados.startDate         ?? new Date().toISOString().split('T')[0];
      usuario.impulsosVencidos  = dados.progresso?.impulsosVencidos  ?? dados.impulsosVencidos  ?? 0;
      usuario.recaidas          = dados.progresso?.recaidas          ?? dados.recaidas          ?? 0;
      usuario.historicoRecaidas = dados.progresso?.historicoRecaidas ?? dados.historicoRecaidas ?? [];
      usuario.configFab         = dados.config?.fab                  ?? {};
      // carta — lida descriptografada do sessionStorage (carta.js descriptografa e salva lá)
      const sessaoCarta = JSON.parse(sessionStorage.getItem('usuario') || '{}');
      usuario.carta       = sessaoCarta.carta ?? null;
      usuario.compromisso = dados.compromisso  ?? null;
      usuario.idioma      = dados.perfil?.idioma ?? window.lumoI18n?.detectar() ?? 'pt';

      // Verificação de trial (Fragmento 4.8)
      // Pula a verificação para v1.x (sem campo pagamento) — não bloqueia
      const pagamento = dados.pagamento;
      if (pagamento) {
        const pago        = pagamento.pago === true;
        const trialValido = pagamento.trialFim && new Date() < new Date(pagamento.trialFim);
        if (!pago && !trialValido) {
          window.location.href = 'pagamento.html';
          return;
        }
      }

      // Discord — visível apenas para pagantes
      if (dados.pagamento?.pago === true) {
        const discordSection = document.getElementById('discord-section');
        if (discordSection) discordSection.style.display = 'block';
        // Busca link do Discord no Firestore
        getDoc(doc(db, 'config-app', 'global')).then(cfg => {
          if (cfg.exists()) {
            const link = cfg.data()?.discordLink;
            const discordLink = document.getElementById('discord-link');
            if (link && discordLink) discordLink.href = link;
          }
        }).catch(() => {});
      }

    } else {
      // Perfil ainda não foi salvo no Firestore (Fragment 4.3 pendente).
      // Fallback: usa sessionStorage se o usuário veio direto do onboarding.
      const sessao = JSON.parse(sessionStorage.getItem('usuario') || 'null');
      if (sessao?.nome) {
        console.log('Perfil não encontrado no Firestore — usando sessionStorage');
        usuario.nome             = sessao.nome;
        usuario.email            = userFirebase.email || '';
        usuario.startDate        = sessao.startDate        || new Date().toISOString().split('T')[0];
        usuario.impulsosVencidos = sessao.impulsosVencidos ?? 0;
        usuario.recaidas         = sessao.recaidas         ?? 0;
      } else {
        console.log('Perfil não encontrado, voltando para onboarding');
        window.location.href = 'onboarding.html';
        return;
      }
    }

    salvarSessao();
    window.lumoI18n?.aplicar(usuario.idioma);
    renderizarIndex();
    renderizarCompromisso();
    inicializarModalCompromisso();
    window.aplicarConfigFab?.(usuario.configFab);
    window.inicializarPush?.(userFirebase.uid);
    ocultarSplash();

    // "Recomeçar do zero" — modal de recaída na index
    const btnRecomecar = document.getElementById('btn-recomecar');
    if (btnRecomecar) {
      btnRecomecar.addEventListener('click', () => {
        registrarRecaida();
        const modal = document.getElementById('modal-recaida');
        if (modal && window.fecharModal) window.fecharModal(modal);
      });
    }
  });
});
