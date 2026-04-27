// modals.js — Abertura e fechamento de modais do LUMO
// Responsabilidade: abrir modais, fechar via overlay/cancelar, animação, trava de scroll.
// NÃO trata btn-venceu nem btn-recomecar — esses têm lógica de negócio em app.js.

document.addEventListener('DOMContentLoaded', () => {

  // ── Helpers expostos globalmente para que app.js possa chamar ──
  window.abrirModal = function (overlayEl) {
    overlayEl.classList.remove('hidden');
    overlayEl.style.opacity = '0';
    requestAnimationFrame(() => {
      overlayEl.style.transition = 'opacity 0.2s ease';
      overlayEl.style.opacity = '1';
    });
    document.body.style.overflow = 'hidden';
  };

  window.fecharModal = function (overlayEl) {
    overlayEl.style.transition = 'opacity 0.18s ease';
    overlayEl.style.opacity = '0';
    setTimeout(() => {
      overlayEl.classList.add('hidden');
      overlayEl.style.opacity = '';
      overlayEl.style.transition = '';
    }, 180);
    document.body.style.overflow = '';
  };

  // ── Botão de crise → intervencao.html ──
  const btnCrise = document.getElementById('btn-crise');
  if (btnCrise) {
    btnCrise.addEventListener('click', () => {
      window.location.href = 'intervencao.html';
    });
  }

  // ── Modal de recaída ──
  const modalRecaida = document.getElementById('modal-recaida');
  const btnRecaida   = document.getElementById('btn-recaida');
  const btnCancelar  = document.getElementById('btn-cancelar');

  if (modalRecaida) {
    // Abre pelo item "Registrar recaída" do menu
    if (btnRecaida) {
      btnRecaida.addEventListener('click', () => {
        const menu = document.getElementById('menu-dropdown');
        if (menu) menu.classList.add('hidden');
        window.abrirModal(modalRecaida);
      });
    }

    // "Cancelar" — só fecha, sem lógica
    if (btnCancelar) {
      btnCancelar.addEventListener('click', () => window.fecharModal(modalRecaida));
    }

    // Fecha ao clicar fora do modal
    modalRecaida.addEventListener('click', (e) => {
      if (e.target === modalRecaida) window.fecharModal(modalRecaida);
    });
  }

  // ── Menu dropdown (header) ──
  const btnMenu      = document.getElementById('btn-menu');
  const menuDropdown = document.getElementById('menu-dropdown');

  if (btnMenu && menuDropdown) {
    btnMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      menuDropdown.classList.toggle('hidden');
    });

    menuDropdown.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', (e) => {
      if (!btnMenu.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.classList.add('hidden');
      }
    });
  }

});
