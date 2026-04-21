import { useMemo, useState } from "react";
import LocationAutocompleteInput from "../components/inputs/LocationAutocompleteInput";
import MapView from "../components/maps/MapView";
import HeroMovesChecklist from "../components/planner/HeroMovesChecklist";
import TransitPanel from "../components/planner/TransitPanel";
import RouteSummaryCard from "../components/dashboard/RouteSummaryCard";
import SavingsDashboard from "../components/dashboard/SavingsDashboard";
import HistoryPanel from "../components/history/HistoryPanel";
import { getRoute } from "../services/routingApi";
import { calculateSavings } from "../utils/calculations";
import { getStressLevel } from "../utils/stressLogic";
import { getTransitRecommendation } from "../utils/transitLogic";
import { getHistory, saveHistoryItem, clearHistory } from "../utils/historyStorage";
import landmarks from "../data/landmarks.json";

function countWeekdayInMonth(year, monthIndex, weekday) {
  const date = new Date(year, monthIndex, 1);
  let count = 0;
  while (date.getMonth() === monthIndex) {
    if (date.getDay() === weekday) count += 1;
    date.setDate(date.getDate() + 1);
  }
  return count;
}

function getCommuteCounts(selectedWeekdays, calendarMonth) {
  const [yearStr, monthStr] = String(calendarMonth).split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const todayWeekday = new Date().getDay();

  const daily = selectedWeekdays.includes(todayWeekday) ? 1 : 0;
  const weekly = selectedWeekdays.length;
  const monthly = selectedWeekdays.reduce(
    (sum, weekday) => sum + countWeekdayInMonth(year, monthIndex, weekday),
    0
  );

  return { daily, weekly, monthly };
}

