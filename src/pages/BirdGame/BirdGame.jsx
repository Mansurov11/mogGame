import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import doom from "../../../public/doom.png";

const W = 1020;
const H = 700;
const BIRD_X = 150;
const BIRD_SIZE = 80;
const BUBBLE_SIZE = 90;
const SPAWN_RATE = 1500;

const LESSONS = [
  { q: "Which is a VERB?", correct: "RUN", decoys: ["APPLE", "BLUE", "HAPPY"] },
  { q: "Plural of 'BOX'?", correct: "BOXES", decoys: ["BOXS", "BOXIES", "BOX"] },
  { q: "Past of 'SEE'?", correct: "SAW", decoys: ["SEEN", "SEED", "SAWED"] },
  { q: "Opposite of 'DIFFICULT'?", correct: "EASY", decoys: ["HARD", "FAST", "SLOW"] },
  { q: "Which is an ADJECTIVE?", correct: "COLD", decoys: ["JUMP", "STREET", "SING"] }
];

export default function EnglishRunner() {
  const navigate = useNavigate();
  
  const [gameStatus, setGameStatus] = useState('selection'); 
  const [birdY, setBirdY] = useState(H / 2);
  const [birdVel, setBirdVel] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [activeLesson, setActiveLesson] = useState(LESSONS[0]);

  const requestRef = useRef();
  const lastSpawn = useRef(0);
  // Use a ref for status to prevent stale closures in the event listener
  const statusRef = useRef(gameStatus);

  useEffect(() => {
    statusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    const saved = localStorage.getItem('english_mog_best');
    if (saved) setBest(parseInt(saved, 10));
  }, []);

  // --- CONTROL LOGIC ---
  const jump = useCallback(() => {
    if (statusRef.current === 'playing') {
      setBirdVel(-10);
    } else if (statusRef.current === 'idle') {
      setGameStatus('playing');
      setBirdVel(-10);
    }
  }, []);

  // Listen for Spacebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault(); // Stop page from scrolling
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const resetGame = () => {
    setBirdY(H / 2);
    setBirdVel(0);
    setBubbles([]);
    setScore(0);
    setActiveLesson(LESSONS[Math.floor(Math.random() * LESSONS.length)]);
    setGameStatus('selection');
  };

  const handleBack = (e) => {
    if (e) e.stopPropagation();
    navigate('/');
  };

  const update = useCallback((time) => {
    if (gameStatus === 'playing') {
      setBirdY(y => {
        const next = y + birdVel;
        if (next > H - 80 || next < 0) {
          setGameStatus('dead');
          return y;
        }
        return next;
      });
      setBirdVel(v => v + 0.5);

      if (time - lastSpawn.current > SPAWN_RATE) {
        const isCorrect = Math.random() > 0.6; 
        const text = isCorrect 
          ? activeLesson.correct 
          : activeLesson.decoys[Math.floor(Math.random() * activeLesson.decoys.length)];

        setBubbles(prev => [...prev, {
          id: Math.random(),
          x: W,
          y: Math.random() * (H - 250) + 150,
          text,
          isCorrect
        }]);
        lastSpawn.current = time;
      }

      setBubbles(prev => {
        const nextBubbles = prev.map(b => ({ ...b, x: b.x - 6 })).filter(b => b.x > -150);
        let collisionDetected = false;
        
        const remainingBubbles = nextBubbles.filter(b => {
          const dx = (BIRD_X + BIRD_SIZE/2) - (b.x + BUBBLE_SIZE/2);
          const dy = (birdY + BIRD_SIZE/2) - (b.y + BUBBLE_SIZE/2);
          const distance = Math.sqrt(dx*dx + dy*dy);

          if (distance < (BIRD_SIZE/2 + BUBBLE_SIZE/2) - 15) {
            if (b.isCorrect) {
              setScore(s => {
                const newScore = s + 10;
                if (newScore > best) {
                  setBest(newScore);
                  localStorage.setItem('english_mog_best', newScore.toString());
                }
                return newScore;
              });
              setActiveLesson(LESSONS[Math.floor(Math.random() * LESSONS.length)]);
              return false;
            } else {
              collisionDetected = true;
              return true;
            }
          }
          return true;
        });

        if (collisionDetected) setGameStatus('dead');
        return remainingBubbles;
      });
    }
    requestRef.current = requestAnimationFrame(update);
  }, [gameStatus, birdVel, birdY, activeLesson, best]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center p-8 text-white select-none">
      
      {/* Header */}
      <div className="w-full max-w-[1020px] flex justify-between items-center mb-6 z-50">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-2xl hover:bg-red-500 transition-all font-black uppercase text-xs border border-white/10"
        >
          <ArrowLeft size={18} /> Exit Game
        </button>
        
        <div className="flex gap-4">
          <div className="bg-slate-800 px-6 py-2 rounded-2xl border border-white/5 text-center">
             <p className="text-[10px] font-black text-blue-400 uppercase leading-none mb-1 tracking-widest">SCORE</p>
             <p className="text-2xl font-black">{score}</p>
          </div>
          <div className="bg-slate-800 px-6 py-2 rounded-2xl border border-white/5 text-center">
             <p className="text-[10px] font-black text-amber-400 uppercase leading-none mb-1 tracking-widest">BEST</p>
             <p className="text-2xl font-black">{best}</p>
          </div>
        </div>
      </div>

      {/* Main Game Container - Works with Mouse Click */}
      <div 
        onMouseDown={jump}
        className="relative rounded-[3rem] border-[12px] border-white/5 bg-[#161e2e] shadow-2xl overflow-hidden cursor-pointer" 
        style={{ width: W, height: H }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Lesson Question */}
        {gameStatus === 'playing' && (
          <div className="absolute top-12 left-0 w-full flex justify-center z-50 pointer-events-none">
            <div className="bg-white px-12 py-6 rounded-[2rem] shadow-2xl border-b-[6px] border-gray-300">
              <p className="text-blue-500 text-[10px] font-black uppercase mb-1 text-center tracking-widest">Task:</p>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{activeLesson.q}</h2>
            </div>
          </div>
        )}

        {/* Bubbles */}
        {bubbles.map(b => (
          <div 
            key={b.id}
            className={`absolute flex items-center justify-center rounded-full border-4 shadow-2xl ${
              b.isCorrect ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-slate-600'
            }`}
            style={{ left: b.x, top: b.y, width: BUBBLE_SIZE, height: BUBBLE_SIZE }}
          >
            <span className="font-black text-xs px-2 text-center uppercase tracking-tighter">{b.text}</span>
          </div>
        ))}

        {/* Doom */}
        {gameStatus !== 'selection' && (
          <div 
            className="absolute z-40 transition-transform" 
            style={{ 
              left: BIRD_X, 
              top: birdY, 
              width: BIRD_SIZE, 
              height: BIRD_SIZE,
              transform: `rotate(${birdVel * 2}deg)` 
            }}
          >
             <img src={doom} className="w-full h-full drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] object-contain" alt="doom" />
          </div>
        )}

        {/* Selection Overlay */}
        {gameStatus === 'selection' && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-50">
            <div className="text-center bg-white p-12 rounded-[4rem] text-gray-900 w-full max-w-sm border-[10px] border-blue-600/20">
              <Sparkles className="mx-auto text-blue-600 mb-4" size={64} />
              <h1 className="text-4xl font-black tracking-tighter mb-2 italic">LEXICAL RUNNER</h1>
              <p className="text-gray-500 font-bold mb-10 leading-tight">Use <span className="text-blue-600">SPACE</span> or <span className="text-blue-600">CLICK</span> to fly.</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setGameStatus('idle'); }} 
                className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl text-2xl shadow-[0_8px_0_#1e40af] hover:translate-y-1 active:translate-y-2 transition-all uppercase"
              >
                Start Lesson
              </button>
            </div>
          </div>
        )}

        {/* Dead Overlay */}
        {gameStatus === 'dead' && (
          <div className="absolute inset-0 bg-red-600/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
            <AlertCircle size={100} className="mb-6 animate-bounce text-white" />
            <h2 className="text-8xl font-black mb-4 uppercase tracking-tighter italic">FAILED</h2>
            <div className="flex gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); resetGame(); }} 
                  className="bg-white text-red-600 font-black px-12 py-6 rounded-[2rem] text-2xl shadow-[0_8px_0_#cbd5e1] hover:translate-y-1 active:translate-y-2 transition-all uppercase"
                >
                  Try Again
                </button>
                <button 
                  onClick={handleBack} 
                  className="bg-black/20 text-white border-2 border-white/20 font-black px-10 py-6 rounded-[2rem] text-2xl hover:bg-black/40 transition-all uppercase"
                >
                  Quit
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

