import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Check, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import doom from "../../../public/doom.png"
const W = 1020;
const H = 700;
const BIRD_X = 90;
const BIRD_SIZE = 50;
const PIPE_W = 60;
const PIPE_GAP = 165;
const PIPE_SPEED = 3.5;
const PIPE_SPAWN_RATE = 1500;

// Character Definitions with Unique Physics
const CHARACTERS = [
  { 
    id: 'goldie', 
    name: 'Goldie', 
    color: 'from-[#ffe566] to-[#f5a623]', 
    gravity: 0.45, 
    jump: -8, 
    emoji: '🐦',
    description: 'Balanced & Classic' 
  },
  { 
    id: 'bluey', 
    name: 'Bluey', 
    color: 'from-[#70e1ff] to-[#3b82f6]', 
    gravity: 0.35, 
    jump: -7, 
    emoji: '💧',
    description: 'Light & Floatier' 
  },
  { 
    id: 'doom', 
    name: 'Doom', 
    color: 'from-[#1a1a1a] to-[#333333]', 
    gravity: 0.65, // Heavy physics
    jump: -10.5,  // Strong jump
    emoji: '💀',
    description: 'Heavy & Brutal' 
  }
];

export default function BirdGame() {
  const navigate = useNavigate();
  
  // Game States
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [gameStatus, setGameStatus] = useState('selection'); // selection, idle, playing, dead
  const [birdY, setBirdY] = useState(H / 2);
  const [birdVel, setBirdVel] = useState(0);
  const [birdRot, setBirdRot] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const requestRef = useRef();
  const lastPipeSpawn = useRef(0);

  // 1. LOAD HIGH SCORE FROM LOCAL STORAGE ON MOUNT
  useEffect(() => {
    const savedBest = localStorage.getItem('birdGame_highScore');
    if (savedBest) {
      setBest(parseInt(savedBest, 10));
    }
  }, []);

  // Flap Logic
  const flap = useCallback(() => {
    if (gameStatus === 'dead' || gameStatus === 'selection') return;
    if (gameStatus === 'idle') setGameStatus('playing');
    setBirdVel(selectedChar.jump);
  }, [gameStatus, selectedChar]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKey = (e) => (e.code === 'Space' || e.code === 'ArrowUp') && flap();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flap]);

  const restart = () => {
    setBirdY(H / 2);
    setBirdVel(0);
    setBirdRot(0);
    setPipes([]);
    setScore(0);
    setGameStatus('selection');
  };

  // Main Game Loop
  const update = useCallback((time) => {
    if (gameStatus === 'playing') {
      // Move Bird
      setBirdY((y) => {
        const nextY = y + birdVel;
        if (nextY > H - 65 || nextY < 0) {
          setGameStatus('dead');
          return y;
        }
        return nextY;
      });

      // Apply Gravity and Rotation
      setBirdVel((v) => v + selectedChar.gravity);
      setBirdRot(Math.min(90, Math.max(-25, birdVel * 5)));

      // Spawn Pipes
      if (time - lastPipeSpawn.current > PIPE_SPAWN_RATE) {
        const topPipeHeight = Math.random() * (H - PIPE_GAP - 150) + 50;
        setPipes((prev) => [...prev, { x: W, top: topPipeHeight, passed: false }]);
        lastPipeSpawn.current = time;
      }

      // Move Pipes
      setPipes((prev) =>
        prev.map((p) => ({ ...p, x: p.x - PIPE_SPEED })).filter((p) => p.x > -PIPE_W)
      );

      // Collision and Scoring
      pipes.forEach((p) => {
        // Hitbox detection
        if (
          BIRD_X + 10 < p.x + PIPE_W &&
          BIRD_X + BIRD_SIZE - 10 > p.x &&
          (birdY + 10 < p.top || birdY + BIRD_SIZE - 10 > p.top + PIPE_GAP)
        ) {
          setGameStatus('dead');
        }

        // 2. SAVE HIGH SCORE TO LOCAL STORAGE ON PASS
        if (!p.passed && p.x < BIRD_X) {
          p.passed = true;
          setScore((s) => {
            const newScore = s + 1;
            setBest((currentBest) => {
              if (newScore > currentBest) {
                localStorage.setItem('birdGame_highScore', newScore.toString());
                return newScore;
              }
              return currentBest;
            });
            return newScore;
          });
        }
      });
    } else if (gameStatus === 'idle') {
      // Floating animation for menu
      setBirdY(H / 2 + Math.sin(time / 300) * 12);
    }
    requestRef.current = requestAnimationFrame(update);
  }, [gameStatus, birdVel, birdY, pipes, selectedChar]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 select-none bg-[#f0f4f8]">
      {/* UI Top Bar */}
      <div className="w-full max-w-[955px] flex justify-between items-center mb-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-bold">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-1.5 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400">SCORE</p>
            <p className="text-lg text-gray-900 font-black leading-none">{score}</p>
          </div>
          <div className="bg-white px-4 py-1.5 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-amber-500">BEST</p>
            <p className="text-lg text-amber-500 font-black leading-none">{best}</p>
          </div>
        </div>
      </div>

      <div 
        onClick={flap}
        className="relative overflow-hidden rounded-[2.5rem] shadow-2xl border-[6px] border-white bg-gradient-to-b from-[#5ba3e0] to-[#a8d8f0] cursor-pointer"
        style={{ width: W, height: H }}
      >
        {/* Background Clouds */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-8 bg-white rounded-full blur-md" />
          <div className="absolute top-40 right-10 w-32 h-12 bg-white rounded-full blur-md" />
        </div>

        {/* Pipes */}
        {pipes.map((p, i) => (
          <React.Fragment key={i}>
            <div className="absolute bg-[#3db843] border-x-4 border-black/10" style={{ left: p.x, top: 0, width: PIPE_W, height: p.top }}>
              <div className="absolute bottom-0 -left-1.5 w-[72px] h-8 bg-[#3db843] border-4 border-black/10 rounded-md shadow-lg" />
            </div>
            <div className="absolute bg-[#3db843] border-x-4 border-black/10" style={{ left: p.x, top: p.top + PIPE_GAP, width: PIPE_W, height: H - (p.top + PIPE_GAP) }}>
              <div className="absolute top-0 -left-1.5 w-[72px] h-8 bg-[#3db843] border-4 border-black/10 rounded-md shadow-lg" />
            </div>
          </React.Fragment>
        ))}

        {/* Character Visuals */}
        {gameStatus !== 'selection' && (
          <div 
            className="absolute z-10"
            style={{ 
              left: BIRD_X, 
              top: birdY, 
              width: BIRD_SIZE, 
              height: BIRD_SIZE,
              transform: `rotate(${birdRot}deg)`
            }}
          >
            {selectedChar.id === 'doom' ? (
              /* DOOM HELMET RENDER */
              <div className="relative w-full h-full scale-110">
                <img src={doom} alt="" />
              </div>
            ) : (
              /* CLASSIC BIRD RENDER */
              <div className={`relative w-full h-full bg-gradient-to-br ${selectedChar.color} rounded-full border-[3px] border-gray-800 shadow-lg flex items-center justify-center`}>
                <div className="absolute top-1 right-2 w-4 h-4 bg-white rounded-full border-2 border-gray-800 overflow-hidden">
                    <div className="absolute top-1 right-0.5 w-2 h-2 bg-gray-900 rounded-full" />
                </div>
                <div className="absolute -right-2 top-[40%] w-4 h-3 bg-[#ff6b35] rounded-full border-2 border-gray-800" />
              </div>
            )}
          </div>
        )}

        {/* Floor */}
        <div className="absolute bottom-0 w-full h-12 bg-[#c8a96e] border-t-[6px] border-[#5c8a3c] z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]" />

        {/* SCREEN OVERLAYS */}
        
        {/* 1. Character Selection Screen */}
        {gameStatus === 'selection' && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-md flex items-center justify-center z-40 p-6">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 w-full max-w-[320px] border border-gray-100 animate-in zoom-in-90 duration-200">
              <h2 className="text-xl font-black text-gray-900 mb-6 text-center tracking-tight">WHO'S FLAPPING?</h2>
              <div className="flex flex-col gap-3 mb-6">
                {CHARACTERS.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedChar(char)}
                    className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all ${
                      selectedChar.id === char.id ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-gray-50 bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{char.id === 'doom' ? '💀' : char.emoji}</span>
                    <div className="text-left flex-1">
                      <p className="font-bold text-sm leading-tight">{char.name}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{char.description}</p>
                    </div>
                    {selectedChar.id === char.id && <Check className="text-amber-500" size={18} />}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setGameStatus('idle')}
                className="w-full bg-[#f5a623] hover:bg-[#e69512] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_#d48a0a] active:translate-y-1 active:shadow-none transition-all"
              >
                LET'S GO
              </button>
            </div>
          </div>
        )}

        {/* 2. Ready to Start Screen */}
        {gameStatus === 'idle' && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-30">
            <div className="bg-white/90 p-8 rounded-[2rem] shadow-2xl text-center border-2 border-white">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Ready, {selectedChar.name}?</p>
              <button className="bg-[#f5a623] text-white font-black px-10 py-4 rounded-2xl shadow-[0_6px_0_#d48a0a] animate-bounce">
                TAP TO START
              </button>
            </div>
          </div>
        )}

        {/* 3. Game Over Screen */}
        {gameStatus === 'dead' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="bg-white rounded-[2.5rem] p-8 text-center w-[280px] shadow-2xl border border-white">
              <h2 className="text-2xl font-black mb-6 text-gray-900 tracking-tighter uppercase">Crashed!</h2>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase">Your Score</p>
                <p className="text-4xl font-black text-gray-900">{score}</p>
              </div>
              <button onClick={restart} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-colors">
                <RotateCcw size={20} /> TRY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}