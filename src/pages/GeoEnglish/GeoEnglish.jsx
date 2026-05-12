import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from 'lucide-react';

// ── EXPANDED LEXICON ────────────────────────────────────────────────────────
const DATABASE = {
  NOVICE: [
    { w: "GHOST", h: "The soul of a dead person; a faint trace." },
    { w: "SHARP", h: "Having an edge or point that is able to cut." },
    { w: "BRIGHT", h: "Reflecting much light; shining." }
  ],
  EXPERT: [
    { w: "PRAGMATIC", h: "Dealing with things sensibly and realistically." },
    { w: "OBSOLETE", h: "No longer produced or used; out of date." },
    { w: "RESILIENT", h: "Able to withstand or recover quickly from difficulty." }
  ],
  ELITE: [
    { w: "EPHEMERAL", h: "Lasting for a very short time." },
    { w: "EQUANIMITY", h: "Mental calmness, even in a difficult situation." },
    { w: "METICULOUS", h: "Showing great attention to detail; very careful." }
  ]
};

const MODES = {
  NOVICE: { hp: 5, drift: 0.04, color: "#00ff88" },
  EXPERT: { hp: 3, drift: 0.08, color: "#00d4ff" },
  ELITE: { hp: 1, drift: 0.15, color: "#ff0055" }
};

