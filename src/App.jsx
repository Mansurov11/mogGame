import  { useState } from 'react';
import './App.css';
import MiniGames from './pages/Games/Games';
import GuessTheWord from './pages/GuessingGame/GuessingGame';

function App() {
  // 'menu' or 'guessing-game'
  const [currentPage, setCurrentPage] = useState('menu');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Simple Navigation Bar */}
      <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div 
          className="text-2xl font-black text-indigo-600 cursor-pointer tracking-tighter"
          onClick={() => setCurrentPage('menu')}
        >
          GAMER<span className="text-slate-900">HUB</span>
        </div>
        <button 
          onClick={() => setCurrentPage('menu')}
          className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          Barcha o'yinlar
        </button>
      </nav>

      {/* Dynamic Page Rendering */}
      <main className="animate-in fade-in duration-500">
        {currentPage === 'menu' ? (
          <MiniGames onSelectGame={(id) => id === 2 ? setCurrentPage('guessing-game') : null} />
        ) : (
          <div className="relative">
            <button 
              onClick={() => setCurrentPage('menu')}
              className="absolute top-8 left-8 bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform z-10"
            >
              ←
            </button>
            <GuessTheWord />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;