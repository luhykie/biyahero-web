import TerminalList from "./TerminalList";

const TAB_LABELS = {
  budget: "Budget-Friendly Route",
  cheapest: "Cheapest Route",
  fastest: "Fastest Route",
  direct: "Direct Route",
};

function getRideLabel(ride) {
  const mode = ride.mode || ride.route?.type || "Ride";
  const code = ride.route?.code ? ` ${ride.route.code}` : "";
  return `${mode}${code}`;
}

function formatEta(minutes) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(Date.now() + minutes * 60000));
}

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
      <div className="card panel-card recommendations-card">
        <div className="panel-kicker">Recommended Rides</div>
        <h3 className="section-title">Top options for your trip</h3>
        <p className="muted">Enter your origin, destination, and daily budget to get a one-way jeep or bus recommendation.</p>
      </div>
    );
  }

  const activeTab =
    selectedRouteTab && transit.routeOptions?.[selectedRouteTab]
      ? selectedRouteTab
      : transit.availableTabs?.[0] || null;

  const activeOption = activeTab ? transit.routeOptions?.[activeTab] : null;
  const dailyBudget = Math.max(0, Number(budgetAmount) || 0);
  const eta = activeOption ? formatEta(activeOption.estimatedDuration) : "-";

  return (
    <div className="card panel-card recommendations-card">
      <div className="panel-kicker">Recommended Rides</div>
      <h3 className="section-title">Top options for your trip</h3>

      <div className="route-choice-list">
        {transit.availableTabs?.map((tab) => {
          const option = transit.routeOptions?.[tab];
          if (!option) return null;

          return (
            <button
              key={tab}
              type="button"
              className={`route-choice ${activeTab === tab ? "active" : ""}`}
              onClick={() => onSelectRouteTab(tab)}
            >
              <span>{TAB_LABELS[tab]}</span>
              <div className="ride-icons">{option.rides.map(getRideLabel).join(" + ")}</div>
              <div className="ride-metrics">
                <small>Est. Fare <strong>PHP {option.estimatedCostPerDay}</strong></small>
                <small>Est. Time <strong>{option.estimatedDuration}m</strong></small>
                <small>ETA <strong>{formatEta(option.estimatedDuration)}</strong></small>
                <small>Transfers <strong>{Math.max(option.rides.length - 1, 0)}</strong></small>
              </div>
              <em>View Route</em>
            </button>
          );
        })}
      </div>

      <div className="summary-grid compact-summary recommendation-summary">
        <div className="summary-block">
          <span>Origin</span>
          <strong>{originText || "-"}</strong>
        </div>
        <div className="summary-block">
          <span>Destination</span>
          <strong>{destinationText || "-"}</strong>
        </div>
        <div className="summary-block">
          <span>Daily Budget</span>
          <strong>PHP {dailyBudget}</strong>
        </div>
        <div className="summary-block">
          <span>Trip</span>
          <strong>One-way</strong>
        </div>
        <div className="summary-block">
          <span>ETA</span>
          <strong>{eta}</strong>
        </div>
      </div>

      <div className="route-note">
        <strong>{transit.recommendation}</strong>
        <span>{transit.reason}</span>
      </div>

      {activeOption ? (
        <>
          <h4 className="mini-title">How to Commute</h4>
          <ol className="route-list ordered">
            {activeOption.rideGuide?.map((step, index) => (
              <li key={`guide-${index}`}>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <h4 className="mini-title">Travel Notes</h4>
          <div className="note-stack">
            {activeOption.rides?.map((ride, index) => (
              <span key={`ride-stop-${index}`}>
                Board {getRideLabel(ride)} at {ride.boardAt}; get off at {ride.alightAt}.
              </span>
            ))}
            <span>
              Transfers: {Math.max((activeOption.rides?.length || 1) - 1, 0)}
            </span>
            {selectedMoves?.length ? <span>Moves: {selectedMoves.join(", ")}</span> : null}
          </div>

          <h4 className="mini-title">Terminal Guide</h4>
          <TerminalList terminals={activeOption.terminals || []} />
        </>
      ) : (
        <p className="muted">No jeep or bus recommendation available yet.</p>
      )}
    </div>
  );
}
