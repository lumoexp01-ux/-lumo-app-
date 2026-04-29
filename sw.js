// sw.js — Service Worker do LUMO
// Fragmento 5.3 — Push inteligente + tela vermelha automática
//
// ATENÇÃO: usa Firebase compat (não ESM) — único modo suportado em SW.
// A config abaixo deve ser igual à de firebase.js.

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyA-LHWB0o3a-Z21GxPug3cYui579jHQxS4",
  authDomain:        "lumo-app-89926.firebaseapp.com",
  projectId:         "lumo-app-89926",
  storageBucket:     "lumo-app-89926.firebasestorage.app",
  messagingSenderId: "470067283117",
  appId:             "1:470067283117:web:174d7e9d11078129953224",
});

const messaging = firebase.messaging();

// ── Notificações em background (app fechado / em segundo plano) ──
messaging.onBackgroundMessage((payload) => {
  const titulo = payload.notification?.title ?? 'LUMO';
  const corpo  = payload.notification?.body  ?? 'Você tem uma mensagem.';
  const acao   = payload.data?.acao ?? '';

  self.registration.showNotification(titulo, {
    body:  corpo,
    icon:  '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data:  { acao },
    tag:   'lumo-push',
    renotify: true,
  });
});

// ── Clique na notificação ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const acao = event.notification.data?.acao ?? '';

  // Monta URL com a ação para o app detectar ao abrir
  const url = acao ? `/index.html?acao=${acao}` : '/index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      // Se o app já está aberto, foca e envia mensagem
      for (const client of lista) {
        if (client.url.includes('/index.html') && 'focus' in client) {
          client.focus();
          client.postMessage({ tipo: 'acao-push', acao });
          return;
        }
      }
      // Senão, abre nova janela
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
