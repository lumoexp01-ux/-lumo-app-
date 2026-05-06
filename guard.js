// guard.js — Fragmento 7.0
// Verifica acesso pago/trial via Cloud Function (nunca confia no frontend).
// Incluir em TODAS as telas protegidas APÓS firebase.js:
//   <script src="guard.js"></script>
// NÃO incluir em: onboarding.html, pagamento.html

(function () {
  'use strict';

  // Páginas que não precisam de guard (não adicionar guard.js nelas)
  const PAGINAS_LIVRES = ['onboarding.html', 'pagamento.html'];
  const paginaAtual   = window.location.pathname.split('/').pop() || 'index.html';
  if (PAGINAS_LIVRES.some(p => paginaAtual.includes(p))) return;

  // Aguarda window.lumo estar disponível com functions + httpsCallable
  function aguardarLumo(tentativas) {
    tentativas = tentativas || 0;
    if (tentativas > 40) return; // 2 segundos de timeout — falha silenciosa
    if (!window.lumo?.auth || !window.lumo?.functions || !window.lumo?.httpsCallable) {
      setTimeout(function () { aguardarLumo(tentativas + 1); }, 50);
      return;
    }
    iniciarGuard();
  }

  function iniciarGuard() {
    var lumo = window.lumo;

    lumo.onAuthStateChanged(lumo.auth, function (user) {
      // Sem usuário = auth guard das próprias páginas cuida do redirect
      if (!user) return;

      var verificarFn = lumo.httpsCallable(lumo.functions, 'verificarAcesso');
      verificarFn()
        .then(function (resultado) {
          if (!resultado.data || !resultado.data.acesso) {
            window.location.replace('pagamento.html');
          }
          // acesso === true → app segue normalmente
        })
        .catch(function () {
          // Falha de rede não bloqueia o app — Firebase Auth já protege os dados.
          // O campo pagamento no Firestore está bloqueado por regras de segurança.
          console.log('Guard: verificação temporariamente indisponível');
        });
    });
  }

  // Iniciar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { aguardarLumo(0); });
  } else {
    aguardarLumo(0);
  }
})();
