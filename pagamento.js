// pagamento.js — Fragmento 7.3
// Paywall: verifica acesso via CF, exibe estado correto, recovery de trial.
// RevenueCat purchases-js integrado para checkout via Stripe.

(function () {
  'use strict';

  // ── Constantes RevenueCat ─────────────────────────────────────────────────
  const RC_KEY         = 'strp_sb_MiOlkXfcKatnRgaZDFrOBLBR';
  const RC_ENTITLEMENT = 'lumo Pro';

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

  // ── Estado RevenueCat ─────────────────────────────────────────────────────
  let rcInstance = null;
  let pkgAnual   = null;
  let pkgMensal  = null;

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

  // ── Aguarda window.Purchases (RC SDK carregado como módulo) ──────────────
  function aguardarPurchases(cb) {
    if (window.Purchases) { cb(); return; }
    window.addEventListener('rc-pronto', cb, { once: true });
    setTimeout(cb, 5000); // timeout de segurança — não travar para sempre
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
    // trialVirgem === false → hero padrão (trial encerrado), só planos
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

          const cAnual  = document.getElementById('card-anual');
          const cMensal = document.getElementById('card-mensal');
          const bAnual  = document.getElementById('btn-assinar-anual');
          const bMensal = document.getElementById('btn-assinar-mensal');
          if (cAnual)  cAnual.style.pointerEvents  = 'none';
          if (cMensal) cMensal.style.pointerEvents = 'none';
          if (bAnual)  bAnual.disabled  = true;
          if (bMensal) bMensal.disabled = true;

          setTimeout(function () {
            window.location.replace('index.html');
          }, 1500);
        } else {
          // trial-ja-usado ou email-ja-usou-trial → esconder seção, mostrar só planos
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

  // ── Inicializar RevenueCat em background ──────────────────────────────────
  async function inicializarRC(uid) {
    await new Promise(function (resolve) { aguardarPurchases(resolve); });
    if (!window.Purchases) return;

    try {
      rcInstance = window.Purchases.configure(RC_KEY, uid);
      const offerings = await rcInstance.getOfferings();
      const pkgs      = offerings.current?.availablePackages ?? [];

      pkgAnual  = pkgs.find(function (p) {
        return p.packageType === 'ANNUAL' || p.identifier === '$rc_annual';
      }) ?? pkgs.find(function (p) {
        return p.packageType === 'YEARLY' || p.identifier === '$rc_yearly';
      }) ?? (pkgs.length > 0 ? pkgs[0] : null);

      pkgMensal = pkgs.find(function (p) {
        return p.packageType === 'MONTHLY' || p.identifier === '$rc_monthly';
      }) ?? (pkgs.length > 1 ? pkgs[1] : null);

      // Detectar retorno de redirect Stripe: se entitlement já ativo, registrar e entrar
      const info = await rcInstance.getCustomerInfo();
      if (info?.entitlements?.active?.[RC_ENTITLEMENT]) {
        await ativarAcesso('desconhecido');
      }
    } catch (e) {
      console.warn('[RC] inicialização:', e?.message ?? e);
    }
  }

  // ── Registrar pagamento no Firestore via CF ───────────────────────────────
  async function ativarAcesso(plano) {
    try {
      const lumo     = window.lumo;
      const ativarFn = lumo.httpsCallable(lumo.functions, 'ativarPagamento');
      await ativarFn({ plano });
    } catch (_) {
      // Falha na CF — redirecionar mesmo assim; guard.js verificará no acesso
    }
    window.location.replace('index.html');
  }

  // ── Executar checkout RevenueCat/Stripe ───────────────────────────────────
  async function executarCheckout(pkg, plano) {
    const btnAnual  = document.getElementById('btn-assinar-anual');
    const btnMensal = document.getElementById('btn-assinar-mensal');
    const erroEl    = document.getElementById('erro-checkout');

    if (btnAnual)  btnAnual.disabled  = true;
    if (btnMensal) btnMensal.disabled = true;
    if (erroEl)    erroEl.style.display = 'none';

    // Dar feedback visual que o usuário está sendo redirecionado
    const btnClicado = plano === 'anual' ? btnAnual : btnMensal;
    const textoOriginal = btnClicado ? btnClicado.textContent : '';
    if (btnClicado) {
      btnClicado.textContent = window.t?.('pay.redirecionando') || 'Redirecionando para pagamento seguro...';
    }

    try {
      const { customerInfo } = await rcInstance.purchasePackage(pkg);

      if (customerInfo?.entitlements?.active?.[RC_ENTITLEMENT]) {
        await ativarAcesso(plano);
        return;
      }

      // Entitlement pode demorar a propagar — verificar via CF como fallback
      const lumo        = window.lumo;
      const verificarFn = lumo.httpsCallable(lumo.functions, 'verificarAcesso');
      const resultado   = await verificarFn();
      if (resultado.data?.acesso) {
        window.location.replace('index.html');
      } else {
        throw new Error('entitlement-pendente');
      }

    } catch (err) {
      const cancelado = err?.errorCode === 'PURCHASE_CANCELLED'
                     || err?.code      === 'PURCHASE_CANCELLED'
                     || err?.message?.toLowerCase().includes('cancel')
                     || err?.userCancelled === true;

      if (!cancelado && erroEl) {
        erroEl.textContent   = window.t?.('pay.erro-pagamento') || 'Não foi possível processar o pagamento. Tente novamente.';
        erroEl.style.display = 'block';
      }
      if (btnAnual)  btnAnual.disabled  = false;
      if (btnMensal) btnMensal.disabled = false;
      if (btnClicado && textoOriginal) btnClicado.textContent = textoOriginal;
    }
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
          // Usuário já tem acesso (trial ativo ou pago) — redirecionar
          window.location.replace('index.html');
          return;
        }

        // Sem acesso — exibir paywall no estado correto
        const trialVirgem = resultado.data?.trialVirgem === true;

        // Carregar dados do usuário para senso de perda (Firestore ou sessionStorage)
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

        // RC em background — não bloqueia exibição do paywall
        inicializarRC(user.uid);

      } catch (_) {
        // CF indisponível — mostrar paywall de forma segura (só planos)
        revelarPaywall();
        wiredRecovery(lumo);
        const currentUser = lumo.auth.currentUser;
        if (currentUser) inicializarRC(currentUser.uid);
      }
    });
  }

  // ── Wire-up: logout e cards ───────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-logout-paywall')?.addEventListener('click', function () {
      if (window.logout) window.logout();
    });

    // Clique nos cards redireciona para o botão correspondente
    document.getElementById('card-anual')?.addEventListener('click', function () {
      document.getElementById('btn-assinar-anual')?.click();
    });
    document.getElementById('card-mensal')?.addEventListener('click', function () {
      document.getElementById('btn-assinar-mensal')?.click();
    });

    // Botões de assinatura
    document.getElementById('btn-assinar-anual')?.addEventListener('click', function () {
      iniciarCheckout('anual');
    });
    document.getElementById('btn-assinar-mensal')?.addEventListener('click', function () {
      iniciarCheckout('mensal');
    });

    aguardarLumo(inicializar);
  });

  // ── Checkout via RevenueCat ───────────────────────────────────────────────
  function iniciarCheckout(plano) {
    const pkg = plano === 'anual' ? pkgAnual : pkgMensal;

    if (!rcInstance || !pkg) {
      const erroEl = document.getElementById('erro-checkout');
      if (erroEl) {
        erroEl.textContent   = window.t?.('pay.erro-rc') || 'Pagamento indisponível. Aguarde e tente novamente.';
        erroEl.style.display = 'block';
      }
      return;
    }

    executarCheckout(pkg, plano);
  }

})();
