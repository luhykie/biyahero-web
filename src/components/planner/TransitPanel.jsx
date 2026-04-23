import TerminalList from "./TerminalList";

const TAB_LABELS = {
  budget: "Budget-Friendly Route",
  cheapest: "Cheapest Route",
  fastest: "Fastest Route",
  direct: "Direct Route",
};

export default function TransitPanel({
  transit,
  selectedRouteTab,
  onSelectRouteTab,
  originText,
  destinationText,
  budgetAmount,
  tripCount,
  selectedMoves,
}) {
  if (!transit) {
    return (
      <div className="card glossy-card">
        <h3 className="section-title">Recommended Ride</h3>
        <p className="muted">Generate a ride first to see the best transport suggestion.</p>
      </div>
    );
  }

  const activeTab =
    selectedRouteTab && transit.routeOptions?.[selectedRouteTab]
      ? selectedRouteTab
      : transit.availableTabs?.[0] || null;

  const activeOption = activeTab ? transit.routeOptions?.[activeTab] : null;

  return (
    <div className="card glossy-card">
      <h3 className="section-title">Recommended Ride</h3>

      <div className="summary-grid" style={{ marginBottom: 14 }}>
        <div className="summary-block">
          <span>Origin</span>
          <strong>{originText || "—"}</strong>
        </div>
        <div className="summary-block">
          <span>Destination</span>
          <strong>{destinationText || "—"}</strong>
        </div>
        <div className="summary-block">
          <span>Daily Budget</span>
          <strong>₱{budgetAmount || 0}</strong>
        </div>
        <div className="summary-block">
          <span>Trips</span>
          <strong>{tripCount || 0}</strong>
        </div>
      </div>

      <p className="kv">
        <strong>Suggested Transport:</strong> {transit.recommendation}
      </p>
      <p className="kv">
        <strong>Why:</strong> {transit.reason}
      </p>
      <div className="kv">
        <strong>Hero Moves Used:</strong>{" "}
        {selectedMoves?.length ? selectedMoves.join(", ") : "None selected"}
      </div>

      {transit.availableTabs?.length > 0 && (
        <>
          <h4 className="mini-title">Route Options</h4>
          <div className="trip-direction-row" style={{ marginBottom: 12, flexWrap: "wrap" }}>
            {transit.availableTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`weekday-chip ${activeTab === tab ? "active" : ""}`}
                onClick={() => onSelectRouteTab(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </>
      )}

      {activeOption ? (
        <>
          <div className="summary-grid" style={{ marginBottom: 14 }}>
            <div className="summary-block">
              <span>Selected</span>
              <strong>{TAB_LABELS[activeTab]}</strong>
            </div>
            <div className="summary-block">
              <span>Estimated Cost per Day</span>
              <strong>₱{activeOption.estimatedCostPerDay}</strong>
            </div>
            <div className="summary-block">
              <span>Estimated Time</span>
              <strong>{activeOption.estimatedDuration} mins</strong>
            </div>
            <div className="summary-block">
              <span>Rides</span>
              <strong>{activeOption.rides.length}</strong>
            </div>
          </div>

          <h4 className="mini-title">How to Commute</h4>
          <ul className="route-list">
            {activeOption.rideGuide?.map((step, index) => (
              <li key={`guide-${index}`}>
                <span>{step}</span>
              </li>
            ))}
          </ul>

          <h4 className="mini-title">Alternative Routes</h4>
          <ul className="route-list">
            {transit.routes
              ?.filter((route) => route.id !== activeOption.id)
              .map((route) => (
                <li key={route.id}>
                  <div>
                    <strong>{route.type}: {route.code}</strong>
                    <span>{route.name}</span>
                    <span>Estimated Cost per Day: ₱{route.estimatedCostPerDay}</span>
                    <span>Estimated Time: {route.estimatedDuration} mins</span>
                  </div>
                </li>
              ))}
          </ul>

          <h4 className="mini-title">Terminal Guide</h4>
          <TerminalList terminals={activeOption.terminals || []} />
        </>
      ) : (
        <p className="muted">No route option available.</p>
      )}
    </div>
  );
}