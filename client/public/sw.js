self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    
    const options = {
      body: data.message || 'You have a new notification',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [200, 100, 200],
      tag: data.id || 'notification',
      requireInteraction: false,
      data: {
        url: data.action_url || '/',
        notificationId: data.id,
      },
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title || 'ikonetU', options)
    );
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
  
    const urlToOpen = event.notification.data.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Check if already open
          for (let client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  });