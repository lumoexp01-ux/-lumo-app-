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

    // Redireciona para RC com o UID do usuário — RC atribui o entitlement ao UID correto
    const url = RC_PURCHASE_URL + '?app_user_id=' + encodeURIComponent(user.uid);
    
    // Fallback de segurança para garantir o redirecionamento
    setTimeout(() => {
      window.location.assign(url);
    }, 100);
  }

  // ── Wire-up: logout e cards ───────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-logout-paywall')?.addEventListener('click', function () {
      if (window.logout) window.logout();
    });

    document.getElementById('btn-assinar')?.addEventListener('click', iniciarCheckout);

    aguardarLumo(inicializar);
  });

})();
