// nav.js — Roteamento e transições do LUMO
// Fase 2, Fragmento 2.1
// Responsabilidade: navegação entre telas + transição de entrada + menu 3 pontos

// Quando o browser restaura a página do bfcache (history.back()),
// DOMContentLoaded não dispara — mas pageshow dispara com persisted:true.
// Sem isso, a opacity:0 do exit-fade fica travada e a tela fica preta.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    document.body.style.transition = 'opacity 0.18s ease';
    document.body.style.opacity = '1';
  }
});

document.addEventListener('DOMContentLoaded', () => {

  // ── Transição de entrada na página ──
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.18s ease';
  // Double rAF garante que o browser renderiza opacity:0 antes de iniciar a transição
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });

  // ── Intercepta todos os links internos para transição de saída suave ──
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // apenas links locais (não âncoras, não externos, não javascript:)
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('javascript')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = href;
      }, 160);
    });
  });


});
