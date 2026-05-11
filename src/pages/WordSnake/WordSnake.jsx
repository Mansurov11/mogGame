import { ArrowBigDown, ArrowBigLeft, ArrowBigRight, ArrowBigUp, Snail } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

const CELL = 28;
const COLS = 22;
const ROWS = 18;
const W = COLS * CELL;
const H = ROWS * CELL;

const WORDS = [
  "REACT","SNAKE","PIXEL","FLAME","QUEST","CLOUD","BLAZE","STORM","SWIFT","CRYSTAL",
  "SPARK","FROST","VENOM","LUNAR","PRISM","NEXUS","DELTA","EMBER","GHOST","HYPER",
  "IRON","JADE","KNIGHT","LASER","MAGIC","NEON","ORBIT","POWER","QUARTZ","ROGUE",
  "SOLAR","TITAN","ULTRA","VAPOR","WARP","XENON","YIELD","ZEAL","ASTRO","BINARY"
];

const SKINS = {
  classic: {
    name: "Classic",
    head: "#22c55e",
    body: "#16a34a",
    tail: "#15803d",
    glow: "#4ade80",
    eye: "#fff",
    accent: "#86efac",
    bg: "from-green-950 via-gray-950 to-green-950",
    border: "border-green-500",
    btn: "bg-green-500 hover:bg-green-400",
    tag: "text-green-400",
    letterBg: "#14532d",
    letterText: "#86efac",
  },
  blue: {
    name: "Ocean",
    head: "#3b82f6",
    body: "#2563eb",
    tail: "#1d4ed8",
    glow: "#60a5fa",
    eye: "#fff",
    accent: "#93c5fd",
    bg: "from-blue-950 via-gray-950 to-blue-950",
    border: "border-blue-500",
    btn: "bg-blue-500 hover:bg-blue-400",
    tag: "text-blue-400",
    letterBg: "#1e3a8a",
    letterText: "#93c5fd",
  },
  red: {
    name: "Inferno",
    head: "#ef4444",
    body: "#dc2626",
    tail: "#b91c1c",
    glow: "#f87171",
    eye: "#fff",
    accent: "#fca5a5",
    bg: "from-red-950 via-gray-950 to-red-950",
    border: "border-red-500",
    btn: "bg-red-500 hover:bg-red-400",
    tag: "text-red-400",
    letterBg: "#7f1d1d",
    letterText: "#fca5a5",
  },
  purple: {
    name: "Cosmic",
    head: "#a855f7",
    body: "#9333ea",
    tail: "#7e22ce",
    glow: "#c084fc",
    eye: "#fff",
    accent: "#d8b4fe",
    bg: "from-purple-950 via-gray-950 to-purple-950",
    border: "border-purple-500",
    btn: "bg-purple-500 hover:bg-purple-400",
    tag: "text-purple-400",
    letterBg: "#3b0764",
    letterText: "#d8b4fe",
  },
};

function randomWord() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }
function randomPos(snake = []) {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function initGame() {
  const word = randomWord();
  const snake = [
    { x: 10, y: 9 }, { x: 9, y: 9 }, { x: 8, y: 9 },
  ];
  const letters = word.split("").map((l, i) => ({
    letter: l, idx: i,
    ...randomPos(snake),
    active: i === 0,
  }));
  return { snake, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 }, word, letters, collected: [], score: 0, speed: 160, alive: true, nextIdx: 0 };
}

