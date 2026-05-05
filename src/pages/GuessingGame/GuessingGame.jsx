import { useState, useEffect } from "react";

const WORDS = [
  { word: "JAVASCRIPT", hint: "Popular programming language" },
  { word: "MOUNTAIN", hint: "Large natural elevation" },
  { word: "ELEPHANT", hint: "Largest land animal" },
  { word: "SUNSHINE", hint: "Light from the sun" },
  { word: "KEYBOARD", hint: "Computer input device" },
  { word: "RAINBOW", hint: "Colorful arc in the sky" },
  { word: "BUTTERFLY", hint: "Insect with colorful wings" },
  { word: "CHOCOLATE", hint: "Sweet brown treat" },
  { word: "COMPUTER", hint: "Electronic device for processing data" },
  { word: "PENGUIN", hint: "Bird that cannot fly but swims" },
];

const BODY_PARTS = [
  <circle key="head" cx="100" cy="47" r="12" fill="none" stroke="#ef4444" strokeWidth="3" />,
  <line key="body" x1="100" y1="59" x2="100" y2="95" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />,
  <line key="larm" x1="1
  00" y1="68" x2="82" y2="82" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />,
  <line key="rarm" x1="100" y1="68" x2="118" y2="82" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />,
  <line key="lleg" x1="100" y1="95" x2="82" y2="115" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />,
  <line key="rleg" x1="100" y1="95" x2="118" y2="115" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />,
];

function pickRandom() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export default function GuessTheWord() {
  const [wordData, setWordData] = useState(pickRandom);
  const [guessed, setGuessed] = useState(new Set());
  const [wrong, setWrong] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const won = gameOver && wordData.word.split("").every((l) => guessed.has(l));
  const triesLeft = 6 - wrong;

  useEffect(() => {
    const handler = (e) => {
      if (/^[a-zA-Z]$/.test(e.key)) guess(e.key.toUpperCase());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [guessed, gameOver]);

  function guess(letter) {
    if (guessed.has(letter) || gameOver) return;
    const next = new Set(guessed).add(letter);
    setGuessed(next);
    if (!wordData.word.includes(letter)) {
      const newWrong = wrong + 1;
      setWrong(newWrong);
      if (newWrong >= 6) setGameOver(true);
    } else if (wordData.word.split("").every((l) => next.has(l))) {
      setGameOver(true);
    }
  }

  function reset() {
    setWordData(pickRandom());
    setGuessed(new Set());
    setWrong(0);
    setGameOver(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ background: "white", borderRadius: 20, boxShadow: "0 4px 32px rgba(0,0,0,0.10)", padding: "40px 32px", width: "100%", maxWidth: 560 }}>

        <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: "#1e293b", margin: 0 }}>Guess the Word</h1>
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, marginTop: 4, marginBottom: 24 }}>Guess the word letter by letter</p>

        {/* Gallows */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <svg viewBox="0 0 160 160" style={{ width: 150, height: 150 }}>
            <line x1="20" y1="150" x2="140" y2="150" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="150" x2="60" y2="20" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="20" x2="100" y2="20" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <line x1="100" y1="20" x2="100" y2="35" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            {BODY_PARTS.slice(0, wrong)}
          </svg>
        </div>

        {/* Tries */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ background: "#fef2f2", color: "#dc2626", fontWeight: 700, fontSize: 14, padding: "6px 18px", borderRadius: 999, border: "1.5px solid #fecaca" }}>
            {triesLeft} {triesLeft === 1 ? "try" : "tries"} left
          </span>
        </div>

        {/* Hint */}
        <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", margin: 0 }}>Hint</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#1d4ed8", margin: "4px 0 0" }}>{wordData.hint}</p>
        </div>

        {/* Word display */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
          {wordData.word.split("").map((letter, i) => (
            <div key={i} style={{ width: 40, height: 52, borderBottom: "3px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#1e293b" }}>
              {guessed.has(letter) ? letter : ""}
            </div>
          ))}
        </div>

        {/* Keyboard */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>Click a letter or use your keyboard</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 24 }}>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
            const isGuessed = guessed.has(letter);
            const isCorrect = isGuessed && wordData.word.includes(letter);
            const isWrong = isGuessed && !wordData.word.includes(letter);
            let bg = "#f8fafc", color = "#334155", border = "1.5px solid #e2e8f0", cursor = "pointer";
            if (isCorrect) { bg = "#22c55e"; color = "white"; border = "none"; }
            else if (isWrong) { bg = "#ef4444"; color = "white"; border = "none"; }
            else if (gameOver) { color = "#cbd5e1"; cursor = "not-allowed"; }
            return (
              <button
                key={letter}
                onClick={() => guess(letter)}
                disabled={isGuessed || gameOver}
                style={{ width: 40, height: 40, borderRadius: 8, border, background: bg, color, fontSize: 14, fontWeight: 600, cursor, transition: "all 0.1s" }}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Result */}
        {gameOver && (
          <div>
            <div style={{ background: won ? "#f0fdf4" : "#fef2f2", border: `1.5px solid ${won ? "#86efac" : "#fecaca"}`, borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: won ? "#15803d" : "#b91c1c", margin: 0 }}>
                {won ? "🎉 You Won!" : "💀 Game Over"}
              </p>
              <p style={{ fontSize: 14, color: won ? "#16a34a" : "#dc2626", margin: "4px 0 0" }}>
                {won ? "You guessed: " : "The word was: "}<strong>{wordData.word}</strong>
              </p>
            </div>
            <button
              onClick={reset}
              style={{ width: "100%", background: "#2563eb", color: "white", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}