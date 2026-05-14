import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import doom from "../../../public/doom.png";

// FIREBASE INTEGRATSIYASI
import { auth, db } from "../../firebase";
import { ref, update, get } from "firebase/database";

const LOGICAL_W = 1020, LOGICAL_H = 700;
const BIRD_X = 150, BIRD_SIZE = 80, BUBBLE_SIZE = 90;
const GRAVITY = 0.2, JUMP_FORCE = -8;
const BASE_SPEED = 4;

const LESSONS = [
  { q: "Which is a VERB?",         correct: "RUN",      decoys: ["APPLE","BLUE","HAPPY"] },
  { q: "Plural of 'BOX'?",         correct: "BOXES",    decoys: ["BOXS","BOXIES","BOX"] },
  { q: "Past tense of 'SEE'?",     correct: "SAW",      decoys: ["SEEN","SEED","SAWED"] },
  { q: "Opposite of 'DIFFICULT'?", correct: "EASY",     decoys: ["HARD","FAST","SLOW"] },
  { q: "Which is an ADJECTIVE?",   correct: "COLD",     decoys: ["JUMP","STREET","SING"] },
  { q: "Past tense of 'GO'?",      correct: "WENT",     decoys: ["GOED","GONE","GOING"] },
  { q: "Which is a NOUN?",         correct: "CITY",     decoys: ["SHOUT","BRIGHT","GENTLY"] },
  { q: "Plural of 'CHILD'?",       correct: "CHILDREN", decoys: ["CHILDS","CHILDES","CHILDRE"] },
  { q: "Opposite of 'ANCIENT'?",   correct: "MODERN",   decoys: ["OLD","YOUNG","DATED"] },
  { q: "Past tense of 'WRITE'?",   correct: "WROTE",    decoys: ["WRITED","WRITTEN","WRIT"] },
  { q: "Which is an ADVERB?",      correct: "QUICKLY",  decoys: ["QUICK","QUICKNESS","QUICKER"] },
  { q: "Plural of 'MOUSE'?",       correct: "MICE",     decoys: ["MOUSES","MOUSE","MICES"] },
  { q: "Opposite of 'EXPAND'?",    correct: "SHRINK",   decoys: ["GROW","WIDEN","EXTEND"] },
  { q: "Which is a PRONOUN?",      correct: "THEY",     decoys: ["HAPPY","CLIMB","FOREST"] },
  { q: "Past tense of 'BITE'?",    correct: "BIT",      decoys: ["BITED","BITTEN","BITE"] },
  { q: "Plural of 'TOOTH'?",       correct: "TEETH",    decoys: ["TOOTHS","TOOTHES","TOOTH"] },
  { q: "Which is a PREPOSITION?",  correct: "UNDER",    decoys: ["PURPLE","DANCE","SMOOTH"] },
  { q: "Opposite of 'SHALLOW'?",   correct: "DEEP",     decoys: ["WIDE","LONG","TALL"] },
  { q: "Past tense of 'FLY'?",     correct: "FLEW",     decoys: ["FLIED","FLOWN","FLEWED"] },
  { q: "Which is a CONJUNCTION?",  correct: "BECAUSE",  decoys: ["TABLE","BRIGHT","SLOWLY"] },
];

function randLesson() { return LESSONS[Math.floor(Math.random() * LESSONS.length)]; }
function uid() { return Math.random().toString(36).slice(2); }

