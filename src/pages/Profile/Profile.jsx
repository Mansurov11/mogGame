import { useState, useEffect } from "react";
import { User, Mail, Sun, Moon, ArrowLeft, Trophy, Zap, Grid3x3, Type, Skull, Snail, ALargeSmall, Loader2 } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";

const Profile = () => {
  
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  // Ma'lumotlar uchun state
  const [userData, setUserData] = useState(null);
  const [bestScores, setBestScores] = useState({
    flappy: 0, doom: 0, snake: 0, glyph: 0
  });
  // Sahifa yuklanish holati
  const [pageLoading, setPageLoading] = useState(true);
  
  const authToken = localStorage.getItem("authToken");
    if (!authToken) {
    return <Navigate to="/login" replace />;
  }
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Realtime Database-dan foydalanuvchi ma'lumotlarini olish
        // DIQQAT: Bazadagi papka nomi 'Users' ekanligini tekshiring
        const userRef = ref(db, 'Users/' + currentUser.uid);
        
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData({
              userName: data.username || "Foydalanuvchi",
              email: currentUser.email,
              role: data.role || "Player",
            });
            if (data.bestScores) {
              setBestScores(prev => ({ ...prev, ...data.bestScores }));
            }
          } else {
            // Agar bazada ma'lumot bo'lmasa, Auth'dan olingan emailni ko'rsatamiz
            setUserData({
              userName: "Noma'lum",
              email: currentUser.email,
              role: "Player",
            });
          }
          // Ma'lumot tekshirib bo'lingach yuklashni to'xtatamiz
          setPageLoading(false);
        }, (error) => {
          console.error("Firebase xatosi:", error);
          setPageLoading(false);
        });
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const isDark = theme === "dark";

  const bg = isDark ? "#0f1117" : "#f8f9fa";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";

  if (pageLoading) {
    return (
      <div style={{ 
        backgroundColor: bg, 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        color: textPrimary 
      }}>
        <Loader2 className="animate-spin" size={48} style={{ color: "#dc2626", marginBottom: 16 }} />
        <p style={{ fontWeight: 600, fontSize: 18 }}>Yuklanmoqda...</p>
      </div>
    );
  }

  const scores = [
    { id: "flappy", title: "Lexical Runner", icon: Zap, color: "#3b82f6", score: bestScores.flappy, unit: "pts" },
    { id: "doom", title: "Doom", icon: Skull, color: "#ef4444", score: bestScores.doom, unit: "pts" },
    { id: "wordle", title: "Wordle", icon: Grid3x3, color: "#10b981", score: bestScores.wordle_wins, unit: "pts" },
    { id: "snake", title: "Word Snake", icon: Snail, color: "#10b9b1", score: bestScores.word_snake, unit: "pts" },
    { id: "glyph", title: "Glyph Strike", icon: ALargeSmall, color: "#ef4444", score: bestScores.glyph, unit: "pts" },
  ];

  const cardBg = isDark ? "#1a1d27" : "#ffffff";
  const border = isDark ? "#2d3148" : "#e5e7eb";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";

  return (
    <div style={{ backgroundColor: bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px" }}>
        
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748b", textDecoration: "none", marginBottom: 24, fontSize: 15, fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Games
        </Link>

        <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
          <button onClick={toggleTheme} style={{ position: "absolute", top: 0, right: 0, padding: 8, borderRadius: 8, border: `1px solid ${border}`, backgroundColor: cardBg, color: textSecondary, cursor: "pointer" }}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: textPrimary, margin: 0 }}>Profil</h1>
          <p style={{ color: textSecondary, marginTop: 4 }}>Shaxsiy ma'lumotlar va yutuqlar</p>
        </div>

        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 24, display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: 12, 
            backgroundColor: "#dc262620", color: "#dc2626", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            fontSize: 32, fontWeight: 900 
          }}>
            {userData?.userName?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: textPrimary, margin: 0 }}>{userData?.userName}</h2>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#dc2626", marginTop: 4 }}>{userData?.role}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 8, borderRadius: 8, backgroundColor: "#dc262615", color: "#dc2626", display: "flex" }}>
                <User size={20} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: textPrimary, margin: 0 }}>Ma'lumotlar</h3>
            </div>
            <InfoRow label="Username" value={userData?.userName} icon={<User size={16} />} textPrimary={textPrimary} textSecondary={textSecondary} border={border} />
            <InfoRow label="Email" value={userData?.email} icon={<Mail size={16} />} textPrimary={textPrimary} textSecondary={textSecondary} border={border} />
          </div>

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
                    <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: game.color + (isDark ? "25" : "15"), display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} style={{ color: game.color }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: textSecondary, margin: 0 }}>{game.title}</p>
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
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
    </div>
    <p style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: 0, paddingLeft: 24 }}>{value || "—"}</p>
  </div>
);

export default Profile;