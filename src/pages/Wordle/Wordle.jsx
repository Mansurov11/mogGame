import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LANGUAGES = {
  en: {
    label: "English",
    flag: "ᴇɴ",
    easy: [
      "CRANE",
      "SLATE",
      "PROUD",
      "THINK",
      "FRAME",
      "SWIFT",
      "BRAVE",
      "CHARM",
      "PLANT",
      "STONE",
    ],
    medium: [
      "REACT",
      "PIXEL",
      "DANCE",
      "LIGHT",
      "STORM",
      "GLAZE",
      "WHISK",
      "FROST",
      "PLUMB",
      "QUIRK",
      "WRUNG",
      "FLOCK",
      "GROWL",
      "PROWL",
    ],
    hard: [
      "JAZZY",
      "FIZZY",
      "FUZZY",
      "DIZZY",
      "WHIZZ",
      "BLITZ",
      "WALTZ",
      "TOPAZ",
      "ABYSS",
      "HYPED",
      "LYMPH",
      "NYMPH",
    ],
    keyboard: [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
    ],
  },
  ru: {
    label: "Русский",
    flag: "ʀᴜ",
    easy: [
      "КОШКА",
      "СУМКА",
      "ПТИЦА",
      "ЗЕМЛЯ",
      "ВИЛКА",
      "ОГОНЬ",
      "ВЕТЕР",
      "ЦВЕТЫ",
      "КНИГА",
    ],
    medium: [
      "ШКОЛА",
      "ГОРОД",
      "РЫНОК",
      "ЗАМОК",
      "ПАРУС",
      "ЗАКАТ",
      "ДОРОГ",
      "МАСКА",
      "ПОЛКА",
    ],
    hard: [
      "ВОЛНА",
      "ГРОЗА",
      "КАМЕН",
      "ТУМАН",
      "ФРУКТ",
      "ЛАМПА",
      "КНИГА",
      "ПТИЦА",
      "СВЕЧА",
    ],
    keyboard: [
      ["Й", "Ц", "У", "К", "Е", "Н", "Г", "Ш", "Щ", "З", "Х"],
      ["Ф", "Ы", "В", "А", "П", "Р", "О", "Л", "Д", "Ж", "Э"],
      ["ENTER", "Я", "Ч", "С", "М", "И", "Т", "Ь", "Б", "Ю", "⌫"],
    ],
  },
  uz: {
    label: "O'zbek",
    flag: "ᴜᴢ",
    easy: [
      "KITOB",
      "QALAM",
      "QIZIL",
      "SARIQ",
      "SABZI",
      "OLCHA",
      "BODOM",
      "ANORI",
      "GILOS",
    ],

    medium: [
      "TALIM",
      "SHAXS",
      "QAROR",
      "UQISH",
      "ILMIY",
      "SAVDO",
      "YURAK",
      "NAFAS",
      "MAKON",
      "MEHRO",
    ],

    hard: [
      "ISROF",
      "HAYOT",
      "SABAB",
      "MEZON",
      "JASUR",
      "DAVRA",
      "ZAMON",
      "BAHOR",
      "OMBOR",
      "SAROY",
    ],
    keyboard: [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "'"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
    ],
  },
};

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getLetterStates(guess, target) {
  const states = Array(WORD_LENGTH).fill("absent");
  const targetLetters = target.split("");
  const guessLetters = guess.split("");

  // First pass: correct positions
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      states[i] = "correct";
      targetLetters[i] = null;
      guessLetters[i] = null;
    }
  }

  // Second pass: present but wrong position
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

function getKeyboardLetterState(letter, guesses, target) {
  let best = null;
  const priority = { correct: 3, present: 2, absent: 1 };
  for (const guess of guesses) {
    const states = getLetterStates(guess, target);
    guess.split("").forEach((l, i) => {
      if (l === letter) {
        if (!best || priority[states[i]] > priority[best]) {
          best = states[i];
        }
      }
    });
  }
  return best;
}

