// sw.js — Service Worker do LUMO

self.addEventListener('push', function(event) {
  const data = event.data.json();
  const acao = data.acao || '';

  if (acao === 'tela-vermelha') {
    event.waitUntil(
      self.registration.showNotification('LUMO', {
        body: data.body || 'É horário crítico. Cuide-se.',
        icon: '/icons/icon-192.png'
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/?acao=tela-vermelha')
  );
});
