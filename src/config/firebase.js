import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration for cityplus-main-f3457
const firebaseConfig = {
  apiKey: "AIzaSyBV9bRNn5a6czRsphdfuuwsptDJLOgaQ6M",
  authDomain: "cityplus-main-f3457.firebaseapp.com",
  projectId: "cityplus-main-f3457",
  storageBucket: "cityplus-main-f3457.firebasestorage.app",
  messagingSenderId: "1082811526433",
  appId: "1:1082811526433:web:d8d74f1b07b90e340a2260",
  measurementId: "G-Q7HFHNPMZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

export default app;
