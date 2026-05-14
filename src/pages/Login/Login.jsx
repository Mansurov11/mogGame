import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Eye,
  EyeOff,
  Gamepad2,
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react";
import { log } from "firebase/firestore/pipelines";
import axios from "axios";
import { toast } from "react-toastify";
import { auth } from "../../firebase"; // firebase.js faylingiz yo'li
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
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

  const toggleTheme = () => setTheme((t) => (t == "light" ? "dark" : "light"));
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Firebase orqali kirish
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // 2. Tokenni olish
    const token = await user.getIdToken();

    // 3. LocalStorage-ga saqlash
    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", user.uid);
    localStorage.setItem("userEmail", user.email); // Email ni ham saqlash

    console.log("Token saqlandi:", token);
    toast.success("Xush kelibsiz!");
    
    navigate("/");
  } catch (error) {
    console.error("Xatolik tafsiloti:", error.code);
    
    let msg = "Kirishda xatolik yuz berdi";
    if (error.code === "auth/invalid-credential") msg = "Email yoki parol noto'g'ri!";
    if (error.code === "auth/user-not-found") msg = "Bunday foydalanuvchi mavjud emas!";
    if (error.code === "auth/wrong-password") msg = "Parol noto'g'ri!";
    
    toast.error(msg);
  } finally {
    setLoading(false);
  }
}
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
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
            Welcome back
          </h1>
          <p
            className="text-sm"
            style={{ color: isDark ? "#94a3b8" : "#6b7280" }}
          >
            Sign in to continue playing
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            {/* <div className="flex justify-end -mt-1">
              <button
                type="button"
                className="text-sm hover:underline"
                style={{ color: "#dc2626" }}
              >
                Forgot password?
              </button>
            </div> */}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: "#dc2626" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 text-center">
            <p
              className="text-sm"
              style={{ color: isDark ? "#94a3b8" : "#6b7280" }}
            >
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="font-medium hover:underline"
                style={{ color: "#dc2626" }}
              >
                Sign up
              </button>
            </p>
          </div>
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

export default Login;
