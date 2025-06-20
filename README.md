# Firefox Web Push Notifications Demo

A demonstration website showcasing Web Push API notifications specifically designed for Firefox.

## Features

- ✅ Web Push API implementation
- ✅ Service Worker for background notifications
- ✅ Permission management
- ✅ Simple and Push notifications
- ✅ Responsive design
- ✅ Activity logging
- ✅ Firefox-optimized

## How to Use

1. **Open the website**: Open [`index.html`](index.html) in Firefox
2. **Enable notifications**: Click "Enable Notifications" and allow permissions
3. **Test notifications**: 
   - Use "Send Test Notification" for simple notifications
   - Use "Send Push Notification" for service worker-based notifications

## Files Structure

- [`index.html`](index.html) - Main HTML page with the user interface
- [`style.css`](style.css) - Styling and responsive design
- [`app.js`](app.js) - Main application logic and Web Push API handling
- [`sw.js`](sw.js) - Service Worker for push notifications and caching

## Browser Requirements

- **Firefox** (recommended) - Full Web Push API support
- **Chrome/Edge** - Also supported
- **Safari** - Limited support (iOS 16.4+, macOS 13+)

## Key Features Explained

### Simple Notifications
Direct notifications created by the main thread using the Notification API.

### Push Notifications
Notifications sent through the service worker, simulating real push messages from a server.

### Service Worker
Handles:
- Push message reception
- Notification display
- Click handling
- Background caching

### Permission Management
Proper handling of notification permissions with user-friendly status updates.

## Technical Implementation

The demo uses:
- **Web Push API** for push notifications
- **Service Worker API** for background processing
- **Notification API** for displaying notifications
- **Message Channel API** for communication between main thread and service worker

## Firefox-Specific Optimizations

- Uses Firefox-compatible notification options
- Implements proper permission handling for Firefox
- Includes action buttons that work well in Firefox
- Optimized icon formats and sizes

## Running the Demo

Simply open `index.html` in Firefox. No server required for basic functionality.

For HTTPS testing (recommended for production):
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Then visit https://localhost:8000
```

## Troubleshooting

### Notifications Not Working?
1. Check Firefox notification settings: `about:preferences#privacy`
2. Ensure notifications are enabled for the site
3. Check the browser console for errors
4. Verify service worker registration in DevTools

### Permission Denied?
1. Clear site data and reload
2. Check Firefox's notification permissions
3. Try in a private/incognito window

## Browser Support Status

| Feature | Firefox | Chrome | Safari | Edge |
|---------|---------|--------|--------|------|
| Basic Notifications | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Push API | ✅ | ✅ | ⚠️ | ✅ |
| Action Buttons | ✅ | ✅ | ❌ | ✅ |

## License

This demo is provided as-is for educational purposes.