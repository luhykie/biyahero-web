export default function RouteSummaryCard({
  routeInfo,
  savings,
  currentStress,
  betterStress,
}) {
  if (!routeInfo || !savings) return null;

  return (
    <div className="card glossy-card" style={{ marginTop: 18 }}>
      <h3 className="section-title">Route Summary</h3>

      <div className="summary-grid">
        <div className="summary-block">
          <span>Distance</span>
          <strong>{routeInfo.distanceKm.toFixed(2)} km</strong>
        </div>

        <div className="summary-block">
          <span>Estimated Duration</span>
          <strong>{routeInfo.durationMin} mins</strong>
        </div>

        <div className="summary-block">
          <span>Current Cost</span>
          <strong>₱{savings.currentCost}</strong>
        </div>

        <div className="summary-block">
          <span>Better Cost</span>
          <strong>₱{savings.betterCost}</strong>
        </div>

        <div className="summary-block">
          <span>Current Stress</span>
          <strong>{currentStress}</strong>
        </div>

        <div className="summary-block">
          <span>Better Stress</span>
          <strong>{betterStress}</strong>
        </div>
      </div>
    </div>
  );
}