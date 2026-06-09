export default function RouteSummaryCard({
  routeInfo,
  savings,
  currentStress,
  betterStress,
  transit,
  selectedRouteTab,
}) {
  if (!routeInfo || !savings) return null;

  const activeOption =
    selectedRouteTab && transit?.routeOptions?.[selectedRouteTab]
      ? transit.routeOptions[selectedRouteTab]
      : transit?.primaryRoute;
  const travelTime = activeOption?.estimatedDuration || routeInfo.durationMin;
  const estimatedFare = activeOption?.estimatedCostPerDay || savings.betterCost;
  const eta = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(Date.now() + travelTime * 60000));

  return (
    <div className="card panel-card route-summary-card">
      <div className="panel-kicker">Route Summary</div>
      <h3 className="section-title">Recommended route details</h3>

      <div className="summary-grid">
        <div className="summary-block">
          <span>Distance</span>
          <strong>{routeInfo.distanceKm.toFixed(2)} km</strong>
        </div>

        <div className="summary-block">
          <span>Travel Time</span>
          <strong>{travelTime} mins</strong>
        </div>

        <div className="summary-block">
          <span>ETA</span>
          <strong>{eta}</strong>
        </div>

        <div className="summary-block">
          <span>Estimated Fare</span>
          <strong>PHP {estimatedFare}</strong>
        </div>

        <div className="summary-block">
          <span>Budget Left</span>
          <strong>PHP {savings.budgetLeft}</strong>
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
