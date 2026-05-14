import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  Skull,
  Snail,
  Zap,
  Trophy,
  Play,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── Firebase — adjust this import path to match your project ─────────────────
import { auth, db } from "../../firebase";
import { ref, get, update } from "firebase/database";
// ─────────────────────────────────────────────────────────────────────────────

const COLS = 22;
const ROWS = 18;

const WORDS = [
  "REACT", "SNAKE", "PIXEL", "FLAME", "QUEST", "CLOUD", "BLAZE", "STORM", "SWIFT", "CRYSTAL",
  "SPARK", "FROST", "VENOM", "LUNAR", "PRISM", "NEXUS", "DELTA", "EMBER", "GHOST", "HYPER",
  "IRON", "JADE", "KNIGHT", "LASER", "MAGIC", "NEON", "ORBIT", "POWER", "QUARTZ", "ROGUE",
  "SOLAR", "TITAN", "ULTRA", "VAPOR", "WARP", "XENON", "YIELD", "ZEAL", "ASTRO", "BINARY",
];

const SKINS = {
  classic: {
    name: "Classic",
    head: "#22c55e", body: "#16a34a", tail: "#15803d",
    glow: "#4ade80", accent: "#86efac",
    bg: "from-green-950 via-gray-950 to-green-950",
    border: "border-green-500",
    btn: "bg-green-500 hover:bg-green-400",
    tag: "text-green-400",
  },
  blue: {
    name: "Ocean",
    head: "#3b82f6", body: "#2563eb", tail: "#1d4ed8",
    glow: "#60a5fa", accent: "#93c5fd",
    bg: "from-blue-950 via-gray-950 to-blue-950",
    border: "border-blue-500",
    btn: "bg-blue-500 hover:bg-blue-400",
    tag: "text-blue-400",
  },
  red: {
    name: "Inferno",
    head: "#ef4444", body: "#dc2626", tail: "#b91c1c",
    glow: "#f87171", accent: "#fca5a5",
    bg: "from-red-950 via-gray-950 to-red-950",
    border: "border-red-500",
    btn: "bg-red-500 hover:bg-red-400",
    tag: "text-red-400",
  },
  purple: {
    name: "Cosmic",
    head: "#a855f7", body: "#9333ea", tail: "#7e22ce",
    glow: "#c084fc", accent: "#d8b4fe",
    bg: "from-purple-950 via-gray-950 to-purple-950",
    border: "border-purple-500",
    btn: "bg-purple-500 hover:bg-purple-400",
    tag: "text-purple-400",
  },
};

