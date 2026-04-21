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

export default function MainApp({ user }) {
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [budgetPeriod, setBudgetPeriod] = useState("daily");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [tripCount, setTripCount] = useState("");
  const [selectedMoves, setSelectedMoves] = useState([]);

  const [routeInfo, setRouteInfo] = useState(null);
  const [route, setRoute] = useState(null);
  const [savings, setSavings] = useState(null);
  const [currentStress, setCurrentStress] = useState(null);
  const [betterStress, setBetterStress] = useState(null);
  const [transit, setTransit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(getHistory());

  const budgetPeriods = ["daily", "weekly", "monthly"];

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
    if (!origin || !destination || !tripCount || !budgetAmount || !date) {
      alert("Please complete your savings form first.");
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
        tripCount,
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

      const historyItem = {
        id: Date.now(),
        date,
        from: originText,
        to: destinationText,
        budgetPeriod,
        budgetAmount: Number(budgetAmount),
        tripCount: Number(tripCount),
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

        <nav className="sidebar-nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Trips</button>
          <button className="nav-item">Budget</button>
          <button className="nav-item">Calendar</button>
          <button className="nav-item">Savings</button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <strong>{user?.name || "Guest User"}</strong>
            <span>{user?.email || "Local mode"}</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="top-header glossy-card">
          <div>
            <h1 className="header-title">Set your transportation budget</h1>
            <p className="header-subtitle">
              Tell us your estimated transportation spending so we can track your savings accurately.
            </p>
          </div>

          <div className="period-switch">
            {budgetPeriods.map((item) => (
              <button
                key={item}
                className={`mini-chip ${budgetPeriod === item ? "active" : ""}`}
                onClick={() => setBudgetPeriod(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </header>

        <SavingsDashboard
          history={history}
          savings={savings}
          budgetAmount={budgetAmount}
          budgetPeriod={budgetPeriod}
          tripCount={Number(tripCount) || 0}
          totalMoneySaved={totalMoneySaved}
          tripsThisMonth={tripsThisMonth}
          daysWithTrips={daysWithTrips}
        />

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

              <div className="grid-3" style={{ marginTop: 14 }}>
                <div>
                  <label className="field-label">Date</label>
                  <input
                    className="input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="field-label">Budget Amount</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="e.g. 500"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="field-label">
                    Trips ({budgetPeriod})
                  </label>
                  <input
                    className="input"
                    type="number"
                    placeholder="e.g. 10"
                    value={tripCount}
                    onChange={(e) => setTripCount(e.target.value)}
                  />
                </div>
              </div>

              <HeroMovesChecklist
                selectedMoves={selectedMoves}
                setSelectedMoves={setSelectedMoves}
              />

              <div style={{ marginTop: 16 }}>
                <button
                  className="button-primary full-width"
                  onClick={generateRoute}
                  disabled={loading}
                >
                  {loading ? "Calculating Savings..." : "Track Savings"}
                </button>
              </div>
            </div>

            <MapView
              origin={origin}
              destination={destination}
              route={route}
              terminals={transit?.terminals || []}
            />

            <RouteSummaryCard
              routeInfo={routeInfo}
              savings={savings}
              currentStress={currentStress}
              betterStress={betterStress}
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
      </main>
    </div>
  );
}