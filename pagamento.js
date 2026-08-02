// pagamento.js — Fragmento 7.4 (Google Pay / Apple Pay via Stripe.js + PIX)
// Google Pay e Apple Pay via Stripe PaymentRequest Button (sem redirect externo).
// PIX via Cloud Function criarPagamentoPix + polling.

(function () {
  'use strict';

  // ── Stripe publishable key ────────────────────────────────────────────────
  // SUBSTITUIR pela chave do Stripe Dashboard → Developers → API Keys
  // Começa com pk_test_ (modo teste) ou pk_live_ (produção)
  const STRIPE_PK = 'pk_test_SUBSTITUIR';

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

  // ── Inicializar paywall ───────────────────────────────────────────────────
  function inicializar() {
    const lumo = window.lumo;

    lumo.onAuthStateChanged(lumo.auth, async function (user) {
      if (!user) {
        window.location.replace('onboarding.html');
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
        inicializarWallet(lumo);

      } catch (_) {
        revelarPaywall();
        wiredRecovery(lumo);
        inicializarWallet(lumo);
      }
    });
  }

  // ── Google Pay / Apple Pay via Stripe.js PaymentRequest Button ───────────
  function inicializarWallet(lumo) {
    if (!window.Stripe || STRIPE_PK === 'pk_test_SUBSTITUIR') return;

    var stripe          = window.Stripe(STRIPE_PK);
    var selectedPlan    = 'anual'; // padrão
    var erroEl          = document.getElementById('erro-checkout');

    var paymentRequest = stripe.paymentRequest({
      country:            'BR',
      currency:           'brl',
      total:              { label: 'LUMO Pro Anual', amount: 11700 },
      requestPayerName:   false,
      requestPayerEmail:  false,
    });

    var elements  = stripe.elements();
    var prButton  = elements.create('paymentRequestButton', {
      paymentRequest,
      style: {
        paymentRequestButton: { type: 'buy', theme: 'dark', height: '54px' },
      },
    });

    // Mostra o botão só se o dispositivo tiver Google Pay ou Apple Pay
    paymentRequest.canMakePayment().then(function (result) {
      if (!result) return;
      prButton.mount('#payment-request-button');
      var secao = document.getElementById('secao-wallet');
      if (secao) secao.classList.remove('hidden');
    });

    // Troca de plano — atualiza amount mostrado na wallet sheet
    ['anual', 'mensal'].forEach(function (plano) {
      var card = document.getElementById('card-' + plano);
      if (!card) return;
      card.addEventListener('click', function () {
        selectedPlan = plano;
        paymentRequest.update({
          total: {
            label:  plano === 'anual' ? 'LUMO Pro Anual' : 'LUMO Pro Mensal',
            amount: plano === 'anual' ? 11700 : 1199,
          },
        });
      });
    });

    // Evento disparado quando o usuário confirma o pagamento na wallet
    paymentRequest.on('paymentmethod', async function (ev) {
      if (erroEl) erroEl.style.display = 'none';

      // 1. Cria PaymentIntent no servidor
      var clientSecret;
      try {
        var criarFn = lumo.httpsCallable(lumo.functions, 'criarPagamentoWallet');
        var res     = await criarFn({ plano: selectedPlan });
        clientSecret = res.data.clientSecret;
      } catch (err) {
        ev.complete('fail');
        if (erroEl) {
          erroEl.textContent   = 'Erro ao iniciar pagamento. Tente novamente.';
          erroEl.style.display = 'block';
        }
        return;
      }

      // 2. Confirma sem tratar 3DS neste momento (handleActions: false)
      var confirmResult = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false }
      );

      if (confirmResult.error) {
        ev.complete('fail');
        if (erroEl) {
          erroEl.textContent   = confirmResult.error.message || 'Pagamento recusado.';
          erroEl.style.display = 'block';
        }
        return;
      }

      ev.complete('success');

      // 3DS se necessário
      if (confirmResult.paymentIntent.status === 'requires_action') {
        var actionResult = await stripe.confirmCardPayment(clientSecret);
        if (actionResult.error) {
          if (erroEl) {
            erroEl.textContent   = actionResult.error.message || 'Autenticação necessária — tente PIX.';
            erroEl.style.display = 'block';
          }
          return;
        }
      }

      // 3. Ativa Pro no Firestore imediatamente (sem aguardar webhook)
      try {
        var confirmarFn = lumo.httpsCallable(lumo.functions, 'confirmarPagamentoStripe');
        await confirmarFn({
          paymentIntentId: confirmResult.paymentIntent.id,
          plano:           selectedPlan,
        });
        window.location.replace('index.html');
      } catch (_) {
        if (erroEl) {
          erroEl.textContent   = 'Pagamento processado! Se o acesso não abrir em alguns segundos, feche e entre novamente.';
          erroEl.style.display = 'block';
        }
        // Tenta redirecionar mesmo assim após 3s — webhook pode ter ativado
        setTimeout(function () { window.location.replace('index.html'); }, 3000);
      }
    });
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

  // ── Wire-up ───────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-logout-paywall')?.addEventListener('click', function () {
      if (window.logout) window.logout();
    });

    // Seleção de plano — destaque visual ao trocar card
    ['anual', 'mensal'].forEach(function (plano) {
      document.getElementById('card-' + plano)?.addEventListener('click', function () {
        document.getElementById('card-anual')?.classList.toggle('plan-card--destaque', plano === 'anual');
        document.getElementById('card-mensal')?.classList.toggle('plan-card--destaque', plano === 'mensal');
      });
    });

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
