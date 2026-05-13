import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

// FIREBASE INTEGRATSIYASI
import { auth, db } from "../../firebase"; 
import { ref, update, get } from "firebase/database";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

// --- RANG PALITRALARI ---
const THEMES = {
  light: {
    bg: "#f1f5f9",
    card: "#ffffff",
    text: "#1e293b",
    subText: "#64748b",
    border: "#e2e8f0",
    tiles: {
      correct: { bg: "#16a34a", border: "#16a34a", color: "#fff" },
      present: { bg: "#d97706", border: "#d97706", color: "#fff" },
      absent: { bg: "#6b7280", border: "#6b7280", color: "#fff" },
      current: { bg: "#fff", border: "#6b7280", color: "#1e293b" },
      empty: { bg: "#fff", border: "#e2e8f0", color: "#1e293b" },
    },
    keyboard: { bg: "#e2e8f0", text: "#1e293b" }
  },
  dark: {
    bg: "#0f172a",
    card: "#1e293b",
    text: "#ffffff",
    subText: "#94a3b8",
    border: "#334155",
    tiles: {
      correct: { bg: "#15803d", border: "#15803d", color: "#fff" },
      present: { bg: "#b45309", border: "#b45309", color: "#fff" },
      absent: { bg: "#334155", border: "#334155", color: "#94a3b8" },
      current: { bg: "#1e293b", border: "#64748b", color: "#fff" },
      empty: { bg: "#0f172a", border: "#334155", color: "#fff" },
    },
    keyboard: { bg: "#334155", text: "#fff" }
  }
};

