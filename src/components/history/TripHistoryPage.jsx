export default function TripHistoryPage({
  history,
  onBack,
  onClear,
  onUseAgain,
}) {
  return (
    <section className="card panel-card history-page">
      <div className="panel-head">
        <div>
          <div className="panel-kicker">Trip History</div>
          <h2 className="section-title">Review saved trips and plans</h2>
        </div>

        <div className="panel-actions">
          <button className="ghost-btn" type="button" onClick={onBack}>
            Back
          </button>
          <button className="ghost-btn danger" type="button" onClick={onClear}>
            Clear History
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="muted">No trips saved yet.</p>
      ) : (
        <div className="history-table">
          <div className="history-row history-head">
            <span>Destination</span>
            <span>Date</span>
            <span>Fare</span>
            <span>Trips</span>
            <span>Transport</span>
            <span>Action</span>
          </div>

          {history.map((item) => (
            <div key={item.id} className="history-row">
              <span>
                <strong>{item.to}</strong>
                <small>{item.from}</small>
              </span>
              <span>{item.date}</span>
              <span>PHP {item.actualSpent || item.estimatedSpent || 0}</span>
              <span>{item.tripCount}</span>
              <span>{item.transportType}</span>
              <span>
                <button
                  className="ghost-btn compact"
                  type="button"
                  onClick={() => onUseAgain(item)}
                >
                  View
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
