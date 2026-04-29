// sw.js — Service Worker do LUMO

self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  const acao = data.acao || '';

  if (acao === 'tela-vermelha') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client =>
        client.postMessage({ acao: 'tela-vermelha' })
      );
    });
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'LUMO',
      {
        body: data.body || 'Como você está agora?',
        icon: '/icons/icon-192.png'
      }
    )
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
