import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../config/firebase';
import toast from 'react-hot-toast';

// Initialize Firebase Messaging
const messaging = getMessaging(app);

// VAPID key for push notifications (replace with your actual key)
const VAPID_KEY = 'your-vapid-key-here';

// Request permission and get FCM token
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getFCMToken();
      return token;
    } else {
      toast.error('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    toast.error('Failed to request notification permission');
    return null;
  }
}

// Get FCM token
export async function getFCMToken() {
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (token) {
      // Save token to user's profile in Firestore
      await saveFCMToken(token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Save FCM token to user's profile
async function saveFCMToken(token) {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    const { useAuth } = await import('../contexts/AuthContext');
    
    // Get current user
    const { user } = useAuth();
    if (user?.uid) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fcmToken: token,
        lastTokenUpdate: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}

// Handle foreground messages
export function onForegroundMessage(callback) {
  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    
    // Show toast notification
    if (payload.notification) {
      toast.success(payload.notification.body, {
        duration: 5000,
        icon: '🔔',
        onClick: () => {
          // Navigate to issue detail if issueId is provided
          if (payload.data?.issueId) {
            window.location.href = `/issue/${payload.data.issueId}`;
          }
        }
      });
    }
    
    // Call the callback function
    if (callback) {
      callback(payload);
    }
  });
}

// Check if notifications are supported
export function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Check if notifications are permitted
export function isNotificationPermitted() {
  return Notification.permission === 'granted';
}

// Register service worker for push notifications
export async function registerServiceWorker() {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    }
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

// Initialize messaging service
export async function initializeMessaging() {
  try {
    // Register service worker
    await registerServiceWorker();
    
    // Request permission and get token
    const token = await requestNotificationPermission();
    
    if (token) {
      console.log('FCM Token:', token);
      
      // Set up foreground message handler
      onForegroundMessage((payload) => {
        console.log('Foreground message received:', payload);
      });
    }
    
    return token;
  } catch (error) {
    console.error('Error initializing messaging:', error);
    return null;
  }
}

// Send test notification (for development)
export async function sendTestNotification() {
  try {
    const token = await getFCMToken();
    if (token) {
      // This would typically be done from your backend
      console.log('Test notification would be sent to token:', token);
      toast.success('Test notification setup complete!');
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}
