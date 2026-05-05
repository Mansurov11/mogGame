import  { useState } from "react";
import { Search, Grid, Type, Skull, Bird } from "lucide-react";

const MiniGames = ({ onSelectGame }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Games");

  const games = [
    { id: 1, title: "Wordle", description: "6 ta urinishda toping", category: "Word Games", icon: <Grid className="text-emerald-500" size={40} />, bgColor: "bg-emerald-50", comingSoon: true },
    { id: 2, title: "Guess the Word", description: "Hangman so'z o'yini", category: "Word Games", icon: <Type className="text-blue-500" size={40} />, bgColor: "bg-blue-50", comingSoon: false },
    { id: 3, title: "Doom", description: "Klassik FPS shooter", category: "Action Games", icon: <Skull className="text-rose-400" size={40} />, bgColor: "bg-rose-50", comingSoon: true },
    { id: 4, title: "Flappy Bird", description: "To'siqlardan o'ting", category: "Action Games", icon: <Bird className="text-amber-400" size={40} />, bgColor: "bg-amber-50", comingSoon: true },
  ];

  const filtered = games.filter(g => 
    (activeCategory === "All Games" || g.category === activeCategory) &&
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Mini O'yinlar</h1>
        <p className="text-slate-500 font-bold mt-2 text-lg">Bepul onlayn o'yinlar to'plami</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" placeholder="O'yinlarni qidirish..." 
            className="w-full pl-12 pr-4 py-4 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl shadow-slate-200/50"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All Games", "Word Games", "Action Games"].map(cat => (
            <button 
              key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-8 py-4 rounded-2xl font-black transition-all whitespace-nowrap ${activeCategory === cat ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-400"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map(game => (
          <div 
            key={game.id} 
            onClick={() => !game.comingSoon && onSelectGame(game.id)}
            className={`group bg-white rounded-[40px] border border-slate-50 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer p-2`}
          >
            <div className={`h-48 ${game.bgColor} rounded-[32px] flex items-center justify-center relative`}>
              {game.icon}
              {game.comingSoon && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-[32px]">
                  <span className="bg-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">Tez kunda</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{game.title}</h3>
              <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-tighter">{game.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniGames;