import { useState } from "react";
import WelcomeScreen from "./screens/WelcomeScreen";
import AuthScreen from "./screens/AuthScreen";
import MainApp from "./screens/MainApp";

const SESSION_KEY = "biyahero_session";

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const storedSession = getStoredSession();
  const [screen, setScreen] = useState(storedSession?.user ? "app" : "welcome");
  const [user, setUser] = useState(storedSession?.user || null);

  if (screen === "welcome") {
    return <WelcomeScreen onNext={() => setScreen("auth")} />;
  }

  if (screen === "auth") {
    return (
      <AuthScreen
        onLogin={(userData) => {
          setUser(userData);
          localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userData }));
          setScreen("app");
        }}
      />
    );
  }

  return (
    <MainApp
      user={user}
      onLogout={() => {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem("biyahero_active_view");
        setScreen("welcome");
      }}
    />
  );
}