function HeartIcon({ filled }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24"
      fill={filled ? "#ef4444" : "none"}
      stroke={filled ? "#ef4444" : "#4b5563"} strokeWidth="2.2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

// Hook to get canvas dimensions based on viewport
function useCanvasDimensions() {
  const [dims, setDims] = useState({ width: LOGICAL_W, height: LOGICAL_H, scale: 1 });

  useEffect(() => {
    function update() {
      // Account for padding (p-4 on small = 16px each side, p-6 on large = 24px each side)
      const hPad = window.innerWidth < 768 ? 16 : 24;
      const vPad = window.innerWidth < 768 ? 8 : 16;
      // Reserve space for header bar (~80px) and hint text (~28px)
      const maxW = window.innerWidth - hPad * 2;
      const maxH = window.innerHeight - 80 - 28 - vPad * 2;

      const scaleW = maxW / LOGICAL_W;
      const scaleH = maxH / LOGICAL_H;
      const scale = Math.min(scaleW, scaleH, 1); // never upscale beyond 1

      setDims({
        width: Math.floor(LOGICAL_W * scale),
        height: Math.floor(LOGICAL_H * scale),
        scale,
      });
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return dims;
}

export default function EnglishRunner() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('menu');
  const [snap, setSnap]     = useState(null);
  const [best, setBest]     = useState(() => +(localStorage.getItem('eng_best') || 0));

  const { width: canvasW, height: canvasH, scale } = useCanvasDimensions();

  const G   = useRef(null);
  const raf = useRef(null);
  const tickRef = useRef(null);

  const saveToFirebase = async (finalScore) => {
    const user = auth.currentUser;
    if (user) {
      const scoreRef = ref(db, `Users/${user.uid}/bestScores`);
      try {
        const snapshot = await get(scoreRef);
        const currentData = snapshot.val() || {};
        const prevBest = currentData.flappy || 0;
        if (finalScore > prevBest) {
          await update(scoreRef, { flappy: finalScore });
        }
      } catch (err) {
        console.error("Firebase update error:", err);
      }
    }
  };

  // All game logic operates in logical (1020×700) coordinates.
  // The canvas is scaled via CSS transform — no coordinate math needed.

  function newGame() {
    G.current = {
      running:     true,
      birdY:       LOGICAL_H / 2,
      birdVel:     0,
      bubbles:     [],
      pipes:       [],
      score:       0,
      lives:       3,
      combo:       0,
      multiplier:  1,
      powerup:     null,
      powerupTick: 0,
      lesson:      randLesson(),
      wave:        0,
      lastSpawn:   0,
      lastPipe:    0,
      flashTick:   0,
      popups:      [],
      invincible:  0,
    };
  }

  function jump() {
    if (G.current && G.current.running) {
      G.current.birdVel = JUMP_FORCE;
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function hit(g) {
    if (g.invincible > 0) return;
    g.lives--;
    g.flashTick  = 14;
    g.combo      = 0;
    g.multiplier = 1;
    g.birdVel    = 4;
    if (g.lives <= 0) {
      g.running = false;
      setScreen('dead');
      saveToFirebase(g.score);
    } else {
      g.invincible = 80;
    }
  }

  useEffect(() => {
    tickRef.current = function tick(ts) {
      raf.current = requestAnimationFrame(tickRef.current);
      const g = G.current;
      if (!g || !g.running) return;

      const wave      = Math.floor(g.score / 60);
      const speed     = BASE_SPEED + wave * 0.85 + (g.powerup === 'slow' ? -2.5 : 0);
      const spawnRate = Math.max(650, 1400 - wave * 110);
      const pipeCycle = Math.max(2600, 5000 - wave * 380);
      g.wave = wave;

      g.birdVel += GRAVITY;
      g.birdY   += g.birdVel;
      if (g.birdY < 0 || g.birdY > LOGICAL_H - BIRD_SIZE) {
        g.birdY = Math.max(0, Math.min(LOGICAL_H - BIRD_SIZE, g.birdY));
        hit(g);
      }

      if (g.invincible > 0) g.invincible--;
      if (g.flashTick > 0)  g.flashTick--;
      if (g.flashTick < 0)  g.flashTick++;
      if (g.powerup && --g.powerupTick <= 0) g.powerup = null;

      if (ts - g.lastSpawn > spawnRate) {
        g.lastSpawn    = ts;
        const isPowerup = Math.random() > 0.83;
        const isCorrect = !isPowerup && Math.random() > 0.5;
        const text      = isPowerup ? '⚡' : isCorrect ? g.lesson.correct : g.lesson.decoys[Math.floor(Math.random() * g.lesson.decoys.length)];
        const ptype     = isPowerup ? ['shield','slow','double'][Math.floor(Math.random()*3)] : null;
        const ttl       = isCorrect && wave >= 2 ? Math.max(100, 190 - wave * 11) : 99999;
        g.bubbles.push({ id: uid(), x: LOGICAL_W, y: 80 + Math.random() * (LOGICAL_H - 250), text, isCorrect, isPowerup, ptype, ttl, age: 0 });
      }

      if (wave >= 1 && ts - g.lastPipe > pipeCycle) {
        g.lastPipe    = ts;
        const gapSize = Math.max(165, 265 - wave * 11);
        const gapY    = 80 + Math.random() * (LOGICAL_H - gapSize - 150);
        g.pipes.push({ id: uid(), x: LOGICAL_W, gapY, gapSize });
      }

      const bCX = BIRD_X + BIRD_SIZE / 2;
      const bCY = g.birdY + BIRD_SIZE / 2;
      const kept = [];
      for (const b of g.bubbles) {
        b.x -= speed; b.age++;
        if (b.x < -BUBBLE_SIZE || b.age > b.ttl) continue;
        const dx  = bCX - (b.x + BUBBLE_SIZE / 2);
        const dy  = bCY - (b.y + BUBBLE_SIZE / 2);
        const col = Math.sqrt(dx*dx + dy*dy) < (BIRD_SIZE/2 + BUBBLE_SIZE/2) - 13;
        if (col) {
          if (b.isPowerup) {
            g.powerup = b.ptype;
            g.powerupTick = 300; g.flashTick = -8;
          } else if (b.isCorrect) {
            const pts = 10 * g.multiplier * (g.powerup === 'double' ? 2 : 1);
            g.score += pts; g.combo++;
            if (g.combo % 3 === 0) g.multiplier = Math.min(4, g.multiplier + 1);
            g.flashTick = -8;
            g.lesson = randLesson();
            g.popups.push({ id: uid(), text: `+${pts}${g.combo >= 3 ? ' 🔥' : ''}`, x: b.x, y: b.y, age: 0 });
            const nb = g.score;
            setBest(prev => {
              if (nb > prev) { localStorage.setItem('eng_best', nb); return nb; }
              return prev;
            });
          } else {
            if (g.powerup === 'shield') { g.powerup = null; g.powerupTick = 0; g.flashTick = -8; }
            else hit(g);
          }
          continue;
        }
        kept.push(b);
      }
      g.bubbles = kept;

      const keptP = [];
      for (const p of g.pipes) {
        p.x -= speed;
        if (p.x < -80) continue;
        if (g.invincible === 0) {
          const inX = bCX > p.x + 6 && bCX < p.x + 50;
          const inY = bCY < p.gapY + 6 || bCY > p.gapY + p.gapSize - 6;
          if (inX && inY) hit(g);
        }
        keptP.push(p);
      }
      g.pipes = keptP;

      g.popups = g.popups.map(p => ({ ...p, age: p.age + 1 })).filter(p => p.age < 48);

      setSnap({
        birdY:       g.birdY, birdVel:     g.birdVel,
        bubbles:     g.bubbles.slice(), pipes:       g.pipes.slice(),
        score:       g.score, lives:       g.lives,
        combo:       g.combo, multiplier:  g.multiplier,
        powerup:     g.powerup, powerupTick: g.powerupTick,
        lesson:      g.lesson, wave:        g.wave,
        flashTick:   g.flashTick, popups:      g.popups.slice(),
        invincible:  g.invincible,
      });
    };
  }, []);

  useEffect(() => {
    if (screen === 'playing') {
      raf.current = requestAnimationFrame(tickRef.current);
    }
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [screen]);

  function startGame() {
    newGame();
    setScreen('playing');
  }

  const s = snap;
  const flash = s?.flashTick ?? 0;
  const flashBg = flash > 0 ? `rgba(220,38,38,0.28)` : flash < 0 ? `rgba(34,197,94,0.22)` : undefined;
  const birdGlow = s?.powerup === 'shield' ? '0 0 26px 5px rgba(99,102,241,0.9)' : s?.powerup === 'double' ? '0 0 22px 4px rgba(251,191,36,0.9)' : '0 0 14px 2px rgba(59,130,246,0.5)';
  const wl = !s ? 'EASY' : s.wave >= 3 ? 'NIGHTMARE' : s.wave >= 2 ? 'HARD' : s.wave >= 1 ? 'NORMAL' : 'EASY';
  const wc = !s ? '#4ade80' : s.wave >= 3 ? '#f97316' : s.wave >= 2 ? '#ef4444' : s.wave >= 1 ? '#facc15' : '#4ade80';

  return (
    <>
      <style>{`
        @keyframes shield  { 0%,100%{opacity:.9;transform:scale(1)}   50%{opacity:.35;transform:scale(1.15)} }
        @keyframes pwrBob  { 0%,100%{transform:translateY(0)scale(1)} 50%{transform:translateY(-5px)scale(1.08)} }
        @keyframes fadeUp  { 0%{opacity:1;transform:translateY(0)}    100%{opacity:0;transform:translateY(-38px)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      <div style={{
        minHeight: '100svh',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 16px',
        color: 'white',
        userSelect: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
        {/* ── Header bar ── */}
        <div style={{
          width: '100%',
          maxWidth: canvasW,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 8,
          flexShrink: 0,
        }}>
          <button onClick={() => navigate("/")} style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "#64748b", background: "none", border: "none",
            cursor: "pointer", fontSize: 14, padding: 0,
          }}>
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {[1,2,3].map(i => <HeartIcon key={i} filled={(s?.lives ?? 3) >= i}/>)}
            </div>
            {screen === 'playing' && s && (
              <div style={{ background: '#1e293b', padding: '4px 12px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, marginBottom: 2, color: wc }}>WAVE</p>
                <p style={{ fontSize: 13, fontWeight: 900, margin: 0, color: wc }}>{wl}</p>
              </div>
            )}
            {(s?.combo ?? 0) >= 2 && (
              <div style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', padding: '4px 12px', borderRadius: 16, textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, marginBottom: 2 }}>COMBO</p>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#fde68a', margin: 0 }}>{s.combo}×</p>
              </div>
            )}
            {(s?.multiplier ?? 1) > 1 && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 10px', borderRadius: 16, textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 900, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, marginBottom: 2 }}>MULT</p>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#fecaca', margin: 0 }}>{s.multiplier}×</p>
              </div>
            )}
            {s?.powerup && (
              <div style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', padding: '4px 12px', borderRadius: 16, minWidth: 76 }}>
                <p style={{ fontSize: 9, fontWeight: 900, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, marginBottom: 4 }}>
                  {s.powerup === 'shield' ? '🛡 SHIELD' : s.powerup === 'slow' ? '⏱ SLOW' : '⭐ ×2 PTS'}
                </p>
                <div style={{ width: '100%', background: '#334155', borderRadius: 4, height: 5 }}>
                  <div style={{ background: '#a78bfa', height: 5, borderRadius: 4, width: `${(s.powerupTick/300)*100}%` }}/>
                </div>
              </div>
            )}
            <div style={{ background: '#1e293b', padding: '4px 14px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <p style={{ fontSize: 9, fontWeight: 900, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, marginBottom: 2 }}>SCORE</p>
              <p style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{s?.score ?? 0}</p>
            </div>
            <div style={{ background: '#1e293b', padding: '4px 14px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <p style={{ fontSize: 9, fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, marginBottom: 2 }}>BEST</p>
              <p style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{best}</p>
            </div>
          </div>
        </div>

        {/* ── Game canvas wrapper ──
            The inner div is always LOGICAL_W × LOGICAL_H and scaled via CSS transform.
            Everything inside uses logical pixel coordinates — no coordinate conversion needed. */}
        <div
          style={{
            width: canvasW,
            height: canvasH,
            flexShrink: 0,
            position: 'relative',
            borderRadius: 32,
            border: '2px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
            cursor: screen === 'playing' ? 'pointer' : 'default',
          }}
          onMouseDown={screen === 'playing' ? jump : undefined}
          onTouchStart={screen === 'playing' ? (e) => { e.preventDefault(); jump(); } : undefined}
        >
          {/* Scaled inner stage — always logical size */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0,
            width: LOGICAL_W,
            height: LOGICAL_H,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            backgroundColor: flashBg ?? '#161e2e',
          }}>
            {/* Grid overlay */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.055,
              backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }}/>

            {/* Question banner */}
            {screen === 'playing' && s && (
              <div style={{ position: 'absolute', top: 32, left: 0, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 30, pointerEvents: 'none' }}>
                <div style={{ background: 'white', padding: '16px 40px', borderRadius: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', borderBottom: '5px solid #e5e7eb' }}>
                  <p style={{ color: '#3b82f6', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, marginBottom: 2, textAlign: 'center' }}>
                    {s.powerup === 'double' ? '⭐ DOUBLE POINTS ACTIVE' : 'Task:'}
                  </p>
                  <h2 style={{ fontSize: 30, fontWeight: 900, color: '#111827', letterSpacing: '-0.03em', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>{s.lesson.q}</h2>
                </div>
              </div>
            )}

            {/* Pipes */}
            {screen === 'playing' && s?.pipes.map(p => (
              <React.Fragment key={p.id}>
                <div style={{ position: 'absolute', left: p.x, top: 0, width: 50, height: p.gapY, background: '#450a0a', borderLeft: '4px solid rgba(185,28,28,0.5)', borderRight: '4px solid rgba(185,28,28,0.5)' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: -4, right: -4, height: 32, background: '#991b1b', border: '4px solid rgba(220,38,38,0.5)', borderRadius: '0 0 12px 12px' }}/>
                </div>
                <div style={{ position: 'absolute', left: p.x, top: p.gapY + p.gapSize, width: 50, height: LOGICAL_H - (p.gapY + p.gapSize), background: '#450a0a', borderLeft: '4px solid rgba(185,28,28,0.5)', borderRight: '4px solid rgba(185,28,28,0.5)' }}>
                  <div style={{ position: 'absolute', top: 0, left: -4, right: -4, height: 32, background: '#991b1b', border: '4px solid rgba(220,38,38,0.5)', borderRadius: '12px 12px 0 0' }}/>
                </div>
              </React.Fragment>
            ))}

            {/* Bubbles */}
            {screen === 'playing' && s?.bubbles.map(b => {
              const expiring = b.ttl < 99999 && b.age > b.ttl * 0.55;
              return (
                <div key={b.id} style={{
                  position: 'absolute', left: b.x, top: b.y,
                  width: BUBBLE_SIZE, height: BUBBLE_SIZE,
                  borderRadius: '50%',
                  border: `4px solid ${b.isPowerup ? 'rgba(167,139,250,0.8)' : 'rgba(100,116,139,0.8)'}`,
                  background: b.isPowerup ? '#7c3aed' : '#334155',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  animation: b.isPowerup ? 'pwrBob 1.1s ease-in-out infinite' : expiring ? 'blink 0.35s ease-in-out infinite' : undefined,
                  opacity: expiring ? 0.7 : 1,
                }}>
                  <span style={{ fontWeight: 900, fontSize: 14, padding: '0 8px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{b.text}</span>
                </div>
              );
            })}

            {/* Score popups */}
            {screen === 'playing' && s?.popups.map(p => (
              <div key={p.id} style={{
                position: 'absolute', left: p.x, top: p.y,
                pointerEvents: 'none', zIndex: 50,
                fontWeight: 900, fontSize: 18, color: '#fcd34d',
                animation: 'fadeUp 0.85s ease-out forwards',
                whiteSpace: 'nowrap',
                textShadow: '0 2px 8px rgba(0,0,0,0.7)',
              }}>
                {p.text}
              </div>
            ))}

            {/* Bird */}
            {screen === 'playing' && s && (
              <div style={{
                position: 'absolute', left: BIRD_X, top: s.birdY,
                width: BIRD_SIZE, height: BIRD_SIZE,
                transform: `rotate(${Math.max(-28, Math.min(28, s.birdVel * 2.8))}deg)`,
                opacity: s.invincible > 0 && Math.floor(s.invincible / 6) % 2 === 0 ? 0.28 : 1,
                zIndex: 40,
              }}>
                <img src={doom} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: `drop-shadow(${birdGlow})` }} alt="character"/>
                {s.powerup === 'shield' && (
                  <div style={{
                    position: 'absolute', inset: -10, borderRadius: '50%',
                    border: '3px solid #818cf8',
                    animation: 'shield 0.75s ease-in-out infinite',
                  }}/>
                )}
              </div>
            )}

            {/* Menu overlay */}
            {screen === 'menu' && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(15,23,42,0.93)',
                backdropFilter: 'blur(20px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 50,
              }}>
                <div style={{
                  textAlign: 'center', background: 'white', padding: '40px 40px',
                  borderRadius: 48, color: '#111827', maxWidth: 360, width: '90%',
                  border: '8px solid rgba(37,99,235,0.15)',
                }}>
                  <Sparkles style={{ color: '#2563eb', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} size={52}/>
                  <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 4px', fontStyle: 'italic', textTransform: 'uppercase' }}>Lexical Runner</h1>
                  <p style={{ color: '#6b7280', fontSize: 14, fontWeight: 600, margin: '0 0 20px' }}>Fly into correct answers. Dodge the wrong ones.</p>
                  <div style={{ textAlign: 'left', background: '#eff6ff', borderRadius: 16, padding: 16, marginBottom: 24, fontSize: 13, lineHeight: 1.6, fontWeight: 500, color: '#374151' }}>
                    <p style={{ margin: '0 0 6px' }}>⚡ Speed ramps up every 60 pts</p>
                    <p style={{ margin: '0 0 6px' }}>💜 Purple bubbles = power-ups (shield / slow / ×2)</p>
                    <p style={{ margin: '0 0 6px' }}>🔴 Red pipe obstacles appear from Wave 1</p>
                    <p style={{ margin: '0 0 6px' }}>❤️ 3 lives — chain correct answers for a score multiplier</p>
                    <p style={{ margin: 0 }}>⏳ Correct bubbles expire from Wave 2 onward</p>
                  </div>
                  <button
                    onClick={startGame}
                    style={{
                      width: '100%', background: '#2563eb', color: 'white',
                      fontWeight: 900, padding: '20px 0', borderRadius: 24,
                      fontSize: 18, border: 'none', cursor: 'pointer',
                      boxShadow: '0 7px 0 #1e40af', textTransform: 'uppercase', letterSpacing: '0.02em',
                    }}
                  >
                    Start Game
                  </button>
                  <p style={{ marginTop: 16, color: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>SPACE / CLICK / TAP to jump</p>
                </div>
              </div>
            )}

            {/* Dead overlay */}
            {screen === 'dead' && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(185,28,28,0.93)',
                backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                zIndex: 50,
              }}>
                <AlertCircle size={72} style={{ marginBottom: 16, animation: 'pwrBob 0.8s ease-in-out infinite' }}/>
                <h2 style={{ fontSize: 64, fontWeight: 900, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '-0.04em', fontStyle: 'italic' }}>FAILED</h2>
                <p style={{ color: '#fecaca', fontWeight: 700, fontSize: 20, margin: '0 0 4px' }}>Score: <span style={{ color: 'white', fontWeight: 900 }}>{s?.score ?? 0}</span></p>
                {(s?.score ?? 0) > 0 && (s?.score ?? 0) >= best && (
                  <p style={{ color: '#fcd34d', fontWeight: 900, fontSize: 18, margin: '0 0 8px' }}>🏆 NEW BEST!</p>
                )}
                <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
                  <button
                    onClick={startGame}
                    style={{
                      background: 'white', color: '#dc2626', fontWeight: 900,
                      padding: '20px 40px', borderRadius: 28, fontSize: 18,
                      border: 'none', cursor: 'pointer',
                      boxShadow: '0 7px 0 #cbd5e1', textTransform: 'uppercase',
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    style={{
                      background: 'rgba(0,0,0,0.2)', color: 'white',
                      border: '2px solid rgba(255,255,255,0.2)', fontWeight: 900,
                      padding: '20px 32px', borderRadius: 28, fontSize: 18,
                      cursor: 'pointer', textTransform: 'uppercase',
                    }}
                  >
                    Quit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {screen === 'playing' && (
          <p style={{ marginTop: 6, color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>
            SPACE / CLICK / TAP to jump
          </p>
        )}
      </div>
    </>
  );
}