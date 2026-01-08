export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }
  
    if (Notification.permission === 'granted') {
      return true;
    }
  
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  
    return false;
  }
  
  export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }
  
  export function showBrowserNotification(title: string, body: string, actionUrl?: string) {
    if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          vibrate: [200, 100, 200],
          tag: `notification-${Date.now()}`,
          data: { url: actionUrl || '/' },
        });
      });
    }
  }
  
  export function canShowNotifications(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }