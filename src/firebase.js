import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA0GVu7WEDpKhzTcPL01x8WXJerVYHRMyU",
  authDomain: "d-store-44941.firebaseapp.com",
  projectId: "d-store-44941",
  storageBucket: "d-store-44941.firebasestorage.app",
  messagingSenderId: "183504675024",
  appId: "1:183504675024:web:36c16b13ba1bcdb5077ed5",
  measurementId: "G-YXREKHQZBX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();