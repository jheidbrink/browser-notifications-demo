const CACHE_NAME = 'notifications-demo-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Install event');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate event');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
            .catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

self.addEventListener('push', (event) => {
    console.log('Service Worker: Push event received', event);
    
    let notificationData = {
        title: 'Push Notification',
        body: 'You have received a new push notification!',
        icon: generateNotificationIcon(),
        badge: generateBadgeIcon(),
        tag: 'push-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: generateActionIcon('open')
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: generateActionIcon('dismiss')
            }
        ],
        data: {
            timestamp: Date.now(),
            url: '/'
        }
    };

    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (error) {
            console.error('Service Worker: Error parsing push data', error);
            notificationData.body = event.data.text() || notificationData.body;
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
            .then(() => {
                console.log('Service Worker: Notification shown successfully');
            })
            .catch((error) => {
                console.error('Service Worker: Error showing notification', error);
            })
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();

    const action = event.action;
    const notificationData = event.notification.data || {};

    if (action === 'dismiss') {
        console.log('Service Worker: Notification dismissed');
        return;
    }

    const urlToOpen = notificationData.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window/tab open with the target URL
                for (const client of clientList) {
                    if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
                        console.log('Service Worker: Focusing existing window');
                        return client.focus();
                    }
                }
                
                // If no existing window, open a new one
                if (clients.openWindow) {
                    console.log('Service Worker: Opening new window');
                    return clients.openWindow(urlToOpen);
                }
            })
            .then((client) => {
                if (client) {
                    client.postMessage({
                        type: 'NOTIFICATION_CLICKED',
                        payload: {
                            action: action,
                            data: notificationData,
                            timestamp: Date.now()
                        }
                    });
                }
            })
            .catch((error) => {
                console.error('Service Worker: Error handling notification click', error);
            })
    );
});

self.addEventListener('notificationclose', (event) => {
    console.log('Service Worker: Notification closed', event);
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SEND_PUSH_NOTIFICATION') {
        const { payload } = event.data;
        
        const notificationOptions = {
            body: payload.body || 'This is a push notification sent via service worker',
            icon: generateNotificationIcon(),
            badge: generateBadgeIcon(),
            tag: 'manual-push',
            requireInteraction: false,
            timestamp: payload.timestamp || Date.now(),
            actions: [
                {
                    action: 'view',
                    title: 'View',
                    icon: generateActionIcon('view')
                }
            ],
            data: {
                timestamp: payload.timestamp || Date.now(),
                url: '/',
                source: 'manual'
            }
        };

        self.registration.showNotification(
            payload.title || 'Manual Push Notification',
            notificationOptions
        ).then(() => {
            console.log('Service Worker: Manual push notification shown');
            event.ports[0].postMessage({ success: true });
        }).catch((error) => {
            console.error('Service Worker: Error showing manual push notification', error);
            event.ports[0].postMessage({ success: false, error: error.message });
        });
    }
});

function generateNotificationIcon() {
    const svg = `
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="12" fill="#4299e1"/>
            <path d="M32 12C34.2 12 36 13.8 36 16V17.16C40.78 18.14 44 22.38 44 27V38L50 44V46H14V44L20 38V27C20 22.38 23.22 18.14 28 17.16V16C28 13.8 29.8 12 32 12ZM26 50C26 53.31 28.69 56 32 56C35.31 56 38 53.31 38 50H26Z" fill="white"/>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function generateBadgeIcon() {
    const svg = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#4299e1"/>
            <path d="M16 6C17.1 6 18 6.9 18 8V8.58C20.39 9.07 22 11.19 22 13.5V19L25 22V23H7V22L10 19V13.5C10 11.19 11.61 9.07 14 8.58V8C14 6.9 14.9 6 16 6ZM13 25C13 26.66 14.34 28 16 28C17.66 28 19 26.66 19 25H13Z" fill="white"/>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function generateActionIcon(action) {
    let path = '';
    
    switch (action) {
        case 'open':
            path = 'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z';
            break;
        case 'dismiss':
            path = 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
            break;
        case 'view':
            path = 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z';
            break;
        default:
            path = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
    }
    
    const svg = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="${path}" fill="white"/>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

console.log('Service Worker: Script loaded');