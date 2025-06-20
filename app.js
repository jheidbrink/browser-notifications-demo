class NotificationManager {
    constructor() {
        this.registration = null;
        this.isSupported = false;
        this.permission = 'default';
        
        this.init();
    }

    async init() {
        this.log('Initializing notification manager...', 'info');
        
        this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
        
        if (!this.isSupported) {
            this.updateStatus('Notifications are not supported in this browser', 'error');
            this.log('Browser does not support notifications', 'error');
            return;
        }

        this.log('Browser supports notifications', 'success');
        
        try {
            this.registration = await navigator.serviceWorker.register('sw.js');
            this.log('Service worker registered successfully', 'success');
        } catch (error) {
            this.log(`Service worker registration failed: ${error.message}`, 'error');
            this.updateStatus('Failed to register service worker', 'error');
            return;
        }

        this.permission = Notification.permission;
        this.updateUI();
        
        this.setupEventListeners();
        
        this.log('Notification manager initialized', 'success');
    }

    setupEventListeners() {
        const enableBtn = document.getElementById('enable-notifications');
        const sendNotificationBtn = document.getElementById('send-notification');
        const sendPushBtn = document.getElementById('send-push');

        enableBtn.addEventListener('click', () => this.requestPermission());
        sendNotificationBtn.addEventListener('click', () => this.sendSimpleNotification());
        sendPushBtn.addEventListener('click', () => this.sendPushNotification());
    }

    async requestPermission() {
        this.log('Requesting notification permission...', 'info');
        
        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            
            if (permission === 'granted') {
                this.log('Notification permission granted', 'success');
                this.updateStatus('Notifications enabled! You can now receive push notifications.', 'success');
            } else if (permission === 'denied') {
                this.log('Notification permission denied', 'error');
                this.updateStatus('Notifications denied. Please enable them in browser settings.', 'error');
            } else {
                this.log('Notification permission dismissed', 'warning');
                this.updateStatus('Notification permission was dismissed.', 'warning');
            }
            
            this.updateUI();
        } catch (error) {
            this.log(`Error requesting permission: ${error.message}`, 'error');
            this.updateStatus('Error requesting notification permission', 'error');
        }
    }

    sendSimpleNotification() {
        if (this.permission !== 'granted') {
            this.log('Cannot send notification: permission not granted', 'warning');
            return;
        }

        const options = {
            body: 'This is a simple notification created directly by the main thread.',
            icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0Mjk5ZTEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNFY1LjA4QzE2LjM5IDUuNTcgMTggNy42OSAxOCAxMFYxNkwyMSAxOVY4SDE5VjZDMTkgMy43OSAxNy4yMSAyIDE1IDJIMTJaTTEwIDIxQzEwIDIyLjEgMTAuOSAyMyAxMiAyM0MxMy4xIDIzIDE0IDIyLjEgMTQgMjFIMTBaTTEyIDZDMTAuOSA2IDEwIDYuOSAxMCA4VjEwQzEwIDEyLjMxIDguNjkgMTQgNyAxNFY4QzcgNS43OSA4Ljc5IDQgMTEgNEgxMlY2WiIvPgo8L3N2Zz4KPC9zdmc+',
            badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM0Mjk5ZTEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkMxMy4xIDIgMTQgMi45IDE0IDRWNS4wOEMxNi4zOSA1LjU3IDE4IDcuNjkgMTggMTBWMTZMMjEgMTlWOEgxOVY2QzE5IDMuNzkgMTcuMjEgMiAxNSAySDE2WiIvPgo8L3N2Zz4KPC9zdmc+',
            tag: 'simple-notification',
            requireInteraction: false,
            timestamp: Date.now()
        };

        const notification = new Notification('Simple Notification', options);
        
        notification.onclick = () => {
            this.log('Simple notification clicked', 'info');
            notification.close();
            window.focus();
        };

        this.log('Simple notification sent', 'success');
    }

    async sendPushNotification() {
        if (this.permission !== 'granted') {
            this.log('Cannot send push notification: permission not granted', 'warning');
            return;
        }

        if (!this.registration) {
            this.log('Cannot send push notification: no service worker registration', 'error');
            return;
        }

        try {
            // Send a message to the service worker to trigger a push notification
            const channel = new MessageChannel();
            
            channel.port1.onmessage = (event) => {
                if (event.data.success) {
                    this.log('Push notification sent via service worker', 'success');
                } else {
                    this.log(`Push notification failed: ${event.data.error}`, 'error');
                }
            };

            this.registration.active.postMessage({
                type: 'SEND_PUSH_NOTIFICATION',
                payload: {
                    title: 'Push Notification',
                    body: 'This notification was sent via the service worker using the Push API simulation.',
                    timestamp: Date.now()
                }
            }, [channel.port2]);

        } catch (error) {
            this.log(`Error sending push notification: ${error.message}`, 'error');
        }
    }

    updateUI() {
        const enableBtn = document.getElementById('enable-notifications');
        const sendNotificationBtn = document.getElementById('send-notification');
        const sendPushBtn = document.getElementById('send-push');

        if (!this.isSupported) {
            this.updateStatus('Web Push notifications are not supported in this browser', 'error');
            return;
        }

        switch (this.permission) {
            case 'granted':
                enableBtn.textContent = 'Notifications Enabled ✓';
                enableBtn.disabled = true;
                sendNotificationBtn.disabled = false;
                sendPushBtn.disabled = false;
                this.updateStatus('Notifications are enabled and ready to use', 'success');
                break;
            
            case 'denied':
                enableBtn.textContent = 'Notifications Blocked';
                enableBtn.disabled = true;
                sendNotificationBtn.disabled = true;
                sendPushBtn.disabled = true;
                this.updateStatus('Notifications are blocked. Please enable them in browser settings.', 'error');
                break;
            
            default:
                enableBtn.textContent = 'Enable Notifications';
                enableBtn.disabled = false;
                sendNotificationBtn.disabled = true;
                sendPushBtn.disabled = true;
                this.updateStatus('Click "Enable Notifications" to allow push notifications', 'warning');
                break;
        }
    }

    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('status');
        statusElement.innerHTML = `<p>${message}</p>`;
        statusElement.className = `status-info ${type}`;
    }

    log(message, type = 'info') {
        const logContainer = document.getElementById('log');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('p');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NotificationManager();
});

navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        console.log('Notification was clicked:', event.data.payload);
    }
});