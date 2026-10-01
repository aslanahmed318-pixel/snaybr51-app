import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD72X9ZgLdN3aaPmRSUdx1dwwAw53oLsgc',
  authDomain: 'snaybr51-4cfc3.firebaseapp.com',
  projectId: 'snaybr51-4cfc3',
  storageBucket: 'snaybr51-4cfc3.firebasestorage.app',
  messagingSenderId: '289708905758',
  appId: '1:289708905758:web:77853b195c0f837e99250f',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);
