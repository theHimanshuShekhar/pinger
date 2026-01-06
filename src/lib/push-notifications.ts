/**
 * Push Notifications Utility
 * Handles subscribing to push notifications and managing subscriptions
 */

export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.warn('Service Workers are not supported');
        return null;
    }

    try {
        // VitePWA plugin automatically handles service worker registration
        // We just need to wait for it to be ready
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready:', registration);
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
    }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('Notifications are not supported');
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission;
    }

    return Notification.permission;
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: import.meta.env.VITE_PUBLIC_VAPID_PUBLIC_KEY,
        });

        console.log('Push subscription successful:', subscription);
        return subscription;
    } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
        return null;
    }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
            console.log('Unsubscribed from push notifications');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to unsubscribe from push notifications:', error);
        return false;
    }
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
    try {
        const registration = await navigator.serviceWorker.ready;
        return await registration.pushManager.getSubscription();
    } catch (error) {
        console.error('Failed to get push subscription:', error);
        return null;
    }
}

export async function sendSubscriptionToServer(subscription: PushSubscription, userId: string): Promise<boolean> {
    try {
        const response = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscription: subscription.toJSON(),
                userId,
            }),
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        console.log('Subscription sent to server');
        return true;
    } catch (error) {
        console.error('Failed to send subscription to server:', error);
        return false;
    }
}

export async function initializePushNotifications(userId: string): Promise<void> {

    console.log('Initializing push notifications for user ID:', userId);

    try {
        // Wait for Service Worker to be ready (VitePWA handles registration)
        const registration = await navigator.serviceWorker.ready;
        console.log(registration)

        if (!registration) {
            console.warn('Service Worker registration not found');
            return;
        };

        // Check if already subscribed
        const existingSubscription = await getPushSubscription();
        if (existingSubscription) {
            console.log('Already subscribed to push notifications');
            return;
        }

        // Request permission
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
            console.log('Notification permission not granted');
            return;
        }

        // Subscribe to push notifications
        const subscription = await subscribeToPushNotifications();
        if (!subscription) return;

        // Send subscription to server
        await sendSubscriptionToServer(subscription, userId);
    } catch (error) {
        console.warn('Failed to initialize push notifications:', error);
    }
}
