// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD72X9ZgLdN3aaPmRSUdx1dwwAw53oLsgc",
  authDomain: "snaybr51-4cfc3.firebaseapp.com",
  projectId: "snaybr51-4cfc3",
  storageBucket: "snaybr51-4cfc3.firebasestorage.app",
  messagingSenderId: "289708905758",
  appId: "1:289708905758:web:77853b195c0f837e99250f",
  measurementId: "G-CVPTMPPHJJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firestore
export const db = getFirestore(app);

// Authentication
export const auth = getAuth(app);

// Storage
export const storage = getStorage(app);
