const WEEKDAY_OPTIONS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

export default function CommuteCalendarCard({
  calendarMonth,
  setCalendarMonth,
  selectedCommuteDays,
  onToggleCommuteDay,
  commuteCounts,
  tripsPerDay,
  setTripsPerDay,
}) {
  const dayLabel = selectedCommuteDays
    .map((value) => WEEKDAY_OPTIONS.find((option) => option.value === value)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="card glossy-card" style={{ marginTop: 18 }}>
      <h3 className="section-title">Commute Calendar</h3>
      <p className="muted">Pick weekdays and trip direction. Totals auto-update.</p>

      <div className="grid-2">
        <div>
          <label className="field-label">Month</label>
          <input
            className="input"
            type="month"
            value={calendarMonth}
            onChange={(e) => setCalendarMonth(e.target.value)}
          />
        </div>

        <div className="calendar-counts">
          <div><strong>Daily:</strong> {commuteCounts.daily * tripsPerDay}</div>
          <div><strong>Weekly:</strong> {commuteCounts.weekly * tripsPerDay}</div>
          <div><strong>Monthly:</strong> {commuteCounts.monthly * tripsPerDay}</div>
        </div>
      </div>

      <div className="trip-direction-row">
        <button
          type="button"
          className={`weekday-chip ${tripsPerDay === 1 ? "active" : ""}`}
          onClick={() => setTripsPerDay(1)}
        >
          One-way
        </button>
        <button
          type="button"
          className={`weekday-chip ${tripsPerDay === 2 ? "active" : ""}`}
          onClick={() => setTripsPerDay(2)}
        >
          Two-way
        </button>
      </div>

      <div className="calendar-selected">
        <h4 className="mini-title">Weekdays</h4>
        <div className="weekday-row">
          {WEEKDAY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`weekday-chip ${selectedCommuteDays.includes(option.value) ? "active" : ""}`}
              onClick={() => onToggleCommuteDay(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="muted tiny" style={{ marginTop: 10 }}>
          {dayLabel || "No days selected"}
        </p>
      </div>
    </div>
  );
}
