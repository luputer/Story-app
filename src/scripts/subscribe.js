import API_ENDPOINT from "../config/api-endpoint";
import Swal from "sweetalert";

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      }); 
  });
}

async function toggleSubscription() {
  const subscribeButton = document.getElementById("subscribe-button");
  const isSubscribed = subscribeButton.textContent.trim() === "Unsubscribe";

  if (isSubscribed) {
    const result = await Swal({
      title: "Are you sure?",
      text: "You will stop receiving notifications from this site",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });
    
    if (result) {
      await unsubscribeFromPush();
      subscribeButton.textContent = "Subscribe";
      Swal("Unsubscribed!", "You won't receive notifications anymore.", "success");
    }
  } else {
    const result = await Swal({
      title: "Subscribe to notifications?",
      text: "You'll receive updates from this site",
      icon: "info",
      buttons: true,
    });
    
    if (result) {
      await subscribeToPush();
      subscribeButton.textContent = "Unsubscribe";
      Swal("Subscribed!", "You'll now receive notifications.", "success");
    }
  }
}

// Expose the toggleSubscription function to the global scope
window.toggleSubscription = toggleSubscription;

async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(API_ENDPOINT.NOTIFICATIONS.VAPID_PUBLIC_KEY)
    });

    // Send subscription to server
    console.log("Subscribed to push notifications", subscription);
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      await Swal({
        title: "Permission Denied",
        text: "Please enable notifications in your browser settings to receive updates.",
        icon: "error",
        button: "OK"
      });
      const subscribeButton = document.getElementById("subscribe-button");
      subscribeButton.textContent = "Subscribe";
    } else {
      console.error('Failed to subscribe:', error);
      await Swal({
        title: "Subscription Failed",
        text: "There was an error while subscribing to notifications.",
        icon: "error",
        button: "OK"
      });
    }
    throw error;
  }
}

async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    console.log("Unsubscribed from push notifications");
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}