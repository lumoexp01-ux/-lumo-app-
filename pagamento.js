// pagamento.js — Fragmento 7.2
// Paywall: verifica acesso via CF, exibe estado correto, recovery de trial.

(function () {
  'use strict';

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
      if (++t > 60) clearInterval(id); // 3s timeout — não travar para sempre
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
          
          // Desativar cards e botões para evitar checkout acidental
          const cAnual = document.getElementById('card-anual');
          const cMensal = document.getElementById('card-mensal');
          const bAnual = document.getElementById('btn-assinar-anual');
          const bMensal = document.getElementById('btn-assinar-mensal');
          if (cAnual) cAnual.style.pointerEvents = 'none';
          if (cMensal) cMensal.style.pointerEvents = 'none';
          if (bAnual) bAnual.disabled = true;
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
          erroEl.textContent  = window.t?.('pay.recuperar-erro') || 'Não foi possível ativar. Verifique sua conexão.';
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

      } catch (_) {
        // CF indisponível — mostrar paywall de forma segura (só planos)
        revelarPaywall();
        wiredRecovery(lumo);
      }
    });
  }

  // ── Wire-up: logout ───────────────────────────────────────────────────────
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

    // Botões de assinatura — integração RevenueCat no Fragmento 7.3
    document.getElementById('btn-assinar-anual')?.addEventListener('click', function () {
      iniciarCheckout('anual');
    });
    document.getElementById('btn-assinar-mensal')?.addEventListener('click', function () {
      iniciarCheckout('mensal');
    });

    aguardarLumo(inicializar);
  });

  // ── Checkout — substituído por RevenueCat no Fragmento 7.3 ───────────────
  function iniciarCheckout(plano) {
    // TODO 7.3: iniciar purchasePackage() do RevenueCat aqui
    console.log('Checkout pendente — Fragmento 7.3:', plano);
  }

})();
