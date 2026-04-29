// pagamento.js — Fragmento 4.8
// Tela de paywall: logout + wire-up dos botões de assinatura.
// Integração Mercado Pago: Fase 7.

document.addEventListener('DOMContentLoaded', () => {

  // ── Logout ──
  const btnLogout = document.getElementById('btn-logout-paywall');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (window.logout) window.logout();
    });
  }

  // ── Botões de assinatura (Fase 7 vai substituir por links do Mercado Pago) ──
  const btnAnual   = document.getElementById('btn-assinar-anual');
  const btnMensal  = document.getElementById('btn-assinar-mensal');

  function iniciarCheckout(plano) {
    // TODO (Fase 7): redirecionar para link de pagamento do Mercado Pago
    // Ex: window.location.href = window.lumo?.pagamentoLink?.[plano] ?? '#';
    alert(`Pagamento em breve! Plano: ${plano}`);
  }

  if (btnAnual)  btnAnual.addEventListener('click',  () => iniciarCheckout('anual'));
  if (btnMensal) btnMensal.addEventListener('click', () => iniciarCheckout('mensal'));

  // ── Destaque visual ao clicar no card ──
  document.getElementById('card-anual')?.addEventListener('click', () => {
    btnAnual?.click();
  });
  document.getElementById('card-mensal')?.addEventListener('click', () => {
    btnMensal?.click();
  });

});
