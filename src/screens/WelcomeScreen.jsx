export default function WelcomeScreen({ onNext }) {
  return (
    <div className="welcome-page">
      <div className="welcome-shell">
        <section className="welcome-copy">
          <div className="welcome-brand">
            <img src="/logo.png" alt="BiyaHero Logo" className="welcome-logo" />
            <strong>BiyaHero</strong>
          </div>

          <h1>
            Explore Cebu <span>Smarter</span>
          </h1>
          <p>
            Your mobile-responsive travel and commute assistant for first-time
            travelers in Cebu.
          </p>

          <div className="welcome-features">
            <div>
              <span className="feature-icon">
                <img src="/assets/icons/maps.svg" alt="" />
              </span>
              <strong>Plan Routes</strong>
              <small>Find stops, terminals, landmarks, and ride paths.</small>
            </div>
            <div>
              <span className="feature-icon">
                <img src="/assets/icons/daily-budget.svg" alt="" />
              </span>
              <strong>Stay on Budget</strong>
              <small>Check if the recommended ride fits your daily limit.</small>
            </div>
            <div>
              <span className="feature-icon">
                <img src="/assets/icons/destinations.svg" alt="" />
              </span>
              <strong>Explore Cebu</strong>
              <small>Browse destinations, malls, beaches, and public places.</small>
            </div>
          </div>

          <button className="button-primary welcome-cta" onClick={onNext}>
            Plan My Trip
          </button>
          <button className="text-button" type="button" onClick={onNext}>
            Already have an account? Sign in
          </button>
        </section>

        <section className="welcome-art" aria-label="Cebu commute preview">
          <img
            src="/welcomePage.png"
            alt="Cebu church, jeepney, seaside, and Discover All of Cebu stamp"
            className="welcome-mockup"
          />
        </section>
      </div>
    </div>
  );
}
