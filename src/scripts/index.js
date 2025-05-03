// CSS imports
import '../styles/styles.css';
import App from './pages/app';

// Set up event listener for messages from service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Received message from service worker:', event.data);
    
    // Handle notification messages
    if (event.data.type === 'STORY_ADDED') {
      // Check if browser notifications are supported and permission is granted
      if ('Notification' in window && Notification.permission === 'granted') {
        // Display a client-side notification
        const notification = new Notification(event.data.title, {
          body: event.data.body,
          icon: '/icons/icon-192x192.png'
        });
        
        // Handle notification click
        notification.onclick = function() {
          window.focus();
          window.location.hash = '#/stories';
          this.close();
        };
      }
    }
    // Handle story deletion notifications
    else if (event.data.type === 'STORY_DELETED') {
      // Check if browser notifications are supported and permission is granted
      if ('Notification' in window && Notification.permission === 'granted') {
        // Display a client-side notification with a different icon
        const notification = new Notification(event.data.title, {
          body: event.data.body,
          icon: '/icons/icon-192x192.png',
          // Use a different style for deletion notifications
          badge: '/icons/icon-96x96.png'
        });
        
        // Handle notification click
        notification.onclick = function() {
          window.focus();
          window.location.hash = '#/stories';
          this.close();
        };
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
})
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}

