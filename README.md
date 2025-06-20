# Web Push Notifications Demo

A demonstration website showcasing Web Push API notifications.
It can create notifications in the main thread using the Notification API
and notifications through the service worker, simulating push messages
from a server.

## How to Use

1. **Open the website**: Open index.html in a browser (not that for local checkouts of this repo, you cannot simply
open index.html from disk, your browser will refuse to register the service worker for unknown protocols.
Thus you need to start a http server serving index.html and point your browser to the server URL)
2. **Enable notifications**: Click "Enable Notifications" and allow permissions
3. **Test notifications**:
   - Use "Send Test Notification" for simple notifications
   - Use "Send Push Notification" for service worker-based notifications

## Notification Click Behavior

When you click on a notification:
- The service worker will try to focus an existing tab with your app
- If no existing tab is found, it will open a new tab pointing to the current page
