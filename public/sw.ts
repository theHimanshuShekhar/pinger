/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Handle push notifications
self.addEventListener('push', (event: PushEvent) => {
    if (!event.data) return;

    const data = event.data.json();
    const { title, options } = data;

    const notificationOptions: NotificationOptions = {
        icon: '/logo192.png',
        badge: '/favicon.ico',
        tag: options?.tag || 'notification',
        requireInteraction: options?.requireInteraction ?? false,
        ...options,
    };

    event.waitUntil(
        self.registration.showNotification(title, notificationOptions)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window/tab open with the target URL
            for (let client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return (client as WindowClient).focus();
                }
            }
            // If not, open a new window/tab with the target URL
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event: NotificationEvent) => {
    console.log('Notification closed', event.notification.tag);
});

// Handle message from client
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    const { type } = event.data;

    if (type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (type === 'CLIENTS_CLAIM') {
        self.clients.claim();
    }
});

// Export types for use elsewhere
export type { };
