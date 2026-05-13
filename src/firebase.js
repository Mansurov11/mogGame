import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Auth xizmatini import qilish
import { getDatabase } from "firebase/database"; // Realtime Database xizmatini import qilish

const firebaseConfig = {
  apiKey: "AIzaSyCeUJhralcgl6VxLz_cQUBk7r8c2WPF3-k",
  authDomain: "moggame-backend.firebaseapp.com",
  databaseURL: "https://moggame-backend-default-rtdb.firebaseio.com",
  projectId: "moggame-backend",
  storageBucket: "moggame-backend.firebasestorage.app",
  messagingSenderId: "49451269798",
  appId: "1:49451269798:web:8111988c5baef14098fe67",
  measurementId: "G-JXEBD2G0N6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// MUHIM: Mana bu qatorlarni qo'shing (export qilish)
export const auth = getAuth(app);
export const db = getDatabase(app);