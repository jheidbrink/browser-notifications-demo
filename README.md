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
- The URL is calculated relative to where the service worker is hosted (fixed to work with GitHub Pages)

## Files

- `index.html` - Main HTML page with the user interface
- `style.css` - Styling and responsive design
- `app.js` - Main application logic and Web Push API handling
- `sw.js` - Service Worker for push notifications and caching

## Browser Requirements

- **Firefox** (recommended) - Full Web Push API support
- **Chrome/Edge** - Also supported
- **Safari** - Limited support (iOS 16.4+, macOS 13+)