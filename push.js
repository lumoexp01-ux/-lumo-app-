// push.js — Fragmento 5.3
// Permissão de notificação, token FCM, foreground handler, tela vermelha por push.
//
// TODO (Fase 5.3 backend): criar Cloud Function que lê gatilhos.horarios
// de cada usuário e envia push nos horários críticos com { acao: 'tela-vermelha' }.

// ── VAPID Key ──
// Obter em: Firebase Console → Project Settings → Cloud Messaging
//           → Web Push certificates → Gerar par de chaves → copiar a chave pública
const VAPID_KEY = 'BOjH-OCVsee25cl8QnLWm6aYQeE9w9VbjXLaDpLjoLLbfbTocJ9kGCJtkrxpOvufr7Cfs0QK1cdJQcBwVT5lEV8';

// ── Inicializa push para o uid autenticado ──
// Chamada por app.js após auth + carregamento do perfil.
window.inicializarPush = async function (uid) {
  console.log('[push] inicializarPush chamada, uid:', !!uid);
  if (!uid)                            { console.log('[push] PAROU: sem uid'); return; }
  if (!('Notification' in window))     { console.log('[push] PAROU: Notification API indisponível'); return; }
  if (!('serviceWorker' in navigator)) { console.log('[push] PAROU: serviceWorker indisponível'); return; }
  if (!window.lumo?.messaging)         { console.log('[push] PAROU: messaging indisponível, lumo:', !!window.lumo, 'messaging:', !!window.lumo?.messaging); return; }

  // Já negou → não insiste
  if (Notification.permission === 'denied') { console.log('[push] PAROU: permissão negada anteriormente'); return; }

  // iOS fora do modo standalone (PWA não adicionado à tela inicial):
  // push não funciona — config.js cuida do fluxo manual nesse caso.
  const isIOS        = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone === true;
  if (isIOS && !isStandalone) { console.log('[push] PAROU: iOS fora do standalone'); return; }

  console.log('[push] permissão atual:', Notification.permission);

  try {
    // Registra / reutiliza o SW
    console.log('[push] registrando SW...');
    const sw = await navigator.serviceWorker.register('./sw.js');
    console.log('[push] SW registrado:', sw.scope);

    // Pede permissão se ainda não foi concedida
    if (Notification.permission !== 'granted') {
      console.log('[push] solicitando permissão...');
      const perm = await Notification.requestPermission();
      console.log('[push] resultado da permissão:', perm);
      if (perm !== 'granted') return;
    }

    const { messaging, getToken, onMessage, db, doc, updateDoc } = window.lumo;

    // Obtém token FCM
    console.log('[push] obtendo token FCM...');
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: sw,
    });
    console.log('[push] token obtido:', !!token);

    if (token) {
      // Salva token no Firestore para o Cloud Function usar
      await updateDoc(doc(db, 'usuarios', uid), { pushToken: token });
      console.log('[push] token salvo no Firestore');
    }

    // ── Mensagens em foreground (app aberto) ──
    onMessage(messaging, (payload) => {
      const acao = payload.data?.acao ?? '';
      if (acao === 'tela-vermelha') {
        // Ativa tela vermelha diretamente sem abrir notificação
        if (typeof ativarTelaVermelha === 'function') ativarTelaVermelha();
        return;
      }
      // Para outros tipos: mostra notificação manual (browser não mostra em foreground)
      const titulo = payload.notification?.title ?? 'LUMO';
      const corpo  = payload.notification?.body  ?? '';
      if (Notification.permission === 'granted') {
        new Notification(titulo, { body: corpo, icon: '/icons/icon-192.png' });
      }
    });

  } catch (e) {
    console.log('[push] ERRO:', e.code ?? '', e.message);
  }
};

// ── Mensagem do SW (app já aberto quando notificação foi clicada) ──
navigator.serviceWorker?.addEventListener('message', (event) => {
  if (event.data?.tipo !== 'acao-push') return;
  const acao = event.data.acao ?? '';
  if (acao === 'tela-vermelha' && typeof ativarTelaVermelha === 'function') {
    ativarTelaVermelha();
  }
});