export default function GlyphStriker() {
  const [diff, setDiff] = useState(null);
  const [level, setLevel] = useState(0);
  const [hp, setHp] = useState(0);
  const [input, setInput] = useState("");
  const [glyphs, setGlyphs] = useState([]);
  const [status, setStatus] = useState("LOBBY"); 
  const [isDamaged, setIsDamaged] = useState(false);

  const navigate = (path) => {
    window.location.href = path;
  };

  const init = useCallback((mode, lvl = 0) => {
    const config = MODES[mode];
    const target = DATABASE[mode][lvl];
    const letters = target.w.split("");
    const decoys = "XYZKJPQRV".split("").sort(() => 0.5 - Math.random()).slice(0, 5);
    
    const all = [...letters, ...decoys].map((char, i) => ({
      id: i,
      char,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      vx: (Math.random() - 0.5) * config.drift,
      vy: (Math.random() - 0.5) * config.drift
    }));

    setGlyphs(all);
    setDiff(mode);
    setLevel(lvl);
    setHp(config.hp);
    setInput("");
    setStatus("PLAYING");
  }, []);

  useEffect(() => {
    if (status !== "PLAYING") return;
    const loop = setInterval(() => {
      setGlyphs(prev => prev.map(g => {
        let nx = g.x + g.vx;
        let ny = g.y + g.vy;
        if (nx < 5 || nx > 90) g.vx *= -1;
        if (ny < 15 || ny > 75) g.vy *= -1;
        return { ...g, x: nx, y: ny };
      }));
    }, 30);
    return () => clearInterval(loop);
  }, [status]);

  const onStrike = (glyph) => {
    if (status !== "PLAYING") return;
    const targetWord = DATABASE[diff][level].w;
    const nextChar = targetWord[input.length];

    if (glyph.char === nextChar) {
      const nextInput = input + glyph.char;
      setInput(nextInput);
      setGlyphs(prev => prev.filter(g => g.id !== glyph.id));
      if (nextInput === targetWord) {
        if (level < DATABASE[diff].length - 1) setStatus("LEVEL_UP");
        else setStatus("VICTORY");
      }
    } else {
      setHp(prev => prev - 1);
      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 200);
      if (hp <= 1) setStatus("GAMEOVER");
    }
  };

  return (
    <div style={{
      ...s.root,
      backgroundColor: isDamaged ? "#400" : "#050508",
    }}>
      
      <div style={s.navArea}>
        <button 
          onClick={() => navigate('/')}
          style={s.exitBtn}
          className="exit-btn-hover"
        >
          <ArrowLeft size={15}/> Exitt
        </button>
      </div>

      {status === "LOBBY" && (
        <div style={s.modal}>
          <h1 style={s.title}>GLYPH <span style={{color: '#ff0055'}}>STRIKER</span></h1>
          <p style={s.sub}>Select your difficulty rating:</p>
          <div style={s.grid}>
            {Object.keys(MODES).map(m => (
              <button key={m} style={{...s.btn, borderColor: MODES[m].color, color: MODES[m].color}} onClick={() => init(m)}>
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {status !== "LOBBY" && (
        <div style={s.gameView}>
          <div style={s.hud}>
            <div style={s.hpBar}>
              <div style={{...s.hpFill, width: `${(hp/MODES[diff].hp)*100}%`, background: MODES[diff].color}} />
            </div>
            <div style={s.hint}>{DATABASE[diff][level].h}</div>
          </div>

          <div style={s.wordSlots}>
            {DATABASE[diff][level].w.split("").map((c, i) => (
              <div key={i} style={{...s.slot, borderColor: input[i] ? MODES[diff].color : "#222", color: input[i] ? "#fff" : "transparent"}}>
                {input[i] || c}
              </div>
            ))}
          </div>

          {glyphs.map(g => (
            <div key={g.id} onClick={() => onStrike(g)} style={{...s.glyph, left: `${g.x}%`, top: `${g.y}%`, borderColor: MODES[diff].color}}>
              {g.char}
            </div>
          ))}

          {status === "LEVEL_UP" && (
            <div style={s.overlay}>
              <h2 style={{color: MODES[diff].color}}>SECTOR CLEARED</h2>
              <button style={s.btn} onClick={() => init(diff, level + 1)}>NEXT LEVEL</button>
            </div>
          )}
          {status === "GAMEOVER" && (
            <div style={s.overlay}>
              <h1 style={{color: '#ff0055'}}>TERMINATED</h1>
              <button style={s.btn} onClick={() => setStatus("LOBBY")}>RETRY</button>
            </div>
          )}
          {status === "VICTORY" && (
            <div style={s.overlay}>
              <h1 style={{color: '#00ff88'}}>SYSTEM MASTERED</h1>
              <button style={s.btn} onClick={() => setStatus("LOBBY")}>FINISH</button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .exit-btn-hover:hover {
          background-color: #ef4444 !important;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

const s = {
  root: { 
    height: "100vh", 
    position: "relative", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    color: "#fff", 
    fontFamily: "'Inter', sans-serif", 
    overflow: "hidden", 
    transition: "background-color 0.1s ease",
    userSelect: "none", // Fix: Prevents text selection on double click
    WebkitUserSelect: "none"
  },
  navArea: { position: "absolute", top: 25, left: 25, zIndex: 100 },
  exitBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: "0.625rem 1.25rem",
    borderRadius: "1rem",
    transition: "all 0.2s ease",
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: "0.75rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    cursor: "pointer",
  },
  modal: { textAlign: "center", padding: "50px", background: "#000", border: "1px solid #222", borderRadius: "40px" },
  title: { fontSize: "48px", fontWeight: "900", marginBottom: "10px" },
  sub: { color: "#555", marginBottom: "30px" },
  grid: { display: "flex", flexDirection: "column", gap: "15px" },
  btn: { padding: "15px 40px", background: "transparent", border: "2px solid", borderRadius: "50px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
  gameView: { width: "100vw", height: "100vh", position: "relative" },
  hud: { position: "absolute", top: 80, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" },
  hpBar: { width: "300px", height: "8px", background: "#111", borderRadius: "4px", overflow: "hidden", marginBottom: "20px" },
  hpFill: { height: "100%", transition: "0.3s width ease" },
  hint: { maxWidth: "600px", textAlign: "center", fontSize: "18px", color: "#888", padding: "0 20px" },
  wordSlots: { 
    position: "absolute", 
    bottom: 60, 
    width: "100%", 
    display: "flex", 
    justifyContent: "center", 
    gap: "15px",
    pointerEvents: "none" // Fix: Glyphs can be clicked even if they are behind slots
  },
  slot: { 
    width: "45px", 
    height: "60px", 
    borderBottom: "4px solid", 
    fontSize: "32px", 
    fontWeight: "900", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    userSelect: "none" 
  },
  glyph: { 
    position: "absolute", 
    width: "70px", 
    height: "70px", 
    background: "rgba(0,0,0,0.8)", 
    border: "1px solid", 
    borderRadius: "50%", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontSize: "28px", 
    fontWeight: "bold", 
    cursor: "pointer",
    userSelect: "none"
  },
  overlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }
};