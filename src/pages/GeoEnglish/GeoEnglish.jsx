import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const GeoDash = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  // Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [progress, setProgress] = useState(0);

  // Use a ref for the game engine to prevent re-render errors
  const engine = useRef({
    player: { y: 310, vy: 0, rotation: 0, isJumping: false },
    obstacles: [],
    frame: 0,
    speed: 7,
    active: false
  });

  const startGame = () => {
    engine.current = {
      player: { y: 310, vy: 0, rotation: 0, isJumping: false },
      obstacles: [],
      frame: 0,
      speed: 7,
      active: true
    };
    setGameOver(false);
    setIsPlaying(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const handleJump = (e) => {
      if (e.code === 'Space' || e.type === 'mousedown') {
        if (e.code === 'Space') e.preventDefault();
        const p = engine.current.player;
        if (!p.isJumping) {
          p.vy = -12;
          p.isJumping = true;
        }
      }
    };

    window.addEventListener('keydown', handleJump);
    window.addEventListener('mousedown', handleJump);

    const update = () => {
      const g = engine.current;
      if (!g.active) return;

      const p = g.player;
      // Physics
      p.vy += 0.8; // Gravity
      p.y += p.vy;

      // Ground Collision
      if (p.y > 310) {
        p.y = 310;
        p.vy = 0;
        p.isJumping = false;
        p.rotation = Math.round(p.rotation / 90) * 90;
      } else {
        p.rotation += 5;
      }

      // Progress calculation
      g.frame++;
      setProgress(prev => Math.min(100, Math.floor(g.frame / 20)));

      // Obstacle Spawning
      if (g.frame % 80 === 0) {
        g.obstacles.push({ x: 800, type: Math.random() > 0.4 ? 'spike' : 'block' });
      }

      // Move & Check Collision
      g.obstacles.forEach((obs, index) => {
        obs.x -= g.speed;
        
        // Simple but solid collision box
        const pRect = { x: 100, y: p.y, w: 40, h: 40 };
        const oRect = { x: obs.x, y: 310, w: 30, h: 40 };

        if (pRect.x < oRect.x + oRect.w &&
            pRect.x + pRect.w > oRect.x &&
            pRect.y + pRect.h > oRect.y) {
          g.active = false;
          setGameOver(true);
        }

        if (obs.x < -50) g.obstacles.splice(index, 1);
      });

      // DRAWING
      ctx.clearRect(0, 0, 800, 450);

      // Floor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 350, 800, 100);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.strokeRect(-10, 350, 820, 2);

      // Obstacles
      g.obstacles.forEach(obs => {
        ctx.fillStyle = obs.type === 'spike' ? '#ff4757' : '#6366f1';
        if (obs.type === 'spike') {
          ctx.beginPath();
          ctx.moveTo(obs.x, 350);
          ctx.lineTo(obs.x + 20, 310);
          ctx.lineTo(obs.x + 40, 350);
          ctx.fill();
        } else {
          ctx.fillRect(obs.x, 310, 40, 40);
        }
      });

      // Player
      ctx.save();
      ctx.translate(120, p.y + 20);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-20, -20, 40, 40);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(-20, -20, 40, 40);
      ctx.restore();

      animationId = requestAnimationFrame(update);
    };

    update();
    return () => {
      window.removeEventListener('keydown', handleJump);
      window.removeEventListener('mousedown', handleJump);
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] p-4">
      {/* HEADER / BACK BUTTON */}
      <div className="w-full max-w-200 flex justify-between items-center mb-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white font-bold transition-all"
        >
          <ArrowLeft size={20} /> Back to Menu
        </button>
        <div className="text-white/50 font-black tracking-tighter italic text-xl uppercase">
          Geometry Dash <span className="text-blue-500">Clone</span>
        </div>
      </div>

      <div className="relative shadow-2xl rounded-xl overflow-hidden border-4 border-slate-800 bg-slate-900">
        <canvas ref={canvasRef} width={800} height={450} className="block" />

        {/* PROGRESS BAR */}
        <div className="absolute top-0 left-0 w-full h-2 bg-white/10">
          <div 
            className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-300" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        {/* START SCREEN */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90">
            <button 
              onClick={startGame}
              className="group bg-green-500 hover:bg-green-400 p-8 rounded-full shadow-2xl transition-all transform hover:scale-110"
            >
              <div className="w-0 h-0 border-t-[20px] border-t-transparent border-l-[35px] border-l-white border-b-[20px] border-b-transparent ml-2" />
            </button>
            <h2 className="mt-6 text-white font-black text-3xl italic tracking-widest uppercase">Tap to Play</h2>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <h1 className="text-6xl font-black text-white italic mb-2 tracking-tighter">LEVEL FAILED</h1>
            <p className="text-blue-400 font-bold mb-8 text-xl">{progress}% COMPLETED</p>
            <button 
              onClick={startGame}
              className="flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xl hover:bg-yellow-400 transition-colors"
            >
              <RotateCcw size={24} /> Try Again
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">
        Press Space or Click to Jump
      </p>
    </div>
  );
};

export default GeoDash;