export default function WordSnake() {
  const [screen, setScreen] = useState("menu");
  const [skin, setSkin] = useState("classic");
  const [game, setGame] = useState(null);
  const [tick, setTick] = useState(0);
  const [particles, setParticles] = useState([]);
  const [speedLevel, setSpeedLevel] = useState(1);
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const animRef = useRef(null);
  const lastTickRef = useRef(0);
  const speedTimerRef = useRef(null);
  const sk = SKINS[skin];

  const startGame = useCallback(() => {
    const g = initGame();
    gameRef.current = g;
    setGame({ ...g });
    setParticles([]);
    setSpeedLevel(1);
    setScreen("game");
  }, []);

  const spawnParticles = useCallback((x, y, letter, color) => {
    const px = x * CELL + CELL / 2;
    const py = y * CELL + CELL / 2;
    const burst = Array.from({ length: 10 }, (_, i) => ({
      id: Math.random(),
      x: px, y: py,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 1,
      color,
      letter: i === 0 ? letter : null,
      size: i === 0 ? 16 : 4 + Math.random() * 4,
    }));
    setParticles(p => [...p, ...burst]);
  }, []);

  useEffect(() => {
    if (screen !== "game") return;
    speedTimerRef.current = setInterval(() => {
      if (!gameRef.current || !gameRef.current.alive) return;
      gameRef.current.speed = Math.max(60, gameRef.current.speed - 8);
      setSpeedLevel(l => l + 1);
    }, 5000);
    return () => clearInterval(speedTimerRef.current);
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return;
    const onKey = (e) => {
      const g = gameRef.current;
      if (!g || !g.alive) return;
      const map = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
      };
      const nd = map[e.key];
      if (!nd) return;
      if (nd.x === -g.dir.x && nd.y === -g.dir.y) return;
      e.preventDefault();
      g.nextDir = nd;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return;
    let last = 0;
    const loop = (ts) => {
      animRef.current = requestAnimationFrame(loop);
      if (!gameRef.current || !gameRef.current.alive) return;
      const g = gameRef.current;
      if (ts - last < g.speed) {
        drawGame(g);
        return;
      }
      last = ts;
      g.dir = g.nextDir;
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || g.snake.some(s => s.x === head.x && s.y === head.y)) {
        g.alive = false;
        setGame({ ...g });
        return;
      }
      g.snake = [head, ...g.snake.slice(0, -1)];
      const active = g.letters.find(l => l.active && l.x === head.x && l.y === head.y);
      if (active) {
        g.collected = [...g.collected, active.letter];
        g.score += 10 + speedLevel * 2;
        g.snake = [...g.snake, g.snake[g.snake.length - 1]];
        spawnParticles(active.x, active.y, active.letter, sk.glow);
        const nextIdx = active.idx + 1;
        g.letters = g.letters.map(l => {
          if (l.idx === active.idx) return null;
          if (l.idx === nextIdx) return { ...l, active: true };
          return l;
        }).filter(Boolean);
        if (g.letters.length === 0) {
          const word = randomWord();
          g.word = word;
          g.collected = [];
          g.score += 50;
          g.letters = word.split("").map((l, i) => ({
            letter: l, idx: i,
            ...randomPos(g.snake),
            active: i === 0,
          }));
        }
      }
      setTick(t => t + 1);
      setParticles(p => p.map(pt => ({ ...pt, x: pt.x + pt.vx, y: pt.y + pt.vy, life: pt.life - 0.05, vx: pt.vx * 0.9, vy: pt.vy * 0.9 })).filter(pt => pt.life > 0));
      drawGame(g);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [screen, skin, spawnParticles]);

  const drawGame = useCallback((g) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, W, H);
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      if ((x + y) % 2 === 0) { ctx.fillStyle = "rgba(255,255,255,0.018)"; ctx.fillRect(x * CELL, y * CELL, CELL, CELL); }
    }

    // Letters
    g.letters.forEach(l => {
      const px = l.x * CELL, py = l.y * CELL;
      ctx.save();
      ctx.globalAlpha = l.active ? 1 : 0.5;
      if (l.active) { ctx.shadowColor = sk.glow; ctx.shadowBlur = 18; }
      ctx.fillStyle = l.active ? sk.head : "#1e293b";
      roundRect(ctx, px + 4, py + 4, CELL - 8, CELL - 8, 7);
      ctx.fill();
      ctx.shadowBlur = 0;
      // inner shine
      if (l.active) {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        roundRect(ctx, px + 5, py + 5, CELL - 10, (CELL - 10) * 0.45, 5);
        ctx.fill();
      }
      ctx.fillStyle = l.active ? "#fff" : sk.accent;
      ctx.font = `700 ${CELL * 0.5}px 'Segoe UI', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(l.letter, px + CELL / 2, py + CELL / 2 + 1);
      ctx.restore();
    });

    // ── Solid tube snake ──────────────────────────────────────────
    const pts = g.snake.map(s => ({ x: s.x * CELL + CELL / 2, y: s.y * CELL + CELL / 2 }));
    const n = pts.length;
    if (n < 1) return;

    const TUBE_R = CELL * 0.42;   // tube radius — nearly full cell
    const SHINE_R = TUBE_R * 0.55; // highlight strip width

    // Draw body as a single thick stroked path (fills all gaps at corners)
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Outer glow pass
    ctx.strokeStyle = sk.body;
    ctx.lineWidth = TUBE_R * 2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Solid body — gradient from head color → tail color along the path
    // We draw segments individually so we can shade head→tail
    for (let i = n - 2; i >= 0; i--) {
      const t0 = i / Math.max(n - 1, 1);
      const t1 = (i + 1) / Math.max(n - 1, 1);
      const c0 = lerpColor(sk.head, sk.tail, t0);
      const c1 = lerpColor(sk.head, sk.tail, t1);
      const grad = ctx.createLinearGradient(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
      grad.addColorStop(0, c0);
      grad.addColorStop(1, c1);
      ctx.strokeStyle = grad;
      ctx.lineWidth = TUBE_R * 2;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
    }

    // Top shine stripe — makes it look cylindrical / 3D
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = SHINE_R;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();

    // Scales texture: subtle dark rings along the body every ~1.5 cells
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 2.5;
    let dist = 0;
    const SCALE_STEP = CELL * 1.3;
    for (let i = 1; i < n; i++) {
      const dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      let d = 0;
      while (dist + d + SCALE_STEP <= dist + segLen) {
        d += SCALE_STEP - (dist % SCALE_STEP || SCALE_STEP);
        if (d < 0) d = 0;
        const fx = pts[i - 1].x + (dx / segLen) * d;
        const fy = pts[i - 1].y + (dy / segLen) * d;
        const perp = { x: -dy / segLen, y: dx / segLen };
        ctx.beginPath();
        ctx.moveTo(fx + perp.x * TUBE_R * 0.85, fy + perp.y * TUBE_R * 0.85);
        ctx.lineTo(fx - perp.x * TUBE_R * 0.85, fy - perp.y * TUBE_R * 0.85);
        ctx.stroke();
        d += SCALE_STEP;
      }
      dist += segLen;
    }

    ctx.restore();

    // ── Head ──────────────────────────────────────────────────────
    const hx = pts[0].x, hy = pts[0].y;
    ctx.save();
    ctx.shadowColor = sk.glow;
    ctx.shadowBlur = 20;
    ctx.fillStyle = sk.head;
    ctx.beginPath();
    ctx.arc(hx, hy, TUBE_R + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Head shine
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.ellipse(hx - g.dir.x * 2, hy - g.dir.y * 2, TUBE_R * 0.5, TUBE_R * 0.3, Math.atan2(g.dir.y, g.dir.x), 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeOff = TUBE_R * 0.55;
    const perp = { x: -g.dir.y, y: g.dir.x };
    const ecx = hx + g.dir.x * eyeOff;
    const ecy = hy + g.dir.y * eyeOff;
    [1, -1].forEach(s => {
      const ex = ecx + perp.x * s * TUBE_R * 0.42;
      const ey = ecy + perp.y * s * TUBE_R * 0.42;
      // white sclera
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(ex, ey, TUBE_R * 0.28, 0, Math.PI * 2); ctx.fill();
      // pupil
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath(); ctx.arc(ex + g.dir.x * 1.5, ey + g.dir.y * 1.5, TUBE_R * 0.14, 0, Math.PI * 2); ctx.fill();
      // glint
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath(); ctx.arc(ex + g.dir.x * 0.8 - 1, ey + g.dir.y * 0.8 - 1, TUBE_R * 0.07, 0, Math.PI * 2); ctx.fill();
    });

    // Tongue (forked, animated)
    const tonguePhase = (Date.now() / 200) % (Math.PI * 2);
    const tongueOut = Math.abs(Math.sin(tonguePhase)) > 0.5;
    if (tongueOut) {
      const tx = hx + g.dir.x * (TUBE_R + 6);
      const ty = hy + g.dir.y * (TUBE_R + 6);
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hx + g.dir.x * TUBE_R, hy + g.dir.y * TUBE_R);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      [1, -1].forEach(s => {
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + g.dir.x * 5 + perp.x * s * 5, ty + g.dir.y * 5 + perp.y * s * 5);
        ctx.stroke();
      });
    }

    ctx.restore();
  }, [skin, sk]);

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function lerpColor(a, b, t) {
    const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl2 = Math.round(ab + (bb - ab) * t);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl2.toString(16).padStart(2, "0")}`;
  }

  const handleDir = useCallback((dx, dy) => {
    const g = gameRef.current;
    if (!g) return;
    if (dx === -g.dir.x && dy === -g.dir.y) return;
    g.nextDir = { x: dx, y: dy };
  }, []);

  if (screen === "menu") return (
    <div className={`min-h-screen bg-gradient-to-br ${sk.bg} flex flex-col items-center justify-center font-sans select-none`}>
      <div className="mb-8 text-center">
        <div className="flex items-center gap-3 justify-center mb-2">
          <span className="text-5xl"><Snail  className={sk.tag}></Snail></span>
          <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-lg">Word<span className={sk.tag}>Snake</span></h1>
        </div>
        <p className="text-gray-400 text-lg">Spell the word — beat the clock</p>
      </div>

      <div className={`bg-gray-900 border ${sk.border} border-opacity-40 rounded-2xl p-7 w-80 shadow-2xl`}>
        <h2 className="text-gray-300 text-sm font-semibold uppercase tracking-widest mb-4">Choose Your Skin</h2>
        <div className="grid grid-cols-2 gap-3 mb-6 transition-all ease-in-out">
          {Object.entries(SKINS).map(([key, s]) => (
            <button  key={key} onClick={() => setSkin(key)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${skin === key ? `border-opacity-100 ${s.border} bg-gray-800` : "border-gray-700 border-opacity-60 bg-gray-800 hover:bg-gray-750"}`}>
              <div className="flex gap-1 transition-all ease-in-out">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="rounded-full transition-all ease-in-out" style={{ width: 14, height: 14, background: lerpColor2(s.head, s.tail, i / 3) }} />
                ))}
              </div>
              <span className="text-xs text-gray-300 font-medium">{s.name}</span>
              {skin === key && <span className={`text-xs font-bold ${s.tag}`}>✓ Selected</span>}
            </button>
          ))}
        </div>

        <div className={`bg-gray-800 rounded-xl p-4 mb-5 border border-gray-700`}>
          <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-2">How to play</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>🔤 Collect letters <span className={`font-bold ${sk.tag}`}>in order</span> to spell the word</li>
            <li>⬆️ Use arrow keys or WASD</li>
            <li>⚡ Speed increases every 5 seconds</li>
            <li>💀 Avoid walls and yourself</li>
          </ul>
        </div>

        <button onClick={startGame} className={`w-full ${sk.btn} text-white font-black text-xl py-4 rounded-xl shadow-lg transition-all active:scale-95 tracking-wide`}>
          PLAY
        </button>
      </div>
    </div>
  );

  if (screen === "game") {
    const g = gameRef.current;
    const g2 = game || g;
    const progressPct = g2 ? (g2.collected.length / (g2.collected.length + g2.letters.length)) * 100 : 0;

    return (
      <div className={`min-h-screen bg-linear-to-br ${sk.bg} flex flex-col items-center justify-center select-none`}>
        <div className="w-full max-w-2xl px-2">
          <div className={`flex items-center justify-between mb-3 px-1`}>
            <div className="flex items-center gap-3">
              <span className="text-white font-black text-2xl"> Word<span className={sk.tag}>Snake</span> <Snail  className={sk.tag}></Snail></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-gray-400 text-xs uppercase tracking-widest">Score</div>
                <div className={`text-white font-black text-xl ${sk.tag}`}>{g2?.score || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-xs uppercase tracking-widest">Speed</div>
                <div className={`font-black text-xl ${sk.tag}`}>×{speedLevel}</div>
              </div>
              <button onClick={() => { cancelAnimationFrame(animRef.current); clearInterval(speedTimerRef.current); setScreen("menu"); }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors">
                ✕ Exit
              </button>
            </div>
          </div>

          {g2 && (
            <div className={`bg-gray-900 rounded-xl p-3 mb-3 border ${sk.border} border-opacity-30`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 text-xs uppercase tracking-widest">Spell:</span>
                <div className="flex gap-1 flex-wrap">
                  {g2.word.split("").map((l, i) => {
                    const collected = i < g2.collected.length;
                    const isNext = i === g2.collected.length;
                    return (
                      <span key={i} className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-base transition-all duration-300
                        ${collected ? `text-white` : isNext ? "text-white" : "text-gray-500"}`}
                        style={{ background: collected ? sk.head : isNext ? sk.body + "88" : "#1f2937" }}>
                        {l}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(g2.collected.length / g2.word.length) * 100}%`, background: sk.head }} />
              </div>
            </div>
          )}

          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ border: `10px solid ${sk.head}44` }}>
            <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", width: "100%" }} />
            {particles.map(p => p.letter ? (
              <div key={p.id} className="absolute pointer-events-none font-black text-lg"
                style={{ left: p.x, top: p.y, color: p.color, opacity: p.life, transform: "translate(-50%,-50%)", textShadow: `0 0 12px ${p.color}`, fontSize: p.size, transition: "none" }}>
                {p.letter}
              </div>
            ) : (
              <div key={p.id} className="absolute pointer-events-none rounded-full transition-all ease-in-out"
                style={{ left: p.x - p.size / 2, top: p.y - p.size / 2, width: p.size, height: p.size, background: p.color, opacity: p.life * 0.8 }} />
            ))}

            {g2 && !g2.alive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
                <div className={`bg-gray-900 border-2 ${sk.border} rounded-2xl p-8 text-center shadow-2xl`}>
                  <div className="text-5xl mb-3">💀</div>
                  <h2 className="text-white font-black text-3xl mb-1">GAME OVER</h2>
                  <p className="text-gray-400 mb-4">You spelled: <span className={`font-bold ${sk.tag}`}>{g2.collected.join("") || "nothing"}</span></p>
                  <div className={`text-4xl font-black ${sk.tag} mb-6`}>{g2.score} pts</div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={startGame} className={`${sk.btn} text-white font-black px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95`}>
                      RETRY
                    </button>
                    <button onClick={() => { cancelAnimationFrame(animRef.current); clearInterval(speedTimerRef.current); setScreen("menu"); }}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                      Menu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
            {[
              [null, { x: 0, y: -1 }, null],
              [{ x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }],
            ].map((row, ri) => (
              <div key={ri} className="contents">
                {row.map((d, ci) => d ? (
                  <button key={ci} onPointerDown={() => handleDir(d.x, d.y)}
                    className={`${sk.btn} text-white font-black py-4 rounded-xl text-xl active:scale-95 transition-all`}>
                    {d.y === -1 ? <ArrowBigUp /> : d.y === 1 ? <ArrowBigDown /> : d.x === -1 ?<ArrowBigLeft /> : <ArrowBigRight />}
                  </button>
                ) : <div key={ci} />)}
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 text-xs mt-3">Arrow keys / WASD to move</p>
        </div>
      </div>
    );
  }

  return null;
}

function lerpColor2(a, b, t) {
  const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl2 = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl2.toString(16).padStart(2, "0")}`;
}