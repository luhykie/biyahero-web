export default function SavingsDashboard({
  history,
  savings,
  budgetAmount,
  tripCount,
  totalMoneySaved,
  tripsThisMonth,
  daysWithTrips,
}) {
  const budget = Math.max(0, Number(budgetAmount) || 0);
  const projectedSpend = Math.max(0, savings?.projectedSpend || 0);
  const budgetDiff = budget ? Math.max(budget - projectedSpend, 0) : 0;
  const savedTrips = history?.length || 0;

  return (
    <section className="stats-row">
      <div className="stat-card orange">
        <i><img src="/assets/icons/daily-budget.svg" alt="" /></i>
        <span>Daily Budget</span>
        <strong>PHP {budget || 0}</strong>
        <small>Set for today</small>
      </div>

      <div className="stat-card blue">
        <i><img src="/assets/icons/route-summary.svg" alt="" /></i>
        <span>Estimated Cost</span>
        <strong>PHP {projectedSpend}</strong>
        <small>For current trip</small>
      </div>

      <div className="stat-card green">
        <i><img src="/assets/icons/daily-budget.svg" alt="" /></i>
        <span>Budget Left</span>
        <strong>PHP {budgetDiff}</strong>
        <small>Remaining today</small>
      </div>

      <div className="stat-card coral">
        <i><img src="/assets/icons/trip-history.svg" alt="" /></i>
        <span>Trips Saved</span>
        <strong>{savedTrips}</strong>
        <small>Stored routes</small>
      </div>
    </section>
  );
}
