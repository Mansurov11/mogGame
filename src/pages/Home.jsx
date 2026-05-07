import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid3x3, Type, Skull, Bird, Search } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const games = [
    {
      id: "wordle",
      title: "Wordle",
      description: "Guess the word in 6 tries",
      icon: Grid3x3,
      color: "#10b981",
      category: "word",
      available: true,
    },
    {
      id: "guess",
      title: "Guess the Word",
      description: "Hangman word game",
      icon: Type,
      color: "#3b82f6",
      category: "word",
      available: true,
    },
    {
      id: "doom",
      title: "Doom",
      description: "Classic FPS shooter",
      icon: Skull,
      color: "#ef4444",
      category: "action",
      available: false,
    },
    {
      id: "flappy",
      title: "Flappy Bird",
      description: "Navigate through pipes",
      icon: Bird,
      color: "#f59e0b",
      category: "action",
      available: true,
    },
  ];

  const categories = [
    { id: "all", label: "All Games" },
    { id: "word", label: "Word Games" },
    { id: "action", label: "Action Games" },
  ];

  const filteredGames = games.filter((game) => {
    const matchesCategory =
      selectedCategory === "all" || game.category === selectedCategory;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col items-center text-center">
          <img src="/logo.png" alt="Mini Games Logo" className="w-82 h-auto object-contain mb-3 drop-shadow-lg" />
          <p className="text-gray-600">Play free games online</p>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGames.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => game.available && navigate(game.id)}
                disabled={!game.available}
                className={`group relative bg-white rounded-xl overflow-hidden transition-all ${
                  game.available
                    ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div
                  className="aspect-square flex items-center justify-center"
                  style={{ backgroundColor: game.color + "15" }}
                >
                  <Icon
                    className="w-16 h-16 transition-transform group-hover:scale-110"
                    style={{ color: game.color }}
                  />
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {game.title}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {game.description}
                  </p>
                </div>

                {!game.available && (
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow">
                      Coming Soon
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No games found</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;