// ── Pure helpers ─────────────────────────────────────────────────────────────

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function randomPos(snake = []) {
  let pos, tries = 0;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    tries++;
  } while (tries < 300 && snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const r  = Math.round(ar + (br - ar) * t);
  const g2 = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g2.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function initGame() {
  const word  = randomWord();
  const snake = [{ x: 10, y: 9 }, { x: 9, y: 9 }, { x: 8, y: 9 }];
  const letters = word.split("").map((l, i) => ({
    letter: l, idx: i, ...randomPos(snake), active: i === 0,
  }));
  return {
    snake,
    dir:     { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    word, letters,
    collected: [],
    score: 0,
    speed: 190,
    alive: true,
    wordsCompleted: 0,
  };
}

// ── Firebase best-score saver ─────────────────────────────────────────────────
// Defined at module level so it is never re-created and is always called with ()
async function saveToFirebase(finalScore) {
  const user = auth.currentUser;
  if (!user) return;
  const scoreRef = ref(db, `Users/${user.uid}/bestScores`);
  try {
    const snapshot = await get(scoreRef);
    const prevBest = (snapshot.val() || {}).word_snake || 0;
    if (finalScore > prevBest) {
      await update(scoreRef, { word_snake: finalScore });
      console.log("New Firebase best score saved:", finalScore);
    }
  } catch (err) {
    console.error("Firebase update error:", err);
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export default function WordSnake() {
  const [screen,       setScreen]       = useState("menu");
  const [skin,         setSkin]         = useState("classic");
  const [gameState,    setGameState]    = useState(null);
  const [particles,    setParticles]    = useState([]);
  const [speedLevel,   setSpeedLevel]   = useState(1);
  const [wordComplete, setWordComplete] = useState(null);
  const [bestScore,    setBestScore]    = useState(
    () => parseInt(localStorage.getItem("wordsnake_best") || "0")
  );

  const canvasRef     = useRef(null);
  const containerRef  = useRef(null); // wraps canvas — measured for responsive cell size
  const gameRef       = useRef(null);
  const animRef       = useRef(null);
  const speedTimerRef = useRef(null);
  const pausedRef     = useRef(false);
  const cellRef       = useRef(28);   // live cell pixel size, updated on resize

  const navigate = useNavigate();
  const sk       = SKINS[skin];

  // ── Helpers ───────────────────────────────────────────────────────────────

  const stopAll = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    clearInterval(speedTimerRef.current);
  }, []);

  // Save best score locally + to Firebase in one place
  const persistBest = useCallback((score) => {
    setBestScore(score);
    localStorage.setItem("wordsnake_best", score.toString());
    saveToFirebase(score); // ← properly called with ()
  }, []);

  const startGame = useCallback(() => {
    stopAll();
    pausedRef.current = false;
    setWordComplete(null);
    const g = initGame();
    gameRef.current = g;
    setGameState({ ...g });
    setParticles([]);
    setSpeedLevel(1);
    setScreen("game");
  }, [stopAll]);

  const continueAfterWord = useCallback(() => {
    pausedRef.current = false;
    setWordComplete(null);
  }, []);

  const handleDir = useCallback((dx, dy) => {
    const g = gameRef.current;
    if (!g || (dx === -g.dir.x && dy === -g.dir.y)) return;
    g.nextDir = { x: dx, y: dy };
  }, []);

  // ── Responsive canvas: ResizeObserver on containerRef ────────────────────
  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;
    const cell      = Math.floor(container.clientWidth / COLS);
    cellRef.current = cell;
    canvas.width    = cell * COLS;
    canvas.height   = cell * ROWS;
  }, []);

  useEffect(() => {
    if (screen !== "game") return;
    const raf = requestAnimationFrame(resizeCanvas); // run after first paint
    const ro  = new ResizeObserver(resizeCanvas);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [screen, resizeCanvas]);

  // ── Particles ─────────────────────────────────────────────────────────────
  const spawnParticles = useCallback((x, y, letter, color) => {
    const cell = cellRef.current;
    const px   = x * cell + cell / 2;
    const py   = y * cell + cell / 2;
    const burst = Array.from({ length: 10 }, (_, i) => ({
      id:     Math.random(),
      x: px,  y: py,
      vx:     (Math.random() - 0.5) * 6,
      vy:     (Math.random() - 0.5) * 6,
      life:   1,
      color,
      letter: i === 0 ? letter : null,
      size:   i === 0 ? 16 : 4 + Math.random() * 4,
    }));
    setParticles((p) => [...p, ...burst]);
  }, []);

  // ── Speed ramp ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "game") return;
    speedTimerRef.current = setInterval(() => {
      if (!gameRef.current?.alive) return;
      gameRef.current.speed = Math.max(60, gameRef.current.speed - 8);
      setSpeedLevel((l) => l + 1);
    }, 15000);
    return () => clearInterval(speedTimerRef.current);
  }, [screen]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "game") return;
    const onKey = (e) => {
      const g = gameRef.current;
      if (!g?.alive) return;
      const map = {
        ArrowUp:    { x:  0, y: -1 }, w: { x:  0, y: -1 }, W: { x:  0, y: -1 },
        ArrowDown:  { x:  0, y:  1 }, s: { x:  0, y:  1 }, S: { x:  0, y:  1 },
        ArrowLeft:  { x: -1, y:  0 }, a: { x: -1, y:  0 }, A: { x: -1, y:  0 },
        ArrowRight: { x:  1, y:  0 }, d: { x:  1, y:  0 }, D: { x:  1, y:  0 },
      };
      const nd = map[e.key];
      if (!nd || (nd.x === -g.dir.x && nd.y === -g.dir.y)) return;
      e.preventDefault();
      g.nextDir = nd;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen]);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const drawGame = useCallback((g) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const CELL = cellRef.current;
    const W    = COLS * CELL;
    const H    = ROWS * CELL;

    // Background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, W, H);
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.018)";
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }

    // Letter tiles
    g.letters.forEach((l) => {
      const px = l.x * CELL, py = l.y * CELL;
      ctx.save();
      ctx.globalAlpha = l.active ? 1 : 0.5;
      if (l.active) { ctx.shadowColor = sk.glow; ctx.shadowBlur = 18; }
      ctx.fillStyle = l.active ? sk.head : "#1e293b";
      roundRect(ctx, px + 4, py + 4, CELL - 8, CELL - 8, 7);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (l.active) {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        roundRect(ctx, px + 5, py + 5, CELL - 10, (CELL - 10) * 0.45, 5);
        ctx.fill();
      }
      ctx.fillStyle    = l.active ? "#fff" : sk.accent;
      ctx.font         = `700 ${CELL * 0.5}px 'Segoe UI',sans-serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(l.letter, px + CELL / 2, py + CELL / 2 + 1);
      ctx.restore();
    });

    // Snake body
    const pts    = g.snake.map((s) => ({ x: s.x * CELL + CELL / 2, y: s.y * CELL + CELL / 2 }));
    const n      = pts.length;
    if (n < 1) return;
    const TUBE_R = CELL * 0.42;

    ctx.save();
    ctx.lineCap       = "round";
    ctx.lineJoin      = "round";
    ctx.shadowColor   = "rgba(0,0,0,0.4)";
    ctx.shadowBlur    = 8;
    ctx.shadowOffsetY = 2;
    ctx.strokeStyle   = sk.body;
    ctx.lineWidth     = TUBE_R * 2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();

    ctx.shadowBlur    = 0;
    ctx.shadowOffsetY = 0;
    for (let i = n - 2; i >= 0; i--) {
      const c0   = lerpColor(sk.head, sk.tail, i / Math.max(n - 1, 1));
      const c1   = lerpColor(sk.head, sk.tail, (i + 1) / Math.max(n - 1, 1));
      const grad = ctx.createLinearGradient(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
      grad.addColorStop(0, c0);
      grad.addColorStop(1, c1);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = TUBE_R * 2;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
    }

    // Highlight stripe
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth   = TUBE_R * 0.55;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();

    // Scale lines
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth   = 2.5;
    let dist        = 0;
    const STEP      = CELL * 1.3;
    for (let i = 1; i < n; i++) {
      const dx  = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) continue;
      let d = STEP - (dist % STEP);
      while (d <= len) {
        const fx  = pts[i - 1].x + (dx / len) * d, fy = pts[i - 1].y + (dy / len) * d;
        const px2 = -dy / len, py2 = dx / len;
        ctx.beginPath();
        ctx.moveTo(fx + px2 * TUBE_R * 0.85, fy + py2 * TUBE_R * 0.85);
        ctx.lineTo(fx - px2 * TUBE_R * 0.85, fy - py2 * TUBE_R * 0.85);
        ctx.stroke();
        d += STEP;
      }
      dist += len;
    }
    ctx.restore();

    // Head
    const hx = pts[0].x, hy = pts[0].y;
    ctx.save();
    ctx.shadowColor   = "rgba(0,0,0,0.35)";
    ctx.shadowBlur    = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle     = sk.head;
    ctx.beginPath();
    ctx.arc(hx, hy, TUBE_R + 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.ellipse(hx - g.dir.x * 2, hy - g.dir.y * 2, TUBE_R * 0.5, TUBE_R * 0.3, Math.atan2(g.dir.y, g.dir.x), 0, Math.PI * 2);
    ctx.fill();

    const perp = { x: -g.dir.y, y: g.dir.x };
    const ecx  = hx + g.dir.x * TUBE_R * 0.55;
    const ecy  = hy + g.dir.y * TUBE_R * 0.55;
    [1, -1].forEach((s) => {
      const ex = ecx + perp.x * s * TUBE_R * 0.42;
      const ey = ecy + perp.y * s * TUBE_R * 0.42;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(ex, ey, TUBE_R * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath(); ctx.arc(ex + g.dir.x * 1.5, ey + g.dir.y * 1.5, TUBE_R * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath(); ctx.arc(ex + g.dir.x * 0.8 - 1, ey + g.dir.y * 0.8 - 1, TUBE_R * 0.07, 0, Math.PI * 2); ctx.fill();
    });

    if (Math.abs(Math.sin(Date.now() / 200)) > 0.5) {
      const tx = hx + g.dir.x * (TUBE_R + 6), ty = hy + g.dir.y * (TUBE_R + 6);
      ctx.strokeStyle = "#f43f5e"; ctx.lineWidth = 2; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hx + g.dir.x * TUBE_R, hy + g.dir.y * TUBE_R);
      ctx.lineTo(tx, ty); ctx.stroke();
      [1, -1].forEach((s) => {
        ctx.beginPath(); ctx.moveTo(tx, ty);
        ctx.lineTo(tx + g.dir.x * 5 + perp.x * s * 5, ty + g.dir.y * 5 + perp.y * s * 5);
        ctx.stroke();
      });
    }
    ctx.restore();
  }, [skin, sk]);

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "game") return;
    let last = 0;

    const loop = (ts) => {
      animRef.current = requestAnimationFrame(loop);
      const g = gameRef.current;
      if (!g) return;
      drawGame(g);
      if (pausedRef.current || !g.alive) return;
      if (ts - last < g.speed) return;
      last = ts;

      g.dir       = g.nextDir;
      const head  = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };

      // Collision → game over
      if (
        head.x < 0 || head.x >= COLS ||
        head.y < 0 || head.y >= ROWS ||
        g.snake.some((s) => s.x === head.x && s.y === head.y)
      ) {
        g.alive = false;
        if (g.score > bestScore) persistBest(g.score);
        setGameState({ ...g });
        return;
      }

      g.snake = [head, ...g.snake.slice(0, -1)];

      const active = g.letters.find((l) => l.active && l.x === head.x && l.y === head.y);
      if (active) {
        g.collected = [...g.collected, active.letter];
        g.score    += 10 + speedLevel * 2;
        if (g.score > bestScore) persistBest(g.score);

        g.snake = [...g.snake, g.snake[g.snake.length - 1]];
        spawnParticles(active.x, active.y, active.letter, sk.glow);

        const nextIdx = active.idx + 1;
        g.letters = g.letters
          .map((l) => {
            if (l.idx === active.idx) return null;
            if (l.idx === nextIdx)    return { ...l, active: true };
            return l;
          })
          .filter(Boolean);

        if (g.letters.length === 0) {
          const bonus = 50 + g.wordsCompleted * 10;
          g.score += bonus;
          if (g.score > bestScore) persistBest(g.score);
          g.wordsCompleted += 1;

          const nextWord    = randomWord();
          pausedRef.current = true;
          setGameState({ ...g });
          setWordComplete({ nextWord, bonus });

          g.word      = nextWord;
          g.collected = [];
          g.letters   = nextWord.split("").map((l, i) => ({
            letter: l, idx: i, ...randomPos(g.snake), active: i === 0,
          }));
          return;
        }
      }

      setGameState({ ...g });
      setParticles((p) =>
        p
          .map((pt) => ({
            ...pt,
            x: pt.x + pt.vx, y: pt.y + pt.vy,
            life: pt.life - 0.05,
            vx:   pt.vx * 0.9, vy: pt.vy * 0.9,
          }))
          .filter((pt) => pt.life > 0)
      );
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [screen, skin, spawnParticles, drawGame, bestScore, persistBest]);

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (screen === "menu") {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${sk.bg} flex flex-col font-sans select-none`}>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 self-start bg-gray-900/80 hover:bg-gray-800 px-5 py-3 font-bold text-white uppercase text-sm tracking-widest transition-colors"
        >
          <ArrowLeft size={16} /> Exit
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="mb-8 text-center">
            <div className="flex items-center gap-3 justify-center mb-2">
              <Snail size={44} className={sk.tag} />
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                Word<span className={sk.tag}>Snake</span>
              </h1>
            </div>
            <p className="text-gray-400 text-base sm:text-lg">Spell the word — beat the clock</p>
          </div>

          <div className={`bg-gray-900 border ${sk.border} border-opacity-40 rounded-2xl p-6 w-full max-w-sm shadow-2xl`}>
            <h2 className="text-gray-300 text-sm font-semibold uppercase tracking-widest mb-4">
              Choose Your Skin
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(SKINS).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => setSkin(key)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    skin === key
                      ? `${s.border} bg-gray-800`
                      : "border-gray-700 bg-gray-800 hover:border-gray-500"
                  }`}
                >
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rounded-full"
                        style={{ width: 14, height: 14, background: lerpColor(s.head, s.tail, i / 3) }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-300 font-medium">{s.name}</span>
                  {skin === key && (
                    <span className={`text-xs font-bold ${s.tag}`}>✓ Selected</span>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-5 border border-gray-700">
              <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-3 text-center">
                How to play
              </h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className={sk.tag}>🔤</span>
                  Collect letters <span className={`font-bold ${sk.tag}`}>in order</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowBigUp size={16} className={sk.tag} /> Arrow keys or WASD
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={16} className={sk.tag} /> Speed increases every 15s
                </li>
                <li className="flex items-center gap-2">
                  <Skull size={16} className={sk.tag} /> Avoid walls and yourself
                </li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className={`w-full ${sk.btn} text-white font-black text-xl py-4 rounded-xl shadow-lg transition-all active:scale-95 tracking-wide`}
            >
              PLAY
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── GAME ──────────────────────────────────────────────────────────────────
  if (screen === "game") {
    const g2 = gameState;
    return (
      <div className={`min-h-screen bg-gradient-to-br ${sk.bg} flex flex-col items-center justify-start pt-3 pb-6 px-2 select-none`}>

        {/* HUD */}
        <div className="w-full max-w-2xl mb-2">
          <div className="flex items-center justify-between flex-wrap gap-2 px-1">
            <span className="text-white font-black text-lg sm:text-2xl flex items-center gap-2">
              <Snail size={22} className={sk.tag} />
              Word<span className={sk.tag}>Snake</span>
            </span>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="text-center">
                <div className="text-gray-400 text-xs uppercase tracking-widest">Best</div>
                <div className="text-white/60 font-black text-lg">{bestScore}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-xs uppercase tracking-widest">Score</div>
                <div className={`text-white font-black text-lg ${sk.tag}`}>{g2?.score ?? 0}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-xs uppercase tracking-widest">Speed</div>
                <div className={`font-black text-lg ${sk.tag}`}>×{speedLevel}</div>
              </div>
              <button
                onClick={() => { stopAll(); setScreen("menu"); }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
              >
                ✕ Exit
              </button>
            </div>
          </div>
        </div>

        {/* Word progress bar */}
        {g2 && (
          <div className={`w-full max-w-2xl bg-gray-900 rounded-xl p-3 mb-2 border ${sk.border} border-opacity-30`}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-gray-400 text-xs uppercase tracking-widest shrink-0">Spell:</span>
              <div className="flex gap-1 flex-wrap">
                {g2.word.split("").map((l, i) => {
                  const done = i < g2.collected.length;
                  const next = i === g2.collected.length;
                  return (
                    <span
                      key={i}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg font-black text-sm sm:text-base transition-all duration-300"
                      style={{
                        background: done ? sk.head : next ? sk.body + "88" : "#1f2937",
                        color:      done || next ? "#fff" : "#6b7280",
                      }}
                    >
                      {l}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width:      `${g2.word.length > 0 ? (g2.collected.length / g2.word.length) * 100 : 0}%`,
                  background: sk.head,
                }}
              />
            </div>
          </div>
        )}

        {/* Canvas container — ResizeObserver watches this for cell-size updates */}
        <div
          ref={containerRef}
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
          style={{ border: `3px solid ${sk.head}44` }}
        >
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
          {particles.map((p) =>
            p.letter ? (
              <div
                key={p.id}
                className="absolute pointer-events-none font-black"
                style={{
                  left:       p.x,
                  top:        p.y,
                  color:      p.color,
                  opacity:    p.life,
                  transform:  "translate(-50%,-50%)",
                  textShadow: `0 0 12px ${p.color}`,
                  fontSize:   p.size,
                }}
              >
                {p.letter}
              </div>
            ) : (
              <div
                key={p.id}
                className="absolute pointer-events-none rounded-full"
                style={{
                  left:       p.x - p.size / 2,
                  top:        p.y - p.size / 2,
                  width:      p.size,
                  height:     p.size,
                  background: p.color,
                  opacity:    p.life * 0.8,
                }}
              />
            )
          )}
        </div>

        {/* Mobile D-pad — two separate rows so layout is always correct */}
        <div className="w-full max-w-xs mt-4 md:hidden">
          {/* Row 1: UP */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div />
            <button
              onPointerDown={() => handleDir(0, -1)}
              className={`${sk.btn} text-white font-black py-4 rounded-xl text-xl active:scale-95 transition-all flex items-center justify-center`}
            >
              <ArrowBigUp />
            </button>
            <div />
          </div>
          {/* Row 2: LEFT  DOWN  RIGHT */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onPointerDown={() => handleDir(-1, 0)}
              className={`${sk.btn} text-white font-black py-4 rounded-xl text-xl active:scale-95 transition-all flex items-center justify-center`}
            >
              <ArrowBigLeft />
            </button>
            <button
              onPointerDown={() => handleDir(0, 1)}
              className={`${sk.btn} text-white font-black py-4 rounded-xl text-xl active:scale-95 transition-all flex items-center justify-center`}
            >
              <ArrowBigDown />
            </button>
            <button
              onPointerDown={() => handleDir(1, 0)}
              className={`${sk.btn} text-white font-black py-4 rounded-xl text-xl active:scale-95 transition-all flex items-center justify-center`}
            >
              <ArrowBigRight />
            </button>
          </div>
        </div>

        {/* Word Complete overlay */}
        {wordComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10 px-4">
            <div className={`bg-gray-900 border-2 ${sk.border} rounded-2xl p-8 text-center shadow-2xl w-full max-w-xs`}>
              <Trophy size={48} className={`${sk.tag} mx-auto mb-3`} />
              <h2 className="text-white font-black text-3xl mb-1">Word Complete!</h2>
              <p className={`${sk.tag} font-bold text-lg mb-4`}>+{wordComplete.bonus} bonus points!</p>
              <button
                onClick={continueAfterWord}
                className={`${sk.btn} text-white font-black px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto`}
              >
                <Play size={18} /> Continue
              </button>
            </div>
          </div>
        )}

        {/* Game Over overlay */}
        {g2 && !g2.alive && !wordComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10 px-4">
            <div className={`bg-gray-900 border-2 ${sk.border} rounded-2xl p-8 text-center shadow-2xl w-full max-w-xs`}>
              <Skull size={48} className={`${sk.tag} mx-auto mb-3`} />
              <h2 className="text-white font-black text-3xl mb-1">GAME OVER</h2>
              <div className={`text-4xl font-black ${sk.tag} mb-2`}>{g2.score} pts</div>
              <div className="text-gray-400 text-sm mb-6">
                BEST SCORE: <span className="text-white font-bold">{bestScore}</span>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={startGame}
                  className={`${sk.btn} text-white font-black px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95`}
                >
                  Play Again
                </button>
                <button
                  onClick={() => { stopAll(); setScreen("menu"); }}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-black px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}