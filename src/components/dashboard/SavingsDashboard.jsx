export default function SavingsDashboard({
  history,
  savings,
  budgetAmount,
  budgetPeriod,
  tripCount,
  totalMoneySaved,
  tripsThisMonth,
  daysWithTrips,
}) {
  const budget = Number(budgetAmount) || 0;
  const projectedSpend = savings?.projectedSpend || 0;
  const budgetDiff = budget - projectedSpend;

  return (
    <section className="stats-row">
      <div className="stat-card blue glossy-card">
        <span>Total Spent Target</span>
        <strong>₱{budget || 0}</strong>
        <small>This {budgetPeriod}</small>
      </div>

      <div className="stat-card peach glossy-card">
        <span>Money Saved</span>
        <strong>₱{savings?.perTrip || 0}</strong>
        <small>Per ride</small>
      </div>

      <div className="stat-card yellow glossy-card">
        <span>Trips Tracked</span>
        <strong>{tripCount || 0}</strong>
        <small>This {budgetPeriod}</small>
      </div>

      <div className="stat-card lilac glossy-card">
        <span>Budget Left</span>
        <strong>₱{budgetDiff}</strong>
        <small>{budget > 0 ? `₱${projectedSpend} used` : "Set budget"}</small>
      </div>

      <div className="stat-card white glossy-card">
        <span>Total Saved</span>
        <strong>₱{totalMoneySaved}</strong>
        <small>All saved rides</small>
      </div>

      <div className="stat-card white glossy-card">
        <span>Trips This Month</span>
        <strong>{tripsThisMonth}</strong>
        <small>{daysWithTrips} days with trips</small>
      </div>
    </section>
  );
}