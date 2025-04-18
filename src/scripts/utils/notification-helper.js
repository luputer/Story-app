import API_ENDPOINT from "../config/api-endpoint";


const NotificationHelper = {
    async checkSubscription(registration) {
      try {
        if (!registration) return null;
        const subscription = await registration.pushManager.getSubscription();
        return subscription;
      } catch (error) {
        console.error('Error checking subscription:', error);
        return null;
      }
    },
  
    async unsubscribePushMessage(registration) {
      try {
        const subscription = await this.checkSubscription(registration);
        if (subscription) {
          // Send unsubscribe request to backend
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }
  
          const response = await fetch(`${API_ENDPOINT.BASE_URL}/notifications/unsubscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Unsubscription failed: ${errorData.message || response.statusText}`);
          }
  
          await subscription.unsubscribe();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to unsubscribe push message:', error);
        return false;
      }
    },
  
    async registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered');
          return registration;
        } catch (error) {
          console.error('Service Worker registration failed:', error);
          return null;
        }
      }
      console.warn('Service Worker not supported in this browser');
      return null;
    },
  
    async requestPermission() {
      if (!('Notification' in window)) {
        console.warn('Notifications not supported in this browser');
        return false;
      }
  
      try {
        const result = await Notification.requestPermission();
        if (result === 'denied') {
          console.warn('Notification permission denied');
          return false;
        }
  
        if (result === 'default') {
          console.warn('Notification permission dismissed');
          return false;
        }
  
        return true;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    },
  
    async subscribePushMessage(registration) {
      try {
        if (!registration) {
          throw new Error('Service Worker registration not found');
        }
  
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
  
        const existingSubscription = await this.checkSubscription(registration);
        if (existingSubscription) {
          console.log('Already subscribed to push notifications');
          return existingSubscription;
        }
  
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: API_ENDPOINT.VAPID_PUBLIC_KEY,
        });
  
        // Remove expirationTime from subscription object
        const subscriptionJson = subscription.toJSON();
        delete subscriptionJson.expirationTime;
  
        // Send subscription to backend
        const response = await fetch(`${API_ENDPOINT.BASE_URL}/notifications/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(subscriptionJson),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Subscription failed: ${errorData.message || response.statusText}`);
        }
  
        console.log('Successfully subscribed to push notifications');
        return subscription;
      } catch (error) {
        console.error('Failed to subscribe push message:', error);
        throw error;
      }
    },
  };
  
  export default NotificationHelper;