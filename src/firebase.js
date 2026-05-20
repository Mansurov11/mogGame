import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCeUJhralcgl6VxLz_cQUBk7r8c2WPF3-k", // O'zingizniki bilan almashtiring
  authDomain: "moggame-backend.firebaseapp.com",
  databaseURL: "https://moggame-backend-default-rtdb.firebaseio.com",
  projectId: "moggame-backend",
  storageBucket: "moggame-backend.firebasestorage.app",
  messagingSenderId: "49451269798",
  appId: "1:49451269798:web:8111988c5baef14098fe67",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);