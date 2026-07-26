// pagamento.js — Fragmento 7.3 (rev. Web Purchase Link)
// Checkout via redirect para RC Web Purchase Link — sem SDK no browser.

(function () {
  'use strict';

  // ── URL de compra RevenueCat ──────────────────────────────────────────────
  const RC_PURCHASE_URL = 'https://pay.rev.cat/sandbox/bzvefsatehwoqmrs/';

  // ── Cálculo de nível inline (sem depender de app.js) ─────────────────────
  const NIVEIS = [
    { nome: 'Soldado',  ate: 6   },
    { nome: 'Cabo',     ate: 13  },
    { nome: 'Sargento', ate: 20  },
    { nome: 'Tenente',  ate: 29  },
    { nome: 'Capitão',  ate: 44  },
    { nome: 'Major',    ate: 59  },
    { nome: 'Coronel',  ate: 89  },
    { nome: 'General',  ate: 119 },
    { nome: 'Rei',      ate: 179 },
    { nome: 'Monge',    ate: Infinity },
  ];

  function calcularDiasLocal(startDate) {
    if (!startDate) return 0;
    const ms = Date.now() - new Date(startDate + 'T12:00:00').getTime();
    return Math.max(0, Math.floor(ms / 86400000));
  }

  function calcularNivelLocal(dias) {
    return NIVEIS.find(n => dias <= n.ate) || NIVEIS[NIVEIS.length - 1];
  }

  // ── Recuperar deviceId do localStorage ───────────────────────────────────
  function obterDeviceId() {
    try { return localStorage.getItem('lumo-device-id') || ''; } catch (_) { return ''; }
  }

  // ── Aguarda window.lumo estar disponível (firebase.js é módulo assíncrono) ─
  function aguardarLumo(cb) {
    if (window.lumo?.auth) { cb(); return; }
    let t = 0;
    const id = setInterval(function () {
      if (window.lumo?.auth) { clearInterval(id); cb(); return; }
      if (++t > 60) clearInterval(id); // 3s timeout
    }, 50);
  }

  // ── Remover overlay de carregamento ──────────────────────────────────────
  function revelarPaywall() {
    const el = document.getElementById('paywall-loading');
    if (!el) return;
    el.classList.add('fade-out');
    setTimeout(function () { el.remove(); }, 220);
  }

  // ── Renderizar contexto do usuário (senso de perda) ──────────────────────
  function renderizarContexto(dados) {
    if (!dados?.startDate) return;
    const dias   = calcularDiasLocal(dados.startDate);
    const nivel  = calcularNivelLocal(dias);
    const nomeT  = window.t ? window.t('nivel.' + nivel.nome) : nivel.nome;
    const msg    = window.t
      ? window.t('pay.nivel-msg', { nivel: nomeT, dias })
      : nomeT + ' · ' + dias + ' dias';

    const ctxEl  = document.getElementById('paywall-user-ctx');
    const textEl = document.getElementById('paywall-user-ctx-text');
    if (ctxEl && textEl && dias > 0) {
      textEl.textContent = msg;
      ctxEl.classList.remove('hidden');
    }
  }

  // ── Adaptar hero conforme o estado do pagamento ───────────────────────────
  function adaptarHero(trialVirgem) {
    const badgeEl = document.getElementById('paywall-badge');
    const subEl   = document.getElementById('paywall-sub');

    if (trialVirgem) {
      if (badgeEl) badgeEl.textContent = window.t?.('pay.badge-virgem') || 'Período gratuito disponível';
      if (subEl)   subEl.textContent   = window.t?.('pay.sub-virgem')   || 'Houve um problema ao ativar seu período gratuito.';
      const section = document.getElementById('section-trial-virgem');
      if (section) section.classList.remove('hidden');
    }
  }

  // ── Wire-up do botão de recuperação de trial ─────────────────────────────
  function wiredRecovery(lumo) {
    const btn     = document.getElementById('btn-recuperar-trial');
    const erroEl  = document.getElementById('recover-erro');
    if (!btn) return;

    btn.addEventListener('click', async function () {
      btn.disabled    = true;
      btn.textContent = window.t?.('pay.recuperando') || 'Ativando...';
      if (erroEl) erroEl.style.display = 'none';

      try {
        const ativarFn  = lumo.httpsCallable(lumo.functions, 'ativarTrial');
        const resultado = await ativarFn({ deviceId: obterDeviceId() });

        if (resultado.data?.sucesso) {
          btn.textContent = window.t?.('pay.recuperar-ok') || 'Período gratuito ativado! Entrando...';

          const bAssinar  = document.getElementById('btn-assinar');
          if (bAssinar)  bAssinar.disabled  = true;

          setTimeout(function () {
            window.location.replace('index.html');
          }, 1500);
        } else {
          const section = document.getElementById('section-trial-virgem');
          if (section) section.classList.add('hidden');
          adaptarHero(false);
          revelarPaywall();
        }
      } catch (_) {
        btn.disabled    = false;
        btn.textContent = window.t?.('pay.btn-recuperar') || 'Ativar meus 7 dias grátis';
        if (erroEl) {
          erroEl.textContent   = window.t?.('pay.recuperar-erro') || 'Não foi possível ativar. Verifique sua conexão.';
          erroEl.style.display = 'block';
        }
      }
    });
  }

  // ── Verificar retorno do RC após pagamento bem-sucedido ───────────────────
  // Chamado quando URL tem ?status=sucesso (redirect do RC após checkout)
  async function verificarRetornoRC(lumo) {
    const erroEl = document.getElementById('erro-checkout');

    try {
      const ativarFn = lumo.httpsCallable(lumo.functions, 'ativarPagamento');
      const resultado = await ativarFn({ plano: 'web' });
      if (resultado.data?.sucesso) {
        window.location.replace('index.html');
        return true;
      }
    } catch (_) {
      // CF retornou erro (entitlement não confirmado pelo RC)
    }

    if (erroEl) {
      erroEl.textContent   = window.t?.('pay.erro-pagamento') || 'Pagamento não confirmado. Se o problema persistir, entre em contato com o suporte.';
      erroEl.style.display = 'block';
    }
    return false;
  }

  // ── Inicializar paywall ───────────────────────────────────────────────────
  function inicializar() {
    const lumo = window.lumo;

    lumo.onAuthStateChanged(lumo.auth, async function (user) {
      if (!user) {
        window.location.replace('onboarding.html');
        return;
      }

      // Retorno do RC após pagamento: ?status=sucesso na URL
      const params = new URLSearchParams(window.location.search);
      if (params.get('status') === 'sucesso') {
        // Limpar parâmetro da URL antes de qualquer coisa
        window.history.replaceState({}, '', 'pagamento.html');
        const ativado = await verificarRetornoRC(lumo);
        if (ativado) return; // redirect para index.html já iniciado
        // CF falhou — mostrar paywall com mensagem de erro já exibida
        revelarPaywall();
        wiredRecovery(lumo);
        return;
      }

      // Verificar acesso via Cloud Function
      try {
        const verificarFn = lumo.httpsCallable(lumo.functions, 'verificarAcesso');
        const resultado   = await verificarFn();

        if (resultado.data?.acesso) {
          window.location.replace('index.html');
          return;
        }

        const trialVirgem = resultado.data?.trialVirgem === true;

        let dadosUsuario = null;
        try {
          const snap = await lumo.getDoc(lumo.doc(lumo.db, 'usuarios', user.uid));
          if (snap.exists()) dadosUsuario = snap.data().perfil ?? null;
        } catch (_) {
          const cached = sessionStorage.getItem('usuario');
          if (cached) { try { dadosUsuario = JSON.parse(cached); } catch (_) {} }
        }

        renderizarContexto(dadosUsuario);
        adaptarHero(trialVirgem);
        wiredRecovery(lumo);
        revelarPaywall();

      } catch (_) {
        revelarPaywall();
        wiredRecovery(lumo);
      }
    });
  }

  // ── Checkout: redirect para RC Web Purchase Link ──────────────────────────
  function iniciarCheckout() {
    const user = window.lumo?.auth?.currentUser;
    
    if (!user) {
      alert("Erro interno: Autenticação não carregada. Por favor, recarregue a página (Ctrl + F5).");
      return;
    }

    const btnAssinar = document.getElementById('btn-assinar');
    if (btnAssinar) {
      // Salvar texto original (feedback de loading)
      btnAssinar.dataset.textoOriginal = btnAssinar.textContent;
      btnAssinar.textContent = window.t?.('pay.redirecionando') || 'Redirecionando...';
      btnAssinar.disabled = true;
    }

    const erroEl = document.getElementById('erro-checkout');
    if (erroEl) erroEl.style.display = 'none';

    // Abre checkout RC em nova aba — _user_id= como segmento de path (sem ?)
    // O RC armazena o subscriber com ID "_user_id=FIREBASE_UID"
    const url = RC_PURCHASE_URL + '_user_id=' + encodeURIComponent(user.uid);
    window.open(url, '_blank');

    // Restaurar botão (página continua aberta)
    if (btnAssinar) {
      setTimeout(function () {
        btnAssinar.textContent = btnAssinar.dataset.textoOriginal || 'Ver Planos e Assinar';
        btnAssinar.disabled = false;
      }, 1500);
    }
  }

  // ── PIX — estado interno ──────────────────────────────────────────────────
  var _pixPollingId = null;
  var _pixTimerId   = null;
  var _pixCode      = '';

  function abrirModalPix() {
    const overlay = document.getElementById('pix-overlay');
    if (!overlay) return;
    // Reset para step 1
    document.getElementById('pix-step-plano').classList.remove('hidden');
    document.getElementById('pix-step-qr').classList.remove('active');
    document.getElementById('pix-erro-plano').style.display = 'none';
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function fecharModalPix() {
    const overlay = document.getElementById('pix-overlay');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
    clearInterval(_pixPollingId);
    clearInterval(_pixTimerId);
    _pixPollingId = null;
    _pixTimerId   = null;
    _pixCode      = '';
  }

  function mostrarQRCode(dados) {
    // Esconde step 1, mostra step 2
    document.getElementById('pix-step-plano').classList.add('hidden');
    const stepQr = document.getElementById('pix-step-qr');
    stepQr.classList.add('active');

    const spinner  = document.getElementById('pix-spinner');
    const qrImg    = document.getElementById('pix-qr-img');
    const timerEl  = document.getElementById('pix-timer');
    const copyBtn  = document.getElementById('pix-copy');
    const waiting  = document.getElementById('pix-waiting');
    const erroEl   = document.getElementById('pix-erro-qr');

    if (spinner)  spinner.style.display  = 'none';
    if (qrImg)  { qrImg.src = dados.pixQrUrl; qrImg.style.display = 'block'; }
    if (timerEl)  timerEl.style.display  = 'block';
    if (copyBtn)  copyBtn.style.display  = 'block';
    if (waiting)  waiting.style.display  = 'flex';
    if (erroEl)   erroEl.style.display   = 'none';

    _pixCode = dados.pixCode;

    iniciarTimer(dados.expiresAt);
    iniciarPollingPix();
  }

  function iniciarTimer(expiresAt) {
    clearInterval(_pixTimerId);
    const countdownEl = document.getElementById('pix-countdown');
    if (!countdownEl) return;

    function tick() {
      const restante = Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
      const m = Math.floor(restante / 60).toString().padStart(2, '0');
      const s = (restante % 60).toString().padStart(2, '0');
      countdownEl.textContent = m + ':' + s;
      if (restante === 0) {
        clearInterval(_pixTimerId);
        clearInterval(_pixPollingId);
        const erroEl = document.getElementById('pix-erro-qr');
        if (erroEl) {
          erroEl.textContent   = 'O QR Code expirou. Feche e tente novamente.';
          erroEl.style.display = 'block';
        }
        const waiting = document.getElementById('pix-waiting');
        if (waiting) waiting.style.display = 'none';
      }
    }
    tick();
    _pixTimerId = setInterval(tick, 1000);
  }

  function iniciarPollingPix() {
    clearInterval(_pixPollingId);
    const lumo = window.lumo;
    if (!lumo) return;

    _pixPollingId = setInterval(async function () {
      try {
        const verificarFn = lumo.httpsCallable(lumo.functions, 'verificarAcesso');
        const resultado   = await verificarFn();
        if (resultado.data?.acesso) {
          clearInterval(_pixPollingId);
          clearInterval(_pixTimerId);
          // Pagamento confirmado!
          const waiting = document.getElementById('pix-waiting');
          if (waiting) waiting.innerHTML = '<span style="color:#00c87a;font-weight:700">✓ Pagamento confirmado! Entrando...</span>';
          setTimeout(function () {
            window.location.replace('index.html');
          }, 1200);
        }
      } catch (_) {
        // Falha de rede — silencioso, tenta na próxima iteração
      }
    }, 5000);
  }

  async function selecionarPlanoPix(plano) {
    const erroEl   = document.getElementById('pix-erro-plano');
    const btns     = document.querySelectorAll('.pix-plan-btn');
    const lumo     = window.lumo;

    if (!lumo?.auth?.currentUser) return;

    btns.forEach(function (b) { b.disabled = true; });
    if (erroEl) erroEl.style.display = 'none';

    // Mostra step QR com spinner
    document.getElementById('pix-step-plano').classList.add('hidden');
    const stepQr = document.getElementById('pix-step-qr');
    stepQr.classList.add('active');
    const spinner = document.getElementById('pix-spinner');
    if (spinner) spinner.style.display = 'block';

    try {
      const criarFn  = lumo.httpsCallable(lumo.functions, 'criarPagamentoPix');
      const resultado = await criarFn({ plano });
      mostrarQRCode(resultado.data);
    } catch (err) {
      // Volta para step 1 e mostra erro
      stepQr.classList.remove('active');
      document.getElementById('pix-step-plano').classList.remove('hidden');
      btns.forEach(function (b) { b.disabled = false; });
      if (erroEl) {
        erroEl.textContent   = 'Não foi possível gerar o PIX. Verifique sua conexão.';
        erroEl.style.display = 'block';
      }
      console.error('[pix] erro ao criar PaymentIntent:', err);
    }
  }

  // ── Wire-up: logout e cards ───────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-logout-paywall')?.addEventListener('click', function () {
      if (window.logout) window.logout();
    });

    document.getElementById('btn-assinar')?.addEventListener('click', iniciarCheckout);

    // PIX
    document.getElementById('btn-pix')?.addEventListener('click', abrirModalPix);
    document.getElementById('pix-fechar')?.addEventListener('click', fecharModalPix);
    document.getElementById('pix-overlay')?.addEventListener('click', function (e) {
      if (e.target === e.currentTarget) fecharModalPix();
    });
    document.getElementById('pix-btn-anual')?.addEventListener('click', function () {
      selecionarPlanoPix('anual');
    });
    document.getElementById('pix-btn-mensal')?.addEventListener('click', function () {
      selecionarPlanoPix('mensal');
    });
    document.getElementById('pix-copy')?.addEventListener('click', function () {
      if (!_pixCode) return;
      navigator.clipboard.writeText(_pixCode).then(function () {
        const btn = document.getElementById('pix-copy');
        if (btn) {
          const orig = btn.textContent;
          btn.textContent = '✓ Código copiado!';
          setTimeout(function () { btn.textContent = orig; }, 2000);
        }
      }).catch(function () {
        // Fallback para browsers sem clipboard API
        const ta = document.createElement('textarea');
        ta.value = _pixCode;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
    });

    aguardarLumo(inicializar);
  });

})();
