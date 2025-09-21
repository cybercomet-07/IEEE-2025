import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration for cityplus-main-f3457
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBV9bRNn5a6czRsphdfuuwsptDJLOgaQ6M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cityplus-main-f3457.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cityplus-main-f3457",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cityplus-main-f3457.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1082811526433",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1082811526433:web:d8d74f1b07b90e340a2260",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Q7HFHNPMZH"
};

// Initialize Firebase with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback configuration
  app = initializeApp({
    apiKey: "AIzaSyBV9bRNn5a6czRsphdfuuwsptDJLOgaQ6M",
    authDomain: "cityplus-main-f3457.firebaseapp.com",
    projectId: "cityplus-main-f3457",
    storageBucket: "cityplus-main-f3457.firebasestorage.app",
    messagingSenderId: "1082811526433",
    appId: "1:1082811526433:web:d8d74f1b07b90e340a2260",
    measurementId: "G-Q7HFHNPMZH"
  });
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

// Test Firebase connection
console.log('Firebase services initialized:', {
  auth: !!auth,
  db: !!db,
  storage: !!storage,
  functions: !!functions,
  analytics: !!analytics
});

export default app;
