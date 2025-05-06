// CSS imports
import '../styles/styles.css';
import App from './pages/app';

// Register Service Worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Check if we should subscribe to push notifications (if user is logged in)
      checkPushSubscription(registration);
      
      // Set up event listener for messages from service worker
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
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Check if user has subscribed to push notifications
async function checkPushSubscription(registration) {
  try {
    const token = localStorage.getItem('token');
    if (!token) return; // User not logged in
    
    const subscription = await registration.pushManager.getSubscription();
    const subscribeButton = document.getElementById("subscribe-button");
    
    if (subscription) {
      // User is already subscribed
      if (subscribeButton) {
        subscribeButton.textContent = "Unsubscribe";
      }
    } else {
      // User is not subscribed
      if (subscribeButton) {
        subscribeButton.textContent = "Subscribe";
      }
    }
  } catch (error) {
    console.error('Error checking push subscription:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  // Register Service Worker
  await registerServiceWorker();
  
  // Render app
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});