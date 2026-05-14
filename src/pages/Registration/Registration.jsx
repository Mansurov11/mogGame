import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Eye, EyeOff, Gamepad2, ArrowLeft, User, Mail, Lock, CheckCircle2 } from "lucide-react";
import { auth, db } from "../../firebase"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();

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

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordMatch = confirm.length > 0 && password === confirm;
  const passwordMismatch = confirm.length > 0 && password !== confirm;

const handleSubmit = async (e) => {
  e.preventDefault();
  if (passwordMismatch) return;
  
  setLoading(true);

  try {
    // 2. Firebase Auth orqali yangi foydalanuvchi yaratish
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 3. Foydalanuvchi ma'lumotlarini (username) Realtime Database-ga yozish
    // Bu UID orqali foydalanuvchini kelajakda tanib olish uchun kerak
    await set(ref(db, 'Users/' + user.uid), {
      username: username,
      email: email,
      createdAt: new Date().toISOString(),
      bestScores: {
        game1: 0,
        game2: 0
      }
    });

    // 4. Muvaffaqiyatli holat
    setSuccess(true);
    toast.success("Hisob muvaffaqiyatli yaratildi!");
    
    setTimeout(() => {
      navigate("/login");
    }, 1500);

  } catch (error) {
    console.error("Registratsiya xatosi:", error.message);
    
    let msg = "Xatolik yuz berdi";
    if (error.code === "auth/email-already-in-use") msg = "Bu email band!";
    if (error.code === "auth/weak-password") msg = "Parol juda zaif (kamida 6 ta belgi)!";
    
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative"
      style={{ backgroundColor: isDark ? "#0f1117" : "#f8f9fa" }}
    >
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg border transition-colors"
        style={{
          backgroundColor: isDark ? "#1a1d27" : "#ffffff",
          borderColor: isDark ? "#2d3148" : "#e5e7eb",
          color: isDark ? "#94a3b8" : "#6b7280",
        }}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "#dc2626" }}
          >
             <img src="/helmet.png" alt="" />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: isDark ? "#f1f5f9" : "#111827" }}
          >
            Create account
          </h1>
          <p className="text-sm" style={{ color: isDark ? "#94a3b8" : "#6b7280" }}>
            Join and start playing for free
          </p>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-2xl shadow-xl p-8"
          style={{
            backgroundColor: isDark ? "#1a1d27" : "#ffffff",
            border: `1px solid ${isDark ? "#2d3148" : "#e5e7eb"}`,
          }}
        >
          {success ? (
            /* Success state */
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="w-14 h-14" style={{ color: "#10b981" }} />
              <p
                className="text-lg font-semibold"
                style={{ color: isDark ? "#f1f5f9" : "#111827" }}
              >
                Account created!
              </p>
              <p className="text-sm" style={{ color: isDark ? "#94a3b8" : "#6b7280" }}>
                Redirecting to login…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium"
                  style={{ color: isDark ? "#cbd5e1" : "#374151" }}
                >
                  Username
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: isDark ? "#64748b" : "#9ca3af" }}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    style={{
                      backgroundColor: isDark ? "#0f1117" : "#f9fafb",
                      border: `1px solid ${isDark ? "#2d3148" : "#e5e7eb"}`,
                      color: isDark ? "#f1f5f9" : "#111827",
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium"
                  style={{ color: isDark ? "#cbd5e1" : "#374151" }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: isDark ? "#64748b" : "#9ca3af" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    style={{
                      backgroundColor: isDark ? "#0f1117" : "#f9fafb",
                      border: `1px solid ${isDark ? "#2d3148" : "#e5e7eb"}`,
                      color: isDark ? "#f1f5f9" : "#111827",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium"
                  style={{ color: isDark ? "#cbd5e1" : "#374151" }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: isDark ? "#64748b" : "#9ca3af" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    style={{
                      backgroundColor: isDark ? "#0f1117" : "#f9fafb",
                      border: `1px solid ${isDark ? "#2d3148" : "#e5e7eb"}`,
                      color: isDark ? "#f1f5f9" : "#111827",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                    style={{ color: isDark ? "#64748b" : "#9ca3af" }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium"
                  style={{ color: isDark ? "#cbd5e1" : "#374151" }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: isDark ? "#64748b" : "#9ca3af" }}
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg focus:outline-none transition-all"
                    style={{
                      backgroundColor: isDark ? "#0f1117" : "#f9fafb",
                      border: `1px solid ${
                        passwordMismatch
                          ? "#ef4444"
                          : passwordMatch
                          ? "#10b981"
                          : isDark
                          ? "#2d3148"
                          : "#e5e7eb"
                      }`,
                      color: isDark ? "#f1f5f9" : "#111827",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                    style={{ color: isDark ? "#64748b" : "#9ca3af" }}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-xs" style={{ color: "#ef4444" }}>
                    Passwords don't match
                  </p>
                )}
                {passwordMatch && (
                  <p className="text-xs" style={{ color: "#10b981" }}>
                    Passwords match ✓
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || passwordMismatch}
                className="w-full py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 mt-1"
                style={{ backgroundColor: "#dc2626" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          {/* Switch to Login */}
          {!success && (
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: isDark ? "#94a3b8" : "#6b7280" }}>
                Already have an account?
                <button
                  onClick={() => navigate("/login")}
                  className="font-medium hover:underline"
                  style={{ color: "#dc2626" }}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Back to games */}
        {/* <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
          style={{ color: isDark ? "#94a3b8" : "#6b7280" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to games
        </button> */}
      </div>
    </div>
  );
};

export default Register;