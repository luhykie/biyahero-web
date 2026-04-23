export default function TripHistoryPage({
  history,
  onBack,
  onClear,
  onUseAgain,
}) {
  return (
    <section className="card glossy-card" style={{ marginTop: 18 }}>
      <div className="panel-head">
        <h2 className="section-title">Trip History</h2>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost-btn" type="button" onClick={onBack}>
            Back
          </button>
          <button className="ghost-btn" type="button" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="muted">No trips saved yet.</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div>
                <strong>
                  {item.from} → {item.to}
                </strong>

                <div className="muted tiny" style={{ marginTop: 4 }}>
                  {item.transportType} • Budget ₱{item.budgetAmount}
                </div>

                <div className="muted tiny" style={{ marginTop: 4 }}>
                  {item.tripCount} trips • saved ₱{item.perTripSaved}/trip
                </div>

                <div className="muted tiny" style={{ marginTop: 4 }}>
                  Date: {item.date}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => onUseAgain(item)}
                >
                  Use Again
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}