import { useState, useEffect } from "react";
import { User, Mail, Sun, Moon, ArrowLeft, Trophy, Zap, Grid3x3, Type, Skull, Snail, ALargeSmall } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
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

  const user = {
    userName: "ekberla",
    email: "admin@example.com",
    role: "admin",
  };

  const scores = [
    { id: "flappy", title: "Lexical Runner", icon: Zap,         color: "#3b82f6", score: 42,   unit: "pts" },
    { id: "wordle", title: "Wordle",          icon: Grid3x3,     color: "#10b981", score: 3,    unit: "tries" },
    { id: "guess",  title: "Guess the Word",  icon: Type,        color: "#3b82f6", score: 7,    unit: "wins" },
    { id: "doom",   title: "Doom",            icon: Skull,       color: "#ef4444", score: 1200, unit: "pts" },
    { id: "snake",  title: "Word Snake",      icon: Snail,       color: "#10b9b1", score: 18,   unit: "pts" },
    { id: "glyph",  title: "Glyph Strike",    icon: ALargeSmall, color: "#ef4444", score: 95,   unit: "pts" },
  ];

  const bg      = isDark ? "#0f1117" : "#f8f9fa";
  const cardBg  = isDark ? "#1a1d27" : "#ffffff";
  const border  = isDark ? "#2d3148" : "#e5e7eb";
  const textPrimary   = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";

  return (
    <div style={{ backgroundColor: bg, minHeight: "100vh", position: "relative", zIndex: 0, pointerEvents: "none" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px", pointerEvents: "auto" }}>

        {/* Back link */}
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#64748b",
            textDecoration: "none",
            marginBottom: 24,
            fontSize: 15,
            fontWeight: 600,
            position: "relative",
            zIndex: 10,
          }}
        >
          <ArrowLeft size={18} />
          Back to Games
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
          <button
            onClick={toggleTheme}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: 8,
              borderRadius: 8,
              border: `1px solid ${border}`,
              backgroundColor: cardBg,
              color: textSecondary,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <h1 style={{ fontSize: 30, fontWeight: 900, color: textPrimary, margin: 0 }}>Profil</h1>
          <p style={{ color: textSecondary, marginTop: 4 }}>Shaxsiy ma'lumotlar va xavfsizlik</p>
        </div>

        {/* Hero Card */}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 24, display: "flex", alignItems: "center", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: "#dc262620", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, flexShrink: 0 }}>
            {user.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: textPrimary, margin: 0 }}>{user.userName}</h2>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#dc2626", marginTop: 4 }}>{user.role}</p>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>

          {/* Info */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: "#dc262615", color: "#dc2626", display: "flex" }}>
                <User size={20} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: textPrimary, margin: 0 }}>Ma'lumotlar</h3>
            </div>
            <InfoRow label="Username" value={user.userName} icon={<User size={16} />} textPrimary={textPrimary} textSecondary={textSecondary} border={border} />
            <InfoRow label="Email"    value={user.email}    icon={<Mail size={16} />} textPrimary={textPrimary} textSecondary={textSecondary} border={border} />
          </div>

          {/* Best Scores */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: "#dc262615", color: "#dc2626", display: "flex" }}>
                <Trophy size={20} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: textPrimary, margin: 0 }}>Best Scores</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {scores.map((game) => {
                const Icon = game.icon;
                return (
                  <div key={game.id} style={{ backgroundColor: isDark ? "#0f1117" : "#f8f9fa", border: `1px solid ${border}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: game.color + (isDark ? "25" : "15"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={16} style={{ color: game.color }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: textSecondary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{game.title}</p>
                      <p style={{ fontSize: 14, fontWeight: 900, color: textPrimary, margin: 0 }}>
                        {game.score} <span style={{ fontSize: 11, fontWeight: 500, color: textSecondary }}>{game.unit}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon, textPrimary, textSecondary, border }) => (
  <div style={{ borderBottom: `1px solid ${border}`, paddingBottom: 16, marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: textSecondary, marginBottom: 4 }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
    </div>
    <p style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: 0, paddingLeft: 24 }}>{value || "—"}</p>
  </div>
);

export default Profile;