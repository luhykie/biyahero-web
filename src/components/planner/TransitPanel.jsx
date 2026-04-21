import TerminalList from "./TerminalList";

export default function TransitPanel({ transit }) {
  if (!transit) {
    return (
      <div className="card glossy-card">
        <h3 className="section-title">Budget Tracker</h3>
        <p className="muted">Generate a ride first to see the best transport suggestion.</p>
      </div>
    );
  }

  return (
    <div className="card glossy-card">
      <h3 className="section-title">Recommended Ride</h3>
      <p className="kv"><strong>Suggested Transport:</strong> {transit.recommendation}</p>
      <p className="kv"><strong>Why:</strong> {transit.reason}</p>

      {transit.routes?.length > 0 && (
        <>
          <h4 className="mini-title">Possible Routes</h4>
          <ul className="route-list">
            {transit.routes.map((route) => (
              <li key={route.id}>
                <strong>{route.type} {route.code}</strong>
                <span>{route.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h4 className="mini-title">Terminal Guide</h4>
      <TerminalList terminals={transit.terminals} />
    </div>
  );
}