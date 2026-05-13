import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid3x3,
  Type,
  Skull,
  Zap,
  Search,
  Snail,
  Sun,
  Moon,
  ALargeSmall,
  UserCircle,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const isDark = theme === "dark";

  const games = [
    {
      id: "flappy",
      title: "Lexical Runner",
      description: "Dodge pipes and master English grammar",
      icon: Zap,
      color: "#3b82f6",
      category: "action",
      available: true,
    },
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
      available: true,
    },
    {
      id: "snake",
      title: "Word Snake",
      description: "Slither and collect letters",
      icon: Snail,
      color: "#10b9b1",
      category: "action",
      available: true,
    },
    {
      id: "glyph",
      title: "Glyph Strike",
      description: "Type and collect letters",
      icon: ALargeSmall,
      color: "#ef4444",
      category: "word",
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
    <div style={{ minHeight: "100vh", backgroundColor: isDark ? "#0f1117" : "#f8f9fa" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <header className="mb-8 flex flex-col items-center text-center relative">
          {/* Top-right controls: theme toggle + profile */}
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: isDark ? "#1a1d27" : "#ffffff",
                borderColor: isDark ? "#2d3148" : "#e5e7eb",
                color: isDark ? "#94a3b8" : "#6b7280",
              }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="p-2 rounded-lg border transition-colors hover:opacity-80"
              style={{
                backgroundColor: isDark ? "#1a1d27" : "#ffffff",
                borderColor: isDark ? "#2d3148" : "#e5e7eb",
                color: isDark ? "#94a3b8" : "#6b7280",
              }}
              aria-label="Go to profile"
            >
              <UserCircle className="w-5 h-5" />
            </button>
          </div>

          <img
            src="/logo.png"
            alt="Mini Games Logo"
            className="w-82 h-auto object-contain mb-3 drop-shadow-lg"
          />
          <p style={{ color: isDark ? "#94a3b8" : "#4b5563" }}>
            Play free games online
          </p>
        </header>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: isDark ? "#64748b" : "#9ca3af" }}
            />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{
                backgroundColor: isDark ? "#1a1d27" : "#ffffff",
                border: `1px solid ${isDark ? "#2d3148" : "#e5e7eb"}`,
                color: isDark ? "#f1f5f9" : "#111827",
              }}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors"
                style={
                  selectedCategory === category.id
                    ? { backgroundColor: "#dc2626", color: "#ffffff", border: "1px solid #dc2626" }
                    : {
                        backgroundColor: isDark ? "#1a1d27" : "#ffffff",
                        color: isDark ? "#cbd5e1" : "#374151",
                        border: `1px solid ${isDark ? "#2d3148" : "#e5e7eb"}`,
                      }
                }
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGames.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => game.available && navigate(`/${game.id}`)}
                disabled={!game.available}
                className={`group relative rounded-xl overflow-hidden transition-all ${
                  game.available
                    ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
                style={{
                  backgroundColor: isDark ? "#1a1d27" : "#ffffff",
                  border: `1px solid ${isDark ? "#2d3148" : "transparent"}`,
                }}
              >
                <div
                  className="aspect-square flex items-center justify-center"
                  style={{ backgroundColor: game.color + (isDark ? "25" : "15") }}
                >
                  <Icon
                    className="w-16 h-16 transition-transform group-hover:scale-110"
                    style={{ color: game.color }}
                  />
                </div>

                <div className="p-3">
                  <h3
                    className="font-semibold mb-1 truncate text-left"
                    style={{ color: isDark ? "#f1f5f9" : "#111827" }}
                  >
                    {game.title}
                  </h3>
                  <p
                    className="text-sm truncate text-left"
                    style={{ color: isDark ? "#94a3b8" : "#4b5563" }}
                  >
                    {game.description}
                  </p>
                </div>

                {!game.available && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.05)" }}
                  >
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium shadow"
                      style={{
                        backgroundColor: isDark ? "#1a1d27" : "#ffffff",
                        color: isDark ? "#94a3b8" : "#374151",
                      }}
                    >
                      Coming Soon
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: isDark ? "#94a3b8" : "#6b7280" }}>
              No games found
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              className="mt-4 text-red-600 hover:underline"
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