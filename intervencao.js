// intervencao.js v2.2 — Fluxo completo de intervenção de crise
// Requer: dados/perguntas.js, dados/lembretes.js, dados/acoes.js

(function () {

  // ── Estado do ciclo ──
  let primeiroCiclo   = true;
  let perguntasUsadas = [];
  let lembretesUsados = [];
  let acoesUsadas     = [];

  // ── Helpers: dados do usuário ──
  function carregarUsuario() {
    try { return JSON.parse(sessionStorage.getItem('usuario') || '{}'); }
    catch { return {}; }
  }

  function calcularDias(startDate) {
    if (!startDate) return 0;
    const agora  = new Date();
    const inicio = new Date(startDate);
    return Math.max(0, Math.floor((agora - inicio) / (1000 * 60 * 60 * 24)));
  }

  function calcularNivel(dias) {
    if (dias < 7)   return 'Soldado';
    if (dias < 14)  return 'Cabo';
    if (dias < 21)  return 'Sargento';
    if (dias < 30)  return 'Tenente';
    if (dias < 45)  return 'Capitão';
    if (dias < 60)  return 'Major';
    if (dias < 90)  return 'Coronel';
    if (dias < 120) return 'General';
    if (dias < 180) return 'Rei';
    return 'Monge';
  }

  function formatarData(data) {
    if (!data || isNaN(data)) return '';
    return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  }

  // ── Navegação ──
  function irParaStep(id) {
    document.querySelectorAll('.step-wrapper').forEach(el => {
      el.classList.remove('step--visible');
      el.classList.add('step--hidden');
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.remove('step--hidden');
      target.classList.add('step--visible');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Sorteio sem repetição ──
  function sortear(banco, usados) {
    const disponiveis = banco.filter(item => !usados.includes(item.id));
    if (disponiveis.length === 0) {
      usados.length = 0;
      return sortear(banco, usados);
    }
    const escolhido = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    usados.push(escolhido.id);
    return escolhido;
  }

  // ── Contexto do lembrete ──
  function aplicarContexto(template, usuario) {
    const dias  = calcularDias(usuario.startDate);
    const nivel = calcularNivel(dias);
    const dataCarta = usuario.carta?.criadaEm
      ? formatarData(new Date(usuario.carta.criadaEm))
      : '';
    return template
      .replace('{nome}',      usuario.nome    || '')
      .replace('{nivel}',     nivel)
      .replace('{dias}',      dias)
      .replace('{recaidas}',  (usuario.recaidas || 0) + 1)
      .replace('{carta}',     usuario.carta?.conteudo || '')
      .replace('{dataCarta}', dataCarta);
  }

  // ── Respiração ──
  function iniciarRespiracao() {
    const labelEl    = document.getElementById('breath-label');
    const sublabelEl = document.getElementById('breath-sublabel');
    const fillEl     = document.getElementById('breath-fill');
    const timerEl    = document.getElementById('breath-timer');
    const btnOk      = document.getElementById('btn-respiracao-ok');
    const btnPular   = document.getElementById('btn-pular-respiracao');

    if (!labelEl) return;

    function getFases() {
      const tr = window.t || (k => k);
      return [
        { label: tr('iv.respiracao.inspire'), sub: tr('iv.respiracao.sublabel') },
        { label: tr('iv.respiracao.segure'),  sub: tr('iv.respiracao.sublabel') },
        { label: tr('iv.respiracao.solte'),   sub: tr('iv.respiracao.sublabel') },
      ];
    }

    let tempoRestante = 30;
    let faseTick      = 0;
    let faseIndex     = 0;
    let FASES         = getFases();

    labelEl.textContent    = FASES[0].label;
    sublabelEl.textContent = FASES[0].sub;

    // Botão Pular aparece após 5s
    setTimeout(() => {
      if (btnPular) btnPular.style.display = 'block';
    }, 5000);

    const intervalo = setInterval(() => {
      tempoRestante--;
      faseTick++;

      // Progresso
      const pct = Math.round(((30 - tempoRestante) / 30) * 100);
      if (fillEl) fillEl.style.width = pct + '%';
      if (timerEl) timerEl.textContent = tempoRestante > 0
        ? tempoRestante + 's restantes'
        : 'Pronto.';

      // Ciclo de fase a cada 4s
      if (faseTick >= 4) {
        FASES     = getFases();
        faseTick  = 0;
        faseIndex = (faseIndex + 1) % FASES.length;
        labelEl.textContent    = FASES[faseIndex].label;
        sublabelEl.textContent = FASES[faseIndex].sub;
      }

      // Libera botão Continuar após 30s
      if (tempoRestante <= 0) {
        clearInterval(intervalo);
        if (btnOk) btnOk.style.display = 'block';
        if (btnPular) btnPular.style.display = 'none';
      }
    }, 1000);

    return intervalo;
  }

  // ── Ciclo: pergunta → lembrete → ação ──
  function iniciarCiclo() {
    const usuario  = carregarUsuario();
    const pergunta = sortear(getPERGUNTAS(), perguntasUsadas);

    // Primeiro ciclo: usar carta se existir
    let lembrete;
    if (primeiroCiclo && usuario.carta?.conteudo) {
      lembrete = getLEMBRETECARTA();
      lembretesUsados.push(lembrete.id);
    } else {
      lembrete = sortear(getLEMBRETES(), lembretesUsados);
    }
    primeiroCiclo = false;

    const acao = sortear(getACOES(), acoesUsadas);

    // Preencher pergunta
    const perguntaTextoEl = document.getElementById('pergunta-texto');
    const chipsEl         = document.getElementById('pergunta-chips');
    if (perguntaTextoEl) perguntaTextoEl.textContent = pergunta.texto;
    if (chipsEl) {
      chipsEl.innerHTML = '';
      pergunta.opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.className   = 'iv-chip';
        btn.textContent = opcao;
        btn.addEventListener('click', () => {
          chipsEl.querySelectorAll('.iv-chip').forEach(c => c.classList.remove('selected'));
          btn.classList.add('selected');
        });
        chipsEl.appendChild(btn);
      });
    }

    // Preencher lembrete
    const lembreteEl = document.getElementById('lembrete-texto');
    if (lembreteEl) lembreteEl.textContent = aplicarContexto(lembrete.template, usuario);

    // Preencher ação
    const acaoEl    = document.getElementById('acao-texto');
    const retornoEl = document.getElementById('acao-retorno');
    if (acaoEl)    acaoEl.textContent    = acao.texto;
    if (retornoEl) retornoEl.textContent = acao.retorno;

    irParaStep('step-pergunta');
  }

  // ── Modal de confronto ──
  function gerarMensagemConfronto(usuario) {
    const historico = usuario.historicoRecaidas || [];
    const dias      = calcularDias(usuario.startDate);
    const nome      = usuario.nome || '';

    let linhas = [nome + '.'];

    if (historico.length > 0) {
      historico.slice(-3).forEach(data => {
        linhas.push('Dia ' + formatarData(new Date(data)) + ' você recaiu.');
      });
      linhas.push('');
      linhas.push('Hoje é dia ' + dias + '. Você está forte.');
      linhas.push('Vai jogar ' + dias + ' dias fora?');
    } else {
      linhas.push('Você ainda não recaiu nenhuma vez.');
      linhas.push(dias + ' dias limpos.');
      linhas.push('Vai deixar isso acabar agora?');
    }

    return linhas;
  }

  function mostrarModalConfronto() {
    const usuario  = carregarUsuario();
    const linhas   = gerarMensagemConfronto(usuario);
    const msgEl    = document.getElementById('confronto-msg');
    const modal    = document.getElementById('modal-confronto');

    if (msgEl) {
      msgEl.textContent = '';
      const strong = document.createElement('strong');
      strong.textContent = linhas[0];
      msgEl.appendChild(strong);
      msgEl.appendChild(document.createTextNode('\\n' + linhas.slice(1).join('\\n')));
    }
    modal?.classList.remove('hidden');
  }

  // ── Registrar vitória ──
  function registrarVitoria() {
    const u = carregarUsuario();
    u.impulsosVencidos = (u.impulsosVencidos || 0) + 1;
    sessionStorage.setItem('usuario', JSON.stringify(u));

    if (window.lumo) {
      const { auth, db, doc, updateDoc, increment } = window.lumo;
      const uid = auth.currentUser?.uid;
      if (uid) {
        updateDoc(doc(db, 'usuarios', uid), {
          'progresso.impulsosVencidos': increment(1),
        }).catch(() => {});
      }
    }
  }

  // ── Registrar recaída ──
  function registrarRecaida() {
    const hoje = new Date().toISOString().split('T')[0];
    const u    = carregarUsuario();
    u.recaidas          = (u.recaidas || 0) + 1;
    u.startDate         = hoje;
    u.impulsosVencidos  = 0;
    u.historicoRecaidas = [...(u.historicoRecaidas || []), hoje];
    sessionStorage.setItem('usuario', JSON.stringify(u));

    if (window.lumo) {
      const { auth, db, doc, updateDoc, increment, arrayUnion } = window.lumo;
      const uid = auth.currentUser?.uid;
      if (uid) {
        updateDoc(doc(db, 'usuarios', uid), {
          'progresso.recaidas':           increment(1),
          'progresso.impulsosVencidos':   0,
          'progresso.sequenciaAtual':     0,
          'progresso.historicoRecaidas':  arrayUnion(hoje),
          'perfil.startDate':             hoje,
        }).catch(() => {});
      }
    }
  }

  // ── Navegar para index com fade ──
  function irParaIndex() {
    document.body.style.opacity    = '0';
    document.body.style.transition = 'opacity 0.2s ease';
    setTimeout(() => { window.location.href = 'index.html'; }, 180);
  }

  // ── Inicialização ──
  document.addEventListener('DOMContentLoaded', () => {

    // Botão fechar → index
    document.getElementById('btn-fechar-iv')?.addEventListener('click', (e) => {
      e.preventDefault();
      irParaIndex();
    });

    // RESPIRAÇÃO
    iniciarRespiracao();
    document.getElementById('btn-respiracao-ok')?.addEventListener('click', () => {
      irParaStep('step-escolha');
    });
    document.getElementById('btn-pular-respiracao')?.addEventListener('click', () => {
      irParaStep('step-escolha');
    });

    // ESCOLHA
    document.getElementById('choice-rapida')?.addEventListener('click', () => {
      iniciarCiclo();
    });

    // PERGUNTA
    document.getElementById('btn-pergunta-ok')?.addEventListener('click', () => {
      irParaStep('step-lembrete');
    });

    // LEMBRETE
    document.getElementById('btn-lembrete-ok')?.addEventListener('click', () => {
      irParaStep('step-acao');
    });

    // AÇÃO
    document.getElementById('btn-acao-ok')?.addEventListener('click', () => {
      irParaStep('step-checkin');
    });

    // CHECK-IN: estou melhor
    document.getElementById('btn-checkin-ok')?.addEventListener('click', () => {
      registrarVitoria();
      irParaStep('step-vitoria');
      setTimeout(irParaIndex, 1800);
    });

    // CHECK-IN: preciso de mais ajuda → novo ciclo
    document.getElementById('btn-checkin-help')?.addEventListener('click', () => {
      iniciarCiclo();
    });

    // CHECK-IN: tive uma recaída
    document.getElementById('btn-checkin-recaida')?.addEventListener('click', () => {
      mostrarModalConfronto();
    });

    // CONFRONTO: recomeçar do zero
    document.getElementById('btn-recomecar')?.addEventListener('click', () => {
      registrarRecaida();
      document.getElementById('modal-confronto')?.classList.add('hidden');
      irParaIndex();
    });

    // CONFRONTO: não vou recair → novo ciclo
    document.getElementById('btn-nao-recair')?.addEventListener('click', () => {
      document.getElementById('modal-confronto')?.classList.add('hidden');
      iniciarCiclo();
    });

    // Discord: visível apenas para pagantes
    const usuario = carregarUsuario();
    if (usuario.pago === true) {
      const discordBtn = document.getElementById('choice-discord');
      if (discordBtn) discordBtn.style.display = 'flex';
    }

  });

})();
