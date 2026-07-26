// sw.js — Service Worker do LUMO

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyA-LHWB0o3a-Z21GxPug3cYui579jHQxS4",
  authDomain:        "lumo-app-89926.firebaseapp.com",
  projectId:         "lumo-app-89926",
  storageBucket:     "lumo-app-89926.firebasestorage.app",
  messagingSenderId: "470067283117",
  appId:             "1:470067283117:web:174d7e9d11078129953224"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification('LUMO', {
    body: payload.data?.body || 'É horário crítico. Cuide-se.',
    icon: '/icons/icon-192.png'
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // self.registration.scope aponta para a raiz do app independente do subpath do GitHub Pages
  const url = self.registration.scope + '?acao=tela-vermelha';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      // Se o app já está aberto, foca a janela existente em vez de abrir uma nova
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes(self.registration.scope)) {
          return list[i].focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
