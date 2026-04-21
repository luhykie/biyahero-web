export default function WelcomeScreen({ onNext }) {
  return (
    <div className="auth-shell">
      <div className="auth-card glossy-card">
        <img src="/logo.png" alt="BiyaHero Logo" className="logo-main" />
        <h1 className="brand-title">BiyaHero</h1>
        <p className="brand-tagline">Be the hero of your daily commute</p>

        <button className="button-primary full-width" onClick={onNext}>
          Get Started
        </button>
      </div>
    </div>
  );
}