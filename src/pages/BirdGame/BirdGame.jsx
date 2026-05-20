import { useState, useEffect, useRef } from 'react';
import { db, auth } from "./firebase"; // Yuqoridagi fayldan import qilamiz
import { ref, set, get, update } from "firebase/database";
// ... boshqa importlar (lucide-react, useNavigate va h.k.)

export default function EnglishRunner() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('menu');
  const [bestScore, setBestScore] = useState(0);
  const [snap, setSnap] = useState(null);
  // ... boshqa statelar

  // 1. O'yin yuklanganda foydalanuvchining shaxsiy rekordini olish
  useEffect(() => {
    const fetchBestScore = async () => {
      const user = auth.currentUser;
      if (user) {
        const scoreRef = ref(db, `Users/${user.uid}/bestScores/englishRunner`);
        const snapshot = await get(scoreRef);
        if (snapshot.exists()) {
          setBestScore(snapshot.val());
        }
      }
    };
    fetchBestScore();
  }, []);

  // 2. Natijani saqlash funksiyasi
  const saveScoreToFirebase = async (currentScore) => {
    const user = auth.currentUser;
    if (!user) return; // Agar login qilmagan bo'lsa, saqlamaydi

    if (currentScore > bestScore) {
      setBestScore(currentScore);
      try {
        const scoreRef = ref(db, `Users/${user.uid}/bestScores`);
        await update(scoreRef, {
          englishRunner: currentScore
        });
        console.log("Yangi rekord saqlandi!");
      } catch (e) {
        console.error("Saqlashda xatolik:", e);
      }
    }
  };

  // 3. O'yin tugaganda natijani tekshirish
  const stopGame = (score) => {
    G.current.running = false;
    saveScoreToFirebase(score); // Natijani yuborish
    setScreen('dead');
  };

  // Tick funksiyasi ichida o'lim holati:
  const tick = (ts) => {
    const g = G.current;
    if (!g || !g.running) return;

    // ... qushning harakati va to'qnashuvlar

    if (g.birdY < 0 || g.birdY > H - BIRD_SIZE || g.lives <= 0) {
      stopGame(g.score);
      return;
    }
    
    // ... qolgan mantiq
  };

  // JSX qismi (Sizning kodingiz bilan bir xil qoladi)
  return (
    // ... UI kodlari
  );
}