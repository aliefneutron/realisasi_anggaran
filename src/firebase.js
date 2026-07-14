// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes",
  storageBucket: "simona-dinkes.firebasestorage.app",
  messagingSenderId: "110448646014",
  appId: "1:110448646014:web:ae057b678776611c8e852f",
  measurementId: "G-F6FT2473GB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app);

// Aktifkan offline persistence — data di-cache ke IndexedDB browser
// Sehingga load berikutnya (bahkan setelah refresh) jauh lebih cepat
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Beberapa tab terbuka sekaligus — persistence hanya aktif di satu tab
    console.warn('Firestore persistence: multiple tabs open, persistence disabled.');
  } else if (err.code === 'unimplemented') {
    // Browser tidak mendukung IndexedDB
    console.warn('Firestore persistence: browser tidak mendukung IndexedDB.');
  }
});