export default function Wordle() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [onlineLanguages, setOnlineLanguages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // LOCALSTORAGE'DAN THEME'NI OLISH
  const [themeName, setThemeName] = useState(localStorage.getItem("theme") === "dark" ? "dark" : "light");
  const theme = THEMES[themeName];

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const snapshot = await get(ref(db, 'GameData/Wordle/Languages'));
        if (snapshot.exists()) setOnlineLanguages(snapshot.val());
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchWords();
  }, []);

  const saveWordleStats = async (tries) => {
    const user = auth.currentUser;
    if (user) {
      const scoreRef = ref(db, `Users/${user.uid}/bestScores`);
      try {
        const snapshot = await get(scoreRef);
        const currentData = snapshot.val() || {};
        const updates = { wordle_wins: (currentData.wordle_wins || 0) + 1 };
        if (!currentData.wordle || tries < currentData.wordle) updates.wordle = tries;
        await update(scoreRef, updates);
      } catch (err) { console.error(err); }
    }
  };

  function startGame(selectedLang, selectedDiff) {
    const list = onlineLanguages[selectedLang][selectedDiff];
    const word = list[Math.floor(Math.random() * list.length)].toUpperCase().slice(0, WORD_LENGTH);
    setLang(selectedLang);
    setDifficulty(selectedDiff);
    setTargetWord(word.padEnd(WORD_LENGTH, "?"));
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
  }

  function handleKey(key) {
    if (gameOver) return;
    if (key === "ENTER") {
      if (currentGuess.length !== WORD_LENGTH) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      if (currentGuess === targetWord) {
        setWon(true);
        setGameOver(true);
        saveWordleStats(newGuesses.length);
      } else if (newGuesses.length >= MAX_ATTEMPTS) setGameOver(true);
      setCurrentGuess("");
    } else if (key === "⌫" || key === "BACKSPACE") setCurrentGuess(p => p.slice(0, -1));
    else if (/^[A-ZА-ЯЁ']$/i.test(key) && currentGuess.length < WORD_LENGTH) setCurrentGuess(p => p + key.toUpperCase());
  }

  useEffect(() => {
    if (!difficulty) return;
    const handler = (e) => handleKey(e.key.toUpperCase());
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentGuess, gameOver, difficulty]);

  function getLetterStates(guess, target) {
    const states = Array(WORD_LENGTH).fill("absent");
    const targetLetters = target.split("");
    const guessLetters = guess.split("");
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        states[i] = "correct";
        targetLetters[i] = null;
        guessLetters[i] = null;
      }
    }
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === null) continue;
      const idx = targetLetters.indexOf(guessLetters[i]);
      if (idx !== -1) {
        states[i] = "present";
        targetLetters[idx] = null;
      }
    }
    return states;
  }

  if (isLoading) return <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><RefreshCw className="animate-spin text-blue-500" size={48} /></div>;

  if (!lang) {
    return (
      <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, color: theme.subText, background: "none", border: "none", cursor: "pointer", marginBottom: 24 }}><ArrowLeft size={18} /> Back</button>
          <div style={{ background: theme.card, borderRadius: 24, padding: "40px 32px", border: `1px solid ${theme.border}` }}>
            <h1 style={{ textAlign: "center", fontSize: 32, fontWeight: 900, color: theme.text, margin: 0 }}>Wordle</h1>
            <p style={{ textAlign: "center", color: theme.subText, fontSize: 14, margin: "8px 0 28px" }}>Select language</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {onlineLanguages && Object.entries(onlineLanguages).map(([key, data]) => (
                <button key={key} onClick={() => setLang(key)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 24px", borderRadius: 16, border: "none", background: "#2563eb", cursor: "pointer", fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  <span>{data.flag}</span> {data.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!difficulty) {
    return (
      <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <button onClick={() => setLang(null)} style={{ display: "flex", alignItems: "center", gap: 8, color: theme.subText, background: "none", border: "none", cursor: "pointer", marginBottom: 24 }}><ArrowLeft size={18} /> Back</button>
          <div style={{ background: theme.card, borderRadius: 24, padding: "40px 32px", border: `1px solid ${theme.border}` }}>
            <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: theme.text, marginBottom: 28 }}>Difficulty</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["easy", "medium", "hard"].map((d) => (
                <button key={d} onClick={() => startGame(lang, d)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 16, padding: "16px", cursor: "pointer", fontSize: 18, fontWeight: 700, textTransform: "capitalize" }}>{d}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const langData = onlineLanguages[lang];

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <button onClick={() => setDifficulty(null)} style={{ display: "flex", alignItems: "center", gap: 8, color: theme.subText, background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}><ArrowLeft size={18} /> Back</button>
        
        <div style={{ background: theme.card, borderRadius: 28, border: `1px solid ${theme.border}`, padding: "32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: theme.text, margin: 0 }}>{langData.flag} Wordle</h1>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", background: "#2563eb", padding: "4px 12px", borderRadius: 12, textTransform: "uppercase" }}>{difficulty}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
            {Array.from({ length: MAX_ATTEMPTS }).map((_, r) => {
              const isCurr = r === guesses.length && !gameOver;
              const word = r < guesses.length ? guesses[r] : (isCurr ? currentGuess : "");
              const states = r < guesses.length ? getLetterStates(guesses[r], targetWord) : [];
              return (
                <div key={r} style={{ display: "flex", gap: 8, justifyContent: "center", animation: isCurr && shake ? "shake 0.4s ease" : "" }}>
                  {Array.from({ length: WORD_LENGTH }).map((_, c) => {
                    const char = word[c] || "";
                    const st = r < guesses.length ? states[c] : (isCurr && char ? "current" : "empty");
                    const colors = theme.tiles[st];
                    return (
                      <div key={c} style={{ width: 54, height: 54, border: `2px solid ${colors.border}`, borderRadius: 12, background: colors.bg, color: colors.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>{char}</div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {gameOver && (
            <div style={{ marginBottom: 24, padding: 20, borderRadius: 20, background: won ? "#16a34a20" : "#dc262620", textAlign: "center", border: `1px solid ${won ? "#16a34a" : "#dc2626"}` }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: won ? "#16a34a" : "#dc2626", margin: 0 }}>{won ? (langData.winMessage || "Victory!") : "Game Over"}</h2>
              {!won && <p style={{ color: theme.text, marginTop: 4 }}>Word: <b>{targetWord}</b></p>}
              <button onClick={() => startGame(lang, difficulty)} style={{ marginTop: 16, width: "100%", background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontWeight: 800, cursor: "pointer" }}>New Game</button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {langData.keyboard.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {row.map(key => {
                  const isSp = key === "ENTER" || key === "⌫";
                  let bg = theme.keyboard.bg, color = theme.keyboard.text;
                  const st = !isSp ? (function(){
                    let b=null; const p={correct:3, present:2, absent:1};
                    guesses.forEach(g => { const s=getLetterStates(g,targetWord); g.split("").forEach((l,ix) => { if(l===key) if(!b||p[s[ix]]>p[b]) b=s[ix]; }); });
                    return b;
                  })() : null;
                  if(st){ bg=theme.tiles[st].bg; color="#fff"; }
                  return <button key={key} onClick={() => handleKey(key)} style={{ minWidth: isSp ? 56 : 36, height: 48, borderRadius: 10, border: "none", background: bg, color, fontWeight: 800, cursor: "pointer", fontSize: isSp ? 12 : 16 }}>{key}</button>
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }`}</style>
    </div>
  );
}