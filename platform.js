// platform.js — Fragmento 6.2 — Detecção de sistema (iOS / Android / web)
(function () {
  const ua    = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isPWA     = window.matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone === true;

  const plataforma = isIOS ? 'ios' : isAndroid ? 'android' : 'web';

  try { localStorage.setItem('lumo-plataforma', plataforma); } catch (_) {}

  window.lumoPlatform = {
    plataforma,
    isIOS,
    isAndroid,
    isWeb:    !isIOS && !isAndroid,
    isMobile: isIOS || isAndroid,
    isPWA,
  };
})();
