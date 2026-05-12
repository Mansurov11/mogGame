import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import doom from "../../../public/doom.png";

const W = 1020, H = 700;
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

export default function EnglishRunner() {
  const navigate = useNavigate();

  // ── UI state (only for rendering)
  const [screen, setScreen] = useState('menu'); // menu | playing | dead
  const [snap, setSnap]     = useState(null);   // game snapshot for render
  const [best, setBest]     = useState(() => +(localStorage.getItem('eng_best') || 0));

  // ── All mutable game state lives here – never read via closure in RAF
  const G   = useRef(null);
  const raf = useRef(null);
  // Store tick in a ref so RAF always calls the same stable function
  const tickRef = useRef(null);

  // ── Init / reset
  function newGame() {
    G.current = {
      running:     true,
      birdY:       H / 2,
      birdVel:     0,
      bubbles:     [],
      pipes:       [],
      score:       0,
      lives:       3,
      combo:       0,
      multiplier:  1,
      powerup:     null,       // 'shield' | 'slow' | 'double' | null
      powerupTick: 0,
      lesson:      randLesson(),
      wave:        0,
      lastSpawn:   0,
      lastPipe:    0,
      flashTick:   0,          // >0 red, <0 green
      popups:      [],
      invincible:  0,
    };
  }

  // ── Jump: write directly to ref, no setState needed
  function jump() {
    if (G.current && G.current.running) {
      G.current.birdVel = JUMP_FORCE;
    }
  }

  // ── Keyboard
  useEffect(() => {
    function onKey(e) {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // empty deps – jump() only touches G.current ref, never stale

  // ── Hit handler (called from inside tick, receives g directly)
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
    } else {
      g.invincible = 80;
    }
  }

  // ── Define tick once, store in ref
  useEffect(() => {
    tickRef.current = function tick(ts) {
      raf.current = requestAnimationFrame(tickRef.current); // always stable ref

      const g = G.current;
      if (!g || !g.running) return;

      const wave      = Math.floor(g.score / 60);
      const speed     = BASE_SPEED + wave * 0.85 + (g.powerup === 'slow' ? -2.5 : 0);
      const spawnRate = Math.max(650, 1400 - wave * 110);
      const pipeCycle = Math.max(2600, 5000 - wave * 380);
      g.wave = wave;

      // Physics
      g.birdVel += GRAVITY;
      g.birdY   += g.birdVel;
      if (g.birdY < 0 || g.birdY > H - BIRD_SIZE) {
        g.birdY = Math.max(0, Math.min(H - BIRD_SIZE, g.birdY));
        hit(g);
      }

      // Timers
      if (g.invincible > 0) g.invincible--;
      if (g.flashTick > 0)  g.flashTick--;
      if (g.flashTick < 0)  g.flashTick++;
      if (g.powerup && --g.powerupTick <= 0) g.powerup = null;

      // Spawn bubble
      if (ts - g.lastSpawn > spawnRate) {
        g.lastSpawn    = ts;
        const isPowerup = Math.random() > 0.83;
        const isCorrect = !isPowerup && Math.random() > 0.5;
        const text      = isPowerup ? '⚡'
          : isCorrect   ? g.lesson.correct
          : g.lesson.decoys[Math.floor(Math.random() * g.lesson.decoys.length)];
        const ptype     = isPowerup ? ['shield','slow','double'][Math.floor(Math.random()*3)] : null;
        const ttl       = isCorrect && wave >= 2 ? Math.max(100, 190 - wave * 11) : 99999;
        g.bubbles.push({ id: uid(), x: W, y: 80 + Math.random() * (H - 250), text, isCorrect, isPowerup, ptype, ttl, age: 0 });
      }

      // Spawn pipe (wave 1+)
      if (wave >= 1 && ts - g.lastPipe > pipeCycle) {
        g.lastPipe    = ts;
        const gapSize = Math.max(165, 265 - wave * 11);
        const gapY    = 80 + Math.random() * (H - gapSize - 150);
        g.pipes.push({ id: uid(), x: W, gapY, gapSize });
      }

      // Bubbles
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
            g.powerup = b.ptype; g.powerupTick = 300; g.flashTick = -8;
          } else if (b.isCorrect) {
            const pts = 10 * g.multiplier * (g.powerup === 'double' ? 2 : 1);
            g.score += pts; g.combo++;
            if (g.combo % 3 === 0) g.multiplier = Math.min(4, g.multiplier + 1);
            g.flashTick = -8;
            g.lesson = randLesson();
            g.popups.push({ id: uid(), text: `+${pts}${g.combo >= 3 ? ' 🔥' : ''}`, x: b.x, y: b.y, age: 0 });
            const nb = g.score;
            setBest(prev => { if (nb > prev) { localStorage.setItem('eng_best', nb); return nb; } return prev; });
          } else {
            if (g.powerup === 'shield') { g.powerup = null; g.powerupTick = 0; g.flashTick = -8; }
            else hit(g);
          }
          continue; // consumed
        }
        kept.push(b);
      }
      g.bubbles = kept;

      // Pipes
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

      // Popups
      g.popups = g.popups.map(p => ({ ...p, age: p.age + 1 })).filter(p => p.age < 48);

      // Push render snapshot (shallow copy arrays so React sees change)
      setSnap({
        birdY:       g.birdY,
        birdVel:     g.birdVel,
        bubbles:     g.bubbles.slice(),
        pipes:       g.pipes.slice(),
        score:       g.score,
        lives:       g.lives,
        combo:       g.combo,
        multiplier:  g.multiplier,
        powerup:     g.powerup,
        powerupTick: g.powerupTick,
        lesson:      g.lesson,
        wave:        g.wave,
        flashTick:   g.flashTick,
        popups:      g.popups.slice(),
        invincible:  g.invincible,
      });
    };
  }); // runs every render → tickRef.current is always fresh, but RAF calls tickRef.current not tick directly

  // ── Start / stop RAF when screen changes
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

  // ── Derived render values
  const s = snap;
  const flash = s?.flashTick ?? 0;
  const flashBg = flash > 0 ? `rgba(220,38,38,0.28)` : flash < 0 ? `rgba(34,197,94,0.22)` : undefined;
  const birdGlow = s?.powerup === 'shield' ? '0 0 26px 5px rgba(99,102,241,0.9)'
    : s?.powerup === 'double' ? '0 0 22px 4px rgba(251,191,36,0.9)'
    : '0 0 14px 2px rgba(59,130,246,0.5)';
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

      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center p-6 text-white select-none">

        {/* Header */}
        <div className="w-full max-w-[1020px] flex justify-between items-center mb-4">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-2xl hover:bg-red-500 transition-all font-black uppercase text-xs border border-white/10">
            <ArrowLeft size={15}/> Exit
          </button>

          <div className="flex gap-3 items-center flex-wrap justify-end">
            {/* Lives */}
            <div className="bg-slate-800 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-1">
              {[1,2,3].map(i => <HeartIcon key={i} filled={(s?.lives ?? 3) >= i}/>)}
            </div>
            {/* Wave */}
            {screen === 'playing' && s && (
              <div className="bg-slate-800 px-4 py-2 rounded-2xl border border-white/5 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1" style={{color:wc}}>WAVE</p>
                <p className="text-sm font-black" style={{color:wc}}>{wl}</p>
              </div>
            )}
            {/* Combo */}
            {(s?.combo ?? 0) >= 2 && (
              <div className="bg-amber-400/20 border border-amber-400/40 px-4 py-2 rounded-2xl text-center">
                <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest leading-none mb-1">COMBO</p>
                <p className="text-lg font-black text-amber-200">{s.combo}×</p>
              </div>
            )}
            {/* Multiplier */}
            {(s?.multiplier ?? 1) > 1 && (
              <div className="bg-rose-500/20 border border-rose-400/40 px-3 py-2 rounded-2xl text-center">
                <p className="text-[9px] font-black text-rose-300 uppercase tracking-widest leading-none mb-1">MULT</p>
                <p className="text-lg font-black text-rose-200">{s.multiplier}×</p>
              </div>
            )}
            {/* Powerup */}
            {s?.powerup && (
              <div className="bg-violet-500/20 border border-violet-400/40 px-4 py-2 rounded-2xl" style={{minWidth:82}}>
                <p className="text-[9px] font-black text-violet-300 uppercase tracking-widest leading-none mb-1">
                  {s.powerup === 'shield' ? '🛡 SHIELD' : s.powerup === 'slow' ? '⏱ SLOW' : '⭐ ×2 PTS'}
                </p>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-violet-400 h-1.5 rounded-full" style={{width:`${(s.powerupTick/300)*100}%`}}/>
                </div>
              </div>
            )}
            {/* Score */}
            <div className="bg-slate-800 px-5 py-2 rounded-2xl border border-white/5 text-center">
              <p className="text-[9px] font-black text-blue-400 uppercase leading-none mb-1 tracking-widest">SCORE</p>
              <p className="text-2xl font-black">{s?.score ?? 0}</p>
            </div>
            <div className="bg-slate-800 px-5 py-2 rounded-2xl border border-white/5 text-center">
              <p className="text-[9px] font-black text-amber-400 uppercase leading-none mb-1 tracking-widest">BEST</p>
              <p className="text-2xl font-black">{best}</p>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          onMouseDown={screen === 'playing' ? jump : undefined}
          className="relative rounded-[2.5rem] border-[10px] border-white/5 shadow-2xl overflow-hidden"
          style={{width:W, height:H, cursor: screen==='playing' ? 'pointer' : 'default',
            backgroundColor: flashBg ?? '#161e2e'}}
        >
          {/* grid */}
          <div className="absolute inset-0 opacity-[0.055]"
            style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>

          {/* Question */}
          {screen === 'playing' && s && (
            <div className="absolute top-8 left-0 w-full flex justify-center z-30 pointer-events-none">
              <div className="bg-white px-10 py-4 rounded-[1.8rem] shadow-2xl border-b-[5px] border-gray-200">
                <p className="text-blue-500 text-[8px] font-black uppercase mb-0.5 text-center tracking-widest">
                  {s.powerup === 'double' ? '⭐ DOUBLE POINTS ACTIVE' : 'Task:'}
                </p>
                <h2 className="text-[1.85rem] font-black text-gray-900 tracking-tighter uppercase leading-none">
                  {s.lesson.q}
                </h2>
              </div>
            </div>
          )}

          {/* Pipes */}
          {screen === 'playing' && s?.pipes.map(p => (
            <React.Fragment key={p.id}>
              <div className="absolute bg-red-950 border-x-4 border-red-700/50"
                style={{left:p.x, top:0, width:50, height:p.gapY}}>
                <div className="absolute bottom-0 left-[-5px] right-[-5px] h-8 bg-red-800 border-4 border-red-600/50 rounded-b-xl"/>
              </div>
              <div className="absolute bg-red-950 border-x-4 border-red-700/50"
                style={{left:p.x, top:p.gapY+p.gapSize, width:50, height:H-(p.gapY+p.gapSize)}}>
                <div className="absolute top-0 left-[-5px] right-[-5px] h-8 bg-red-800 border-4 border-red-600/50 rounded-t-xl"/>
              </div>
            </React.Fragment>
          ))}

          {/* Bubbles */}
          {screen === 'playing' && s?.bubbles.map(b => {
            const expiring = b.ttl < 99999 && b.age > b.ttl * 0.55;
            return (
              <div key={b.id}
                className={`absolute flex items-center justify-center rounded-full border-4 shadow-xl ${
                  b.isPowerup ? 'bg-violet-600 border-violet-300' :
                                'bg-slate-700 border-slate-500'
                }`}
                style={{left:b.x, top:b.y, width:BUBBLE_SIZE, height:BUBBLE_SIZE,
                  animation: b.isPowerup ? 'pwrBob 1.1s ease-in-out infinite'
                           : expiring    ? 'blink 0.35s ease-in-out infinite' : undefined,
                  opacity: expiring ? 0.7 : 1}}>
                <span className="font-black text-base px-2 text-center uppercase tracking-tight leading-tight">
                  {b.text}
                </span>
              </div>
            );
          })}

          {/* Score popups */}
          {screen === 'playing' && s?.popups.map(p => (
            <div key={p.id} className="absolute pointer-events-none z-50 font-black text-lg text-amber-300"
              style={{left:p.x, top:p.y, animation:'fadeUp 0.85s ease-out forwards', whiteSpace:'nowrap',
                textShadow:'0 2px 8px rgba(0,0,0,0.7)'}}>
              {p.text}
            </div>
          ))}

          {/* Bird */}
          {screen === 'playing' && s && (
            <div className="absolute z-40"
              style={{left:BIRD_X, top:s.birdY, width:BIRD_SIZE, height:BIRD_SIZE,
                transform:`rotate(${Math.max(-28,Math.min(28,s.birdVel*2.8))}deg)`,
                opacity: s.invincible > 0 && Math.floor(s.invincible/6)%2===0 ? 0.28 : 1}}>
              <img src={doom} className="w-full h-full object-contain" alt="doom"
                style={{filter:`drop-shadow(${birdGlow})`}}/>
              {s.powerup === 'shield' && (
                <div className="absolute inset-[-10px] rounded-full border-[3px] border-indigo-400"
                  style={{animation:'shield 0.75s ease-in-out infinite'}}/>
              )}
            </div>
          )}

          {/* ── MENU ── */}
          {screen === 'menu' && (
            <div className="absolute inset-0 bg-slate-900/93 backdrop-blur-xl flex items-center justify-center z-50">
              <div className="text-center bg-white p-10 rounded-[3.5rem] text-gray-900 w-full max-w-[360px] border-[8px] border-blue-600/15 shadow-2xl">
                <Sparkles className="mx-auto text-blue-600 mb-3" size={52}/>
                <h1 className="text-4xl font-black tracking-tighter mb-1 italic uppercase">Lexical Runner</h1>
                <p className="text-gray-500 text-sm font-semibold mb-5">Fly into correct answers. Dodge the wrong ones.</p>
                <div className="text-left bg-blue-50 rounded-2xl p-4 mb-6 text-[13px] space-y-1.5 font-medium text-gray-700">
                  <p>⚡ Speed ramps up every 60 pts</p>
                  <p>💜 Purple bubbles = power-ups (shield / slow / ×2)</p>
                  <p>🔴 Red pipe obstacles appear from Wave 1</p>
                  <p>❤️ 3 lives — chain correct answers for a score multiplier</p>
                  <p>⏳ Correct bubbles expire from Wave 2 onward</p>
                </div>
                <button onClick={startGame}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl text-xl shadow-[0_7px_0_#1e40af] hover:translate-y-[2px] active:translate-y-1 transition-all uppercase">
                  Start Game
                </button>
                <p className="mt-4 text-gray-400 text-xs font-bold uppercase tracking-widest">SPACE / CLICK to jump</p>
              </div>
            </div>
          )}

          {/* ── DEAD ── */}
          {screen === 'dead' && (
            <div className="absolute inset-0 bg-red-700/93 backdrop-blur-md flex flex-col items-center justify-center z-50">
              <AlertCircle size={72} className="mb-4 animate-bounce text-white"/>
              <h2 className="text-7xl font-black mb-2 uppercase tracking-tighter italic">FAILED</h2>
              <p className="text-red-200 font-bold text-xl mb-1">
                Score: <span className="text-white font-black">{s?.score ?? 0}</span>
              </p>
              {(s?.score ?? 0) > 0 && (s?.score ?? 0) >= best && (
                <p className="text-amber-300 font-black text-lg mb-2">🏆 NEW BEST!</p>
              )}
              <div className="flex gap-4 mt-5">
                <button onClick={startGame}
                  className="bg-white text-red-600 font-black px-10 py-5 rounded-[1.8rem] text-xl shadow-[0_7px_0_#cbd5e1] hover:translate-y-[2px] active:translate-y-1 transition-all uppercase">
                  Try Again
                </button>
                <button onClick={() => navigate('/')}
                  className="bg-black/20 text-white border-2 border-white/20 font-black px-8 py-5 rounded-[1.8rem] text-xl hover:bg-black/40 transition-all uppercase">
                  Quit
                </button>
              </div>
            </div>
          )}
        </div>

        {screen === 'playing' && (
          <p className="mt-3 text-slate-500 text-xs font-bold uppercase tracking-widest">SPACE / CLICK to jump</p>
        )}
      </div>
    </>
  );
}

