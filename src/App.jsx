import { useState } from "react";
import WelcomeScreen from "./screens/WelcomeScreen";
import AuthScreen from "./screens/AuthScreen";
import MainApp from "./screens/MainApp";

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [user, setUser] = useState(null);

  if (screen === "welcome") {
    return <WelcomeScreen onNext={() => setScreen("auth")} />;
  }

  if (screen === "auth") {
    return (
      <AuthScreen
        onLogin={(userData) => {
          setUser(userData);
          setScreen("app");
        }}
      />
    );
  }

  return <MainApp user={user} />;
}