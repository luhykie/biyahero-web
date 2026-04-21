export default function HistoryPanel({ history, onClear }) {
  return (
    <div className="card glossy-card" style={{ marginTop: 18 }}>
      <div className="panel-head">
        <h3 className="section-title">Trip History</h3>
        <button className="ghost-btn" onClick={onClear} type="button">
          Clear
        </button>
      </div>

      {history.length === 0 ? (
        <p className="muted">No trips saved yet.</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div>
                <strong>{item.from} → {item.to}</strong>
                <div className="muted tiny">
                  {item.transportType}
                </div>
              </div>

              <div className="history-metrics">
                <span>₱{item.actualSpent}</span>
                <small>saved ₱{item.perTripSaved}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}