export default function MainApp({ user, onLogout }) {
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  const [calendarMonth, setCalendarMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedCommuteDays, setSelectedCommuteDays] = useState([1, 2, 3, 4, 5]);
  const [tripsPerDay, setTripsPerDay] = useState(2);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [selectedMoves, setSelectedMoves] = useState([]);

  const [routeInfo, setRouteInfo] = useState(null);
  const [route, setRoute] = useState(null);
  const [savings, setSavings] = useState(null);
  const [currentStress, setCurrentStress] = useState(null);
  const [betterStress, setBetterStress] = useState(null);
  const [transit, setTransit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(getHistory());
  const [activeView, setActiveView] = useState("planner");
  const budgetPeriod = "monthly";
  const commuteCounts = useMemo(
    () => getCommuteCounts(selectedCommuteDays, calendarMonth),
    [selectedCommuteDays, calendarMonth]
  );
  const computedTripCountByPeriod = {
    daily: commuteCounts.daily * tripsPerDay,
    weekly: commuteCounts.weekly * tripsPerDay,
    monthly: commuteCounts.monthly * tripsPerDay,
  };
  const effectiveTripCount = computedTripCountByPeriod[budgetPeriod] || 0;

  const tripsThisMonth = useMemo(
    () =>
      history.filter((item) => {
        const now = new Date();
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      }).length,
    [history]
  );

  const daysWithTrips = useMemo(
    () => new Set(history.map((item) => item.date)).size,
    [history]
  );

  const totalMoneySaved = useMemo(
    () => history.reduce((sum, item) => sum + (item.perTripSaved || 0), 0),
    [history]
  );

  const generateRoute = async () => {
    if (!origin || !destination || !budgetAmount || !calendarMonth) {
      alert("Please complete your savings form first.");
      return;
    }

    if (effectiveTripCount < 1) {
      alert("Please pick your commute day/s in Calendar first.");
      return;
    }

    try {
      setLoading(true);

      const data = await getRoute(origin, destination);
      setRoute(data.coordinates);
      setRouteInfo(data);

      const computedSavings = calculateSavings({
        distanceKm: Number(data.distanceKm),
        durationMinutes: Number(data.durationMin),
        budgetPeriod,
        budgetAmount,
        tripCount: effectiveTripCount,
        selectedMoves,
      });

      setSavings(computedSavings);

      setCurrentStress(
        getStressLevel({
          durationMinutes: computedSavings.currentTime,
          selectedMoves: [],
        })
      );

      setBetterStress(
        getStressLevel({
          durationMinutes: computedSavings.betterTime,
          selectedMoves,
        })
      );

      const transitData = getTransitRecommendation(
        originText,
        destinationText,
        selectedMoves
      );
      setTransit(transitData);
      setActiveView("results");

      const historyItem = {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        from: originText,
        to: destinationText,
        budgetPeriod,
        budgetAmount: Number(budgetAmount),
        tripCount: effectiveTripCount,
        commuteTrips: effectiveTripCount,
        estimatedSpent: computedSavings.projectedSpend,
        actualSpent: computedSavings.betterCost,
        perTripSaved: computedSavings.perTrip,
        dailySaved: computedSavings.perDay,
        monthlySaved: computedSavings.perMonth,
        transportType: transitData.recommendation,
      };

      setHistory(saveHistoryItem(historyItem));
    } catch (error) {
      alert("Failed to generate route. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCommuteDay = (weekday) => {
    setSelectedCommuteDays((current) => {
      if (current.includes(weekday)) {
        return current.filter((day) => day !== weekday);
      }
      return [...current, weekday].sort((a, b) => a - b);
    });
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="BiyaHero" className="sidebar-logo" />
          <div>
            <strong>BiyaHero</strong>
            <span>Ride Saver</span>
          </div>
        </div>

        <div className="sidebar-card">
          <h4>Commute Setup</h4>
          <label className="sidebar-field-label">Month</label>
          <input
            className="input sidebar-input"
            type="month"
            value={calendarMonth}
            onChange={(e) => setCalendarMonth(e.target.value)}
          />

          <div className="trip-direction-row sidebar-direction-row">
            <button
              type="button"
              className={`weekday-chip sidebar-chip ${tripsPerDay === 1 ? "active" : ""}`}
              onClick={() => setTripsPerDay(1)}
            >
              One-way
            </button>
            <button
              type="button"
              className={`weekday-chip sidebar-chip ${tripsPerDay === 2 ? "active" : ""}`}
              onClick={() => setTripsPerDay(2)}
            >
              Two-way
            </button>
          </div>

          <div className="weekday-row sidebar-weekday-row">
            {[
              { label: "Mon", value: 1 },
              { label: "Tue", value: 2 },
              { label: "Wed", value: 3 },
              { label: "Thu", value: 4 },
              { label: "Fri", value: 5 },
              { label: "Sat", value: 6 },
              { label: "Sun", value: 0 },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={`weekday-chip sidebar-chip ${selectedCommuteDays.includes(option.value) ? "active" : ""}`}
                onClick={() => handleToggleCommuteDay(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-card">
          <h4>Commute Snapshot</h4>
          <div className="sidebar-metric">
            <span>Today</span>
            <strong>{computedTripCountByPeriod.daily}</strong>
          </div>
          <div className="sidebar-metric">
            <span>This week</span>
            <strong>{computedTripCountByPeriod.weekly}</strong>
          </div>
          <div className="sidebar-metric">
            <span>This month</span>
            <strong>{computedTripCountByPeriod.monthly}</strong>
          </div>
        </div>

        <div className="sidebar-card">
          <h4>Map Legend</h4>
          <div className="legend-box">
            <div className="legend-row">
              <span className="legend-marker legend-origin">O</span>
              <span>Origin</span>
            </div>
            <div className="legend-row">
              <span className="legend-marker legend-destination">D</span>
              <span>Destination</span>
            </div>
            <div className="legend-row">
              <span className="legend-marker legend-terminal">T</span>
              <span>Terminal</span>
            </div>
            <div className="legend-row">
              <span className="legend-marker legend-landmark">L</span>
              <span>Landmark stop</span>
            </div>
            <div className="legend-row">
              <span className="legend-line blue" />
              <span>Main route</span>
            </div>
            <div className="legend-row">
              <span className="legend-line green" />
              <span>Suggested PUJ path</span>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="ghost-btn full-width" onClick={onLogout} type="button">
            Log out
          </button>
          <div className="user-mini">
            <strong>{user?.name || "Guest User"}</strong>
            <span>{user?.email || "Local mode"}</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="top-header glossy-card">
          <div>
            <h1 className="header-title">
              {activeView === "planner" ? "Set your transportation budget" : "Trip Results"}
            </h1>
            <p className="header-subtitle">
              {activeView === "planner"
                ? "Set your commute details then track your savings."
                : "Review your route, map, and recommended PUJ paths."}
            </p>
          </div>
          {activeView === "results" ? (
            <button
              className="ghost-btn"
              type="button"
              onClick={() => setActiveView("planner")}
            >
              Back to Planner
            </button>
          ) : null}
        </header>

        <SavingsDashboard
          history={history}
          savings={savings}
          budgetAmount={budgetAmount}
          budgetPeriod={budgetPeriod}
          tripCount={effectiveTripCount}
          totalMoneySaved={totalMoneySaved}
          tripsThisMonth={tripsThisMonth}
          daysWithTrips={daysWithTrips}
        />

        {activeView === "planner" ? (
          <section className="planner-grid">
          <div className="left-column">
            <div className="card glossy-card">
              <h2 className="section-title">Savings Form</h2>

              <div className="grid-2">
                <LocationAutocompleteInput
                  value={originText}
                  setValue={setOriginText}
                  onSelect={setOrigin}
                  placeholder="Current Location"
                />

                <LocationAutocompleteInput
                  value={destinationText}
                  setValue={setDestinationText}
                  onSelect={setDestination}
                  placeholder="Destination"
                />
              </div>

              <div className="grid-2" style={{ marginTop: 14 }}>
                <div>
                  <label className="field-label">Monthly Budget</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="e.g. 500"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="field-label">Trips (auto from Calendar)</label>
                  <input
                    className="input"
                    type="text"
                    value={effectiveTripCount}
                    readOnly
                  />
                </div>
              </div>

              <HeroMovesChecklist
                selectedMoves={selectedMoves}
                setSelectedMoves={setSelectedMoves}
                actionButton={
                  <button
                    className="button-primary full-width"
                    onClick={generateRoute}
                    disabled={loading}
                    type="button"
                  >
                    {loading ? "Calculating..." : "Track Savings"}
                  </button>
                }
              />
            </div>
          </div>

          <div className="right-column">
            <TransitPanel transit={transit} />
            <HistoryPanel
              history={history}
              onClear={() => {
                clearHistory();
                setHistory([]);
              }}
            />
          </div>
          </section>
        ) : (
          <section className="planner-grid">
            <div className="left-column">
              <RouteSummaryCard
                routeInfo={routeInfo}
                savings={savings}
                currentStress={currentStress}
                betterStress={betterStress}
              />
              <MapView
                origin={origin}
                destination={destination}
                route={route}
                terminals={transit?.terminals || []}
                landmarks={transit?.landmarks || landmarks}
                pujRoutePolylines={transit?.pujRoutePolylines || []}
              />
            </div>
            <div className="right-column">
              <TransitPanel transit={transit} />
              <HistoryPanel
                history={history}
                onClear={() => {
                  clearHistory();
                  setHistory([]);
                }}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}