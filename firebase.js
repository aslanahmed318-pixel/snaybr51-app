import { initializeApp } from 'firebase/app';

import { getFirestore } from 'firebase/firestore';

import { getAuth } from 'firebase/auth';

import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyD72X9ZgLdN3aaPmRSUdx1c",

  authDomain: "snaybr51-4cfc3.firebaseapp.com",

  projectId: "snaybr51-4cfc3",

  storageBucket: "snaybr51-4cfc3.firebasestorage.app",

  messagingSenderId: "289708905758",

  appId: "1:289708905758:web:dc7200f89b",

  measurementId: "G-HZFVM5437M"
};


const app = initializeApp(firebaseConfig);


// Firestore
export const db = getFirestore(app);


// Authentication
export const auth = getAuth(app);


// Storage للصور
export const storage = getStorage(app);
