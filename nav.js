// nav.js — Roteamento e transições do LUMO
// Fase 2, Fragmento 2.1
// Responsabilidade: navegação entre telas + transição de entrada + menu 3 pontos

document.addEventListener('DOMContentLoaded', () => {

  // ── Transição de entrada na página ──
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.18s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  // ── Intercepta todos os links internos para transição de saída suave ──
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // apenas links locais (não âncoras, não externos)
    if (!href || href.startsWith('#') || href.startsWith('http')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = href;
      }, 160);
    });
  });

  // ── Menu de 3 pontos (index.html) ──
  const btnMenu = document.getElementById('btn-menu');
  const menuDropdown = document.getElementById('menu-dropdown');

  if (btnMenu && menuDropdown) {
    btnMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      menuDropdown.classList.toggle('hidden');
    });

    // Fecha ao clicar fora
    document.addEventListener('click', () => {
      menuDropdown.classList.add('hidden');
    });
  }

});
