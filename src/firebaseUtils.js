import { ref, update, get } from "firebase/database";
import { db, auth } from "./firebase"; // firebase.js faylingiz yo'li

/**
 * Foydalanuvchi natijasini bazaga saqlash funksiyasi.
 * @param {string} gameId - O'yin ID-si (masalan: 'flappy', 'snake', 'wordle')
 * @param {number} newScore - O'yinda to'plangan yangi ball
 * @param {boolean} lowerIsBetter - Agar kichik natija yaxshi bo'lsa (masalan Wordle), true bo'ladi.
 */
export const saveBestScore = async (gameId, newScore, lowerIsBetter = false) => {
  const user = auth.currentUser;

  if (!user) {
    console.warn("Foydalanuvchi tizimga kirmagan, natija saqlanmadi.");
    return;
  }

  const scoreRef = ref(db, `Users/${user.uid}/bestScores`);

  try {
    // 1. Avvalgi saqlangan natijani bazadan tekshiramiz
    const snapshot = await get(scoreRef);
    const currentScores = snapshot.val() || {};
    const previousScore = currentScores[gameId];

    let shouldUpdate = false;

    // 2. Yangilash shartini tekshiramiz
    if (previousScore === undefined || previousScore === null) {
      // Agar avval natija bo'lmasa - saqlaymiz
      shouldUpdate = true;
    } else if (lowerIsBetter) {
      // Wordle kabi o'yinlar uchun (masalan, 3 urinish 5 tadan yaxshi)
      if (newScore < previousScore && newScore > 0) shouldUpdate = true;
    } else {
      // Flappy, Snake kabi o'yinlar uchun (qancha ko'p bo'lsa shuncha yaxshi)
      if (newScore > previousScore) shouldUpdate = true;
    }

    // 3. Agar natija rekord bo'lsa, bazaga yozamiz
    if (shouldUpdate) {
      await update(scoreRef, {
        [gameId]: newScore
      });
      console.log(`✅ ${gameId} uchun yangi rekord: ${newScore}`);
    } else {
      console.log(`ℹ️ Natija rekord emas. Avvalgi: ${previousScore}, Yangi: ${newScore}`);
    }
  } catch (error) {
    console.error("Firebase'ga saqlashda xatolik:", error);
  }
};