const tileColors = {
  correct: { bg: "#16a34a", border: "#16a34a", color: "#fff" },
  present: { bg: "#d97706", border: "#d97706", color: "#fff" },
  absent: { bg: "#6b7280", border: "#6b7280", color: "#fff" },
  current: { bg: "#fff", border: "#6b7280", color: "#1e293b" },
  empty: { bg: "#fff", border: "#e2e8f0", color: "#1e293b" },
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
  const [reveal, setReveal] = useState(false);

  const langData = lang ? LANGUAGES[lang] : null;
  const wordList = langData && difficulty ? langData[difficulty] : [];

  // Normalize words to 5 chars
  function startGame(selectedLang, selectedDiff) {
    const list = LANGUAGES[selectedLang][selectedDiff];
    const word = pickRandom(list).toUpperCase().slice(0, WORD_LENGTH);
    setLang(selectedLang);
    setDifficulty(selectedDiff);
    setTargetWord(word.padEnd(WORD_LENGTH, "?"));
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
  }

  function submitGuess() {
    if (currentGuess.length !== WORD_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setReveal(true);
    setTimeout(() => setReveal(false), 600);

    if (currentGuess === targetWord) {
      setWon(true);
      setGameOver(true);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameOver(true);
    }
    setCurrentGuess("");
  }

  function handleKey(key) {
    if (gameOver) return;
    if (key === "ENTER") {
      submitGuess();
    } else if (key === "⌫" || key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-ZА-ЯЁ']$/i.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key.toUpperCase());
    }
  }

  useEffect(() => {
    if (!difficulty) return;
    const handler = (e) => {
      const key = e.key.toUpperCase();
      if (key === "ENTER") handleKey("ENTER");
      else if (key === "BACKSPACE") handleKey("⌫");
      else if (/^[A-ZА-ЯЁ']$/.test(key)) handleKey(key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentGuess, gameOver, difficulty]);

  function reset() {
    startGame(lang, difficulty);
  }

  // ── Screen 1: Choose Language ──
  if (!lang) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#64748b",
              background: "none",
              border: "none",
              cursor: "pointer",
              marginBottom: 24,
              fontSize: 15,
            }}
          >
            <ArrowLeft size={18} /> Back to Games
          </button>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
              padding: "40px 32px",
            }}
          >
            <h1
              style={{
                textAlign: "center",
                fontSize: 28,
                fontWeight: 800,
                color: "#1e293b",
                margin: 0,
              }}
            >
              Wordle
            </h1>
            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 14,
                margin: "8px 0 28px",
              }}
            >
              Choose a language
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(LANGUAGES).map(([key, data]) => {
                const langColors = {
                  en: { bg: "#dc2626", hover: "#b91c1c" },
                  ru: { bg: "#2563eb", hover: "#1d4ed8" },
                  uz: { bg: "#16a34a", hover: "#15803d" },
                };
                const c = langColors[key];
                return (
                  <button
                    key={key}
                    onClick={() => setLang(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "16px 20px",
                      borderRadius: 14,
                      border: "none",
                      background: c.bg,
                      cursor: "pointer",
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#fff",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = c.hover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = c.bg)
                    }
                  >
                    <span style={{ fontSize: 28 }}>{data.flag}</span>
                    {data.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Screen 2: Choose Difficulty ──
  if (!difficulty) {
    const difficulties = [
      {
        id: "easy",
        label: "Easy",
        sub: "Common words",
        color: "#16a34a",
        hover: "#15803d",
      },
      {
        id: "medium",
        label: "Medium",
        sub: "Challenging words",
        color: "#d97706",
        hover: "#b45309",
      },
      {
        id: "hard",
        label: "Hard",
        sub: "Difficult words",
        color: "#dc2626",
        hover: "#b91c1c",
      },
    ];
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <button
            onClick={() => setLang(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#64748b",
              background: "none",
              border: "none",
              cursor: "pointer",
              marginBottom: 24,
              fontSize: 15,
            }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
              padding: "40px 32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 32 }}>{langData.flag}</span>
            </div>
            <h1
              style={{
                textAlign: "center",
                fontSize: 28,
                fontWeight: 800,
                color: "#1e293b",
                margin: "8px 0 4px",
              }}
            >
              Wordle
            </h1>
            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 14,
                margin: "0 0 28px",
              }}
            >
              Choose difficulty
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {difficulties.map((d) => (
                <button
                  key={d.id}
                  onClick={() => startGame(lang, d.id)}
                  style={{
                    background: d.color,
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    padding: "16px 20px",
                    cursor: "pointer",
                    fontSize: 17,
                    fontWeight: 700,
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = d.hover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = d.color)
                  }
                >
                  {d.label}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      opacity: 0.9,
                      marginTop: 2,
                    }}
                  >
                    {d.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Screen 3: Game ──
  const diffColors = {
    easy: { bg: "#dcfce7", text: "#16a34a" },
    medium: { bg: "#fef9c3", text: "#b45309" },
    hard: { bg: "#fee2e2", text: "#dc2626" },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <button
          onClick={() => setDifficulty(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#64748b",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: 16,
            fontSize: 15,
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
            padding: "28px 24px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#1e293b",
                margin: 0,
              }}
            >
              {langData.flag} Wordle
            </h1>
            <span
              style={{
                background: diffColors[difficulty].bg,
                color: diffColors[difficulty].text,
                borderRadius: 999,
                padding: "4px 14px",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>

          {/* Grid */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginBottom: 20,
            }}
          >
            {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
              const isCurrentRow = rowIndex === guesses.length && !gameOver;
              const word =
                rowIndex < guesses.length
                  ? guesses[rowIndex]
                  : isCurrentRow
                    ? currentGuess
                    : "";
              const letterStates =
                rowIndex < guesses.length
                  ? getLetterStates(guesses[rowIndex], targetWord)
                  : [];
              const isShaking = isCurrentRow && shake;
              const isRevealing = rowIndex === guesses.length - 1 && reveal;

              return (
                <div
                  key={rowIndex}
                  style={{
                    display: "flex",
                    gap: 6,
                    justifyContent: "center",
                    animation: isShaking ? "shake 0.4s ease" : "none",
                  }}
                >
                  {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                    const letter = word[colIndex] || "";
                    const state =
                      rowIndex < guesses.length
                        ? letterStates[colIndex]
                        : isCurrentRow && letter
                          ? "current"
                          : "empty";
                    const colors = tileColors[state];
                    const delay = isRevealing ? `${colIndex * 100}ms` : "0ms";

                    return (
                      <div
                        key={colIndex}
                        style={{
                          width: 52,
                          height: 52,
                          border: `2px solid ${colors.border}`,
                          borderRadius: 8,
                          background: colors.bg,
                          color: colors.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          fontWeight: 800,
                          transition: `background ${delay}, border-color ${delay}`,
                          transform:
                            letter && isCurrentRow ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Result */}
          {gameOver && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  background: won ? "#f0fdf4" : "#fef2f2",
                  border: `1.5px solid ${won ? "#86efac" : "#fecaca"}`,
                  borderRadius: 12,
                  padding: 14,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: won ? "#15803d" : "#b91c1c",
                    margin: 0,
                  }}
                >
                  {won ? "🎉 You Won!" : "💀 Game Over"}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: won ? "#16a34a" : "#dc2626",
                    margin: "4px 0 0",
                  }}
                >
                  {won
                    ? `Guessed in ${guesses.length} ${guesses.length === 1 ? "try" : "tries"}`
                    : `The word was: `}
                  {!won && <strong>{targetWord}</strong>}
                </p>
              </div>
              <button
                onClick={reset}
                style={{
                  width: "100%",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "13px 0",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Play Again
              </button>
            </div>
          )}

          {/* Keyboard */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {langData.keyboard.map((row, ri) => (
              <div
                key={ri}
                style={{ display: "flex", gap: 5, justifyContent: "center" }}
              >
                {row.map((key) => {
                  const isSpecial = key === "ENTER" || key === "⌫";
                  const state = !isSpecial
                    ? getKeyboardLetterState(key, guesses, targetWord)
                    : null;
                  let bg = "#e2e8f0",
                    color = "#1e293b";
                  if (state === "correct") {
                    bg = "#16a34a";
                    color = "#fff";
                  } else if (state === "present") {
                    bg = "#d97706";
                    color = "#fff";
                  } else if (state === "absent") {
                    bg = "#9ca3af";
                    color = "#fff";
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleKey(key)}
                      disabled={gameOver}
                      style={{
                        minWidth: isSpecial ? 52 : 34,
                        height: 46,
                        borderRadius: 8,
                        border: "none",
                        background: bg,
                        color,
                        fontSize: isSpecial ? 11 : 14,
                        fontWeight: 700,
                        cursor: gameOver ? "not-allowed" : "pointer",
                        padding: "0 4px",
                        transition: "background 0.2s",
                      }}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {!gameOver && (
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "#94a3b8",
                marginTop: 12,
                marginBottom: 0,
              }}
            >
              Type to guess • Enter to submit • Backspace to delete
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
