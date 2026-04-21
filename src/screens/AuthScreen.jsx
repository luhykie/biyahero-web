import { useState } from "react";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      alert("Please fill in email and password.");
      return;
    }

    if (!isLogin && !fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    onLogin({
      name: fullName || "User",
      email,
    });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glossy-card">
        <img src="/logo.png" alt="BiyaHero Logo" className="logo-small" />
        <h1 className="brand-title">BiyaHero</h1>
        <h2 className="section-title auth-subtitle">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>

        {!isLogin && (
          <input
            className="input"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        <input
          className="input"
          placeholder="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="button-primary full-width auth-form-button"
          onClick={handleSubmit}
        >
          {isLogin ? "Sign In" : "Sign Up"}
        </button>

        <p className="switch-text">
          {isLogin ? "No account yet?" : "Already have an account?"}{" "}
          <span
            className="switch-link"
            onClick={() => setMode(isLogin ? "signup" : "login")}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
}