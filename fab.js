// fab.js — Comportamento do FAB (botão flutuante)
// Fase 2, Fragmento 2.5
// Responsabilidade: toque rápido, segurar, arrastar, posição em sessão

document.addEventListener('DOMContentLoaded', () => {

  const fab = document.querySelector('.fab');
  if (!fab) return;

  let timerSegura  = null;
  let iniciouDrag  = false;
  let startX, startY, startLeft, startBottom;
  let tocouEm      = 0;
  const HOLD_MS    = 600;

  // ── Restaura posição da sessão ──
  const posicaoSalva = sessionStorage.getItem('fab-posicao');
  if (posicaoSalva) {
    const { bottom, right } = JSON.parse(posicaoSalva);
    fab.style.bottom = bottom + 'px';
    fab.style.right  = right  + 'px';
    fab.style.left   = 'auto';
    fab.style.top    = 'auto';
  }

  // ── Touch start ──
  fab.addEventListener('touchstart', (e) => {
    e.preventDefault();
    iniciouDrag = false;
    tocouEm = Date.now();

    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;

    const rect = fab.getBoundingClientRect();
    startLeft   = rect.left;
    startBottom = window.innerHeight - rect.bottom;

    // Timer de segurar
    timerSegura = setTimeout(() => {
      if (!iniciouDrag) abrirMenuFab();
    }, HOLD_MS);
  }, { passive: false });

  // ── Touch move → drag ──
  fab.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      iniciouDrag = true;
      clearTimeout(timerSegura);
    }

    if (iniciouDrag) {
      const novoLeft   = Math.max(0, Math.min(window.innerWidth  - fab.offsetWidth,  startLeft   + dx));
      const novoBottom = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, startBottom - dy));

      fab.style.left   = novoLeft   + 'px';
      fab.style.bottom = novoBottom + 'px';
      fab.style.right  = 'auto';
      fab.style.top    = 'auto';
    }
  }, { passive: false });

  // ── Touch end ──
  fab.addEventListener('touchend', (e) => {
    clearTimeout(timerSegura);
    const duracao = Date.now() - tocouEm;

    if (iniciouDrag) {
      // Salva nova posição na sessão
      sessionStorage.setItem('fab-posicao', JSON.stringify({
        bottom: parseFloat(fab.style.bottom) || 28,
        right:  parseFloat(fab.style.right)  || 20,
      }));
      return;
    }

    if (duracao < HOLD_MS) {
      // Toque rápido → abre modal de impulso
      const modalImpulso = document.getElementById('modal-impulso');
      if (modalImpulso) {
        modalImpulso.classList.remove('hidden');
        modalImpulso.style.opacity = '0';
        requestAnimationFrame(() => {
          modalImpulso.style.transition = 'opacity 0.2s ease';
          modalImpulso.style.opacity = '1';
        });
        document.body.style.overflow = 'hidden';
      }
    }
  });

  // ── Clique normal (desktop) ──
  fab.addEventListener('click', (e) => {
    if (iniciouDrag) return;
    const modalImpulso = document.getElementById('modal-impulso');
    if (modalImpulso) {
      modalImpulso.classList.remove('hidden');
      modalImpulso.style.opacity = '0';
      requestAnimationFrame(() => {
        modalImpulso.style.transition = 'opacity 0.2s ease';
        modalImpulso.style.opacity = '1';
      });
      document.body.style.overflow = 'hidden';
    }
  });

  // ── Menu de ações do FAB (segurar) ──
  function abrirMenuFab() {
    let menu = document.getElementById('fab-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'fab-menu';
      menu.className = 'fab-menu';
      menu.innerHTML = `
        <div class="fab-menu__item" data-acao="impulso">🛡️ Protocolo</div>
        <div class="fab-menu__item" data-acao="chat">💬 Chat IA</div>
        <div class="fab-menu__item" data-acao="respiracao">🌬️ Respiração</div>
        <div class="fab-menu__item" data-acao="vermelho">🔴 Tela Vermelha</div>
      `;
      document.body.appendChild(menu);

      // Adiciona estilos inline do menu (sem tocar style.css)
      const style = document.createElement('style');
      style.textContent = `
        .fab-menu {
          position: fixed;
          bottom: 90px;
          right: 20px;
          background: var(--bg-card);
          border: var(--border-accent);
          border-radius: 14px;
          overflow: hidden;
          z-index: 150;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          min-width: 160px;
          animation: fadeUp 0.18s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fab-menu__item {
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
          border-bottom: var(--border-default);
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .fab-menu__item:last-child { border-bottom: none; }
        .fab-menu__item:active { background: var(--bg-card-accent); }
      `;
      document.head.appendChild(style);

      menu.querySelectorAll('.fab-menu__item').forEach(item => {
        item.addEventListener('click', () => {
          menu.remove();
          const acao = item.dataset.acao;
          if (acao === 'chat') {
            window.location.href = 'chat.html';
          } else if (acao === 'vermelho') {
            ativarTelaVermelha();
          } else if (acao === 'impulso' || acao === 'respiracao') {
            const modalImpulso = document.getElementById('modal-impulso');
            if (modalImpulso) {
              modalImpulso.classList.remove('hidden');
              document.body.style.overflow = 'hidden';
            }
          }
        });
      });

      // Fecha menu ao clicar fora
      setTimeout(() => {
        document.addEventListener('click', () => menu.remove(), { once: true });
      }, 10);
    }
  }

});

// ── Tela Vermelha ──
// Sobrepõe overlay vermelho para quebrar padrão visual de estimulação.
// Segundo toque (ou clique no overlay) remove. Sem timeout automático.
function ativarTelaVermelha() {
  const existente = document.getElementById('overlay-vermelho');
  if (existente) {
    existente.remove();
    return;
  }
  const overlay = document.createElement('div');
  overlay.id = 'overlay-vermelho';
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(180, 0, 0, 0.6);
    z-index: 99999;
    cursor: pointer;
  `;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}
