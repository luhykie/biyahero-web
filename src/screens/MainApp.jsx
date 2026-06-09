import { useEffect, useMemo, useState } from "react";
import LocationAutocompleteInput from "../components/inputs/LocationAutocompleteInput";
import MapView from "../components/maps/MapView";
import TransitPanel from "../components/planner/TransitPanel";
import RouteSummaryCard from "../components/dashboard/RouteSummaryCard";
import SavingsDashboard from "../components/dashboard/SavingsDashboard";
import TripHistoryPage from "../components/history/TripHistoryPage";
import { BellIcon, MenuIcon, UserIcon } from "../components/ui/AppIcons";
import MobileMoreMenu from "../components/ui/MobileMoreMenu";
import { getRoute } from "../services/routingApi";
import { calculateSavings } from "../utils/calculations";
import { getStressLevel } from "../utils/stressLogic";
import { getTransitRecommendation } from "../utils/transitLogic";
import {
  getHistory,
  saveHistoryItem,
  clearHistory,
} from "../utils/historyStorage";
import landmarks from "../data/landmarks.json";

const NAV_ITEMS = [
  { id: "planner", label: "Dashboard", icon: "/assets/icons/maps.svg" },
  { id: "results", label: "Routes", icon: "/assets/icons/map-legend.svg" },
  { id: "history", label: "History", icon: "/assets/icons/trip-history.svg" },
  { id: "favorites", label: "Saved", icon: "/assets/icons/heart.svg" },
  { id: "guide", label: "Guide", icon: "/assets/icons/point-of-interest.svg" },
];

const MOBILE_NAV_ITEMS = [
  { id: "planner", label: "Home", icon: "/assets/icons/maps.svg" },
  { id: "results", label: "Map", icon: "/assets/icons/map-legend.svg" },
  { id: "history", label: "History", icon: "/assets/icons/trip-history.svg" },
];

const MOBILE_MORE_ITEMS = [
  { id: "favorites", label: "Saved", icon: "/assets/icons/heart.svg" },
  { id: "destinations", label: "Destinations", icon: "/assets/icons/destinations.svg" },
  { id: "guide", label: "Guide", icon: "/assets/icons/point-of-interest.svg" },
  { id: "settings", label: "Profile", icon: "/assets/icons/commute-setup.svg" },
];

const ACTIVE_VIEW_KEY = "biyahero_active_view";
const FARE_DISCOUNT_KEY = "biyahero_fare_discount";
const FARE_DISCOUNT_OPTIONS = [
  { value: "regular", label: "Regular" },
  { value: "student", label: "Student" },
  { value: "senior", label: "Senior Citizen" },
  { value: "pwd", label: "PWD" },
];

const DESTINATIONS = [
  {
    name: "Cebu City",
    type: "Urban & Heritage",
    tone: "city",
    slug: "basilica-santo-nino",
    lat: 10.3157,
    lon: 123.8854,
    notes: "Good for heritage walks, malls, terminals, and city landmarks.",
  },
  {
    name: "Oslob",
    type: "Whale Sharks",
    tone: "sea",
    slug: "oslob-whale-sharks",
    lat: 9.5219,
    lon: 123.4315,
    notes: "Popular south Cebu day trip with early morning travel recommended.",
  },
  {
    name: "Moalboal",
    type: "Beaches & Diving",
    tone: "reef",
    slug: "moalboal",
    lat: 9.9437,
    lon: 123.3992,
    notes: "Known for beaches, sardine run, and access to south Cebu routes.",
  },
  {
    name: "Bantayan",
    type: "Island Escape",
    tone: "island",
    slug: "bantayan-island",
    lat: 11.1674,
    lon: 123.7228,
    notes: "Requires northbound land travel plus ferry connection.",
  },
  {
    name: "Simala Shrine",
    type: "Miraculous Shrine",
    tone: "shrine",
    slug: "simala-shrine",
    lat: 10.0818,
    lon: 123.5682,
    notes: "A common shrine stop reached through southbound bus routes.",
  },
  {
    name: "Kawasan Falls",
    type: "Canyoneering",
    tone: "falls",
    slug: "kawasan-falls",
    lat: 9.8029,
    lon: 123.3746,
    notes: "Best planned with extra travel time for Badian and nearby terminals.",
  },
  {
    name: "Mactan",
    type: "Beaches & Resorts",
    tone: "sea",
    slug: "mactan-island",
    lat: 10.3098,
    lon: 123.9792,
    notes: "Close to the airport, resorts, beaches, and island activities.",
  },
  {
    name: "Carcar",
    type: "Heritage & Lechon",
    tone: "city",
    slug: "carcar-city",
    lat: 10.1061,
    lon: 123.6402,
    notes: "South Cebu heritage stop known for food and old-town landmarks.",
  },
  {
    name: "Temple of Leah",
    type: "Landmark Views",
    tone: "shrine",
    slug: "temple-of-leah",
    lat: 10.3692,
    lon: 123.8732,
    notes: "Mountain-side landmark with city views, usually reached by taxi or habal-habal.",
  },
  {
    name: "Sirao Garden",
    type: "Mountain Garden",
    tone: "falls",
    slug: "sirao-flower-garden",
    lat: 10.4108,
    lon: 123.8734,
    notes: "Upland tourist spot often paired with Busay and Temple of Leah.",
  },
  {
    name: "Magellan's Cross",
    type: "Historic Landmark",
    tone: "city",
    slug: "magellans-cross",
    lat: 10.2939,
    lon: 123.9022,
    notes: "Historic landmark near Basilica Minore del Santo Nino.",
  },
  {
    name: "Sumilon Island",
    type: "Sandbar & Island",
    tone: "island",
    slug: "sumilon-island",
    lat: 9.4339,
    lon: 123.3867,
    notes: "Island and sandbar destination often paired with Oslob trips.",
  },
  {
    name: "Malapascua Island",
    type: "Diving Island",
    tone: "island",
    slug: "malapascua-island",
    lat: 11.3305,
    lon: 124.1196,
    notes: "North Cebu island known for diving and thresher shark trips.",
  },
  {
    name: "Fort San Pedro",
    type: "Historic Fort",
    tone: "city",
    slug: "fort-san-pedro",
    lat: 10.2924,
    lon: 123.9058,
    notes: "Historic fort near Plaza Independencia and Pier 1.",
  },
  {
    name: "Cebu Taoist Temple",
    type: "Temple & Views",
    tone: "shrine",
    slug: "cebu-taoist-temple",
    lat: 10.3369,
    lon: 123.8887,
    notes: "Temple destination in Beverly Hills with city views.",
  },
  {
    name: "Carmen Heritage Church",
    type: "Heritage Church",
    tone: "city",
    slug: "carmen-heritage-church",
    lat: 10.5948,
    lon: 123.9651,
    notes: "North Cebu heritage church stop along Carmen routes.",
  },
];

const WEATHER = {
  temperatureC: 29,
  humidity: 72,
};

function getStoredActiveView() {
  try {
    return localStorage.getItem(ACTIVE_VIEW_KEY) || "planner";
  } catch {
    return "planner";
  }
}

function getStoredFareDiscountType() {
  try {
    return localStorage.getItem(FARE_DISCOUNT_KEY) || "regular";
  } catch {
    return "regular";
  }
}

function getFareDiscountRate(discountType) {
  return discountType === "regular" ? 0 : 0.2;
}

function getHeatIndexC(temperatureC, humidity) {
  const temperatureF = temperatureC * 1.8 + 32;
  const heatIndexF =
    -42.379 +
    2.04901523 * temperatureF +
    10.14333127 * humidity -
    0.22475541 * temperatureF * humidity -
    0.00683783 * temperatureF ** 2 -
    0.05481717 * humidity ** 2 +
    0.00122874 * temperatureF ** 2 * humidity +
    0.00085282 * temperatureF * humidity ** 2 -
    0.00000199 * temperatureF ** 2 * humidity ** 2;

  return Math.round((heatIndexF - 32) / 1.8);
}

function formatHeaderDate(date) {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatHeaderTime(date) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function applyStopoverMetrics(transitData, routeData, fallbackFare) {
  if (!routeData?.stopover || !transitData) return transitData;

  const minimumFare = Math.round(Math.max(0, Number(fallbackFare) || 0) * 100) / 100;
  const minimumDuration = Math.max(0, Number(routeData.durationMin) || 0);
  const adjustOption = (option) => {
    if (!option) return option;

    return {
      ...option,
      estimatedCostPerDay: Math.max(
        Number(option.estimatedCostPerDay) || 0,
        minimumFare
      ),
      estimatedDuration: Math.max(
        Number(option.estimatedDuration) || 0,
        minimumDuration
      ),
    };
  };

  const routeOptions = Object.fromEntries(
    Object.entries(transitData.routeOptions || {}).map(([key, option]) => [
      key,
      adjustOption(option),
    ])
  );

  const primaryKey = transitData.availableTabs?.[0];

  return {
    ...transitData,
    routeOptions,
    primaryRoute: primaryKey
      ? routeOptions[primaryKey]
      : adjustOption(transitData.primaryRoute),
    reason: `${transitData.reason} Stopover distance, time, and fare are included in the totals.`,
  };
}

export default function MainApp({ user, onLogout }) {
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [stopoverText, setStopoverText] = useState("");
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [stopover, setStopover] = useState(null);

  const [calendarMonth, setCalendarMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [selectedCommuteDays, setSelectedCommuteDays] = useState([1, 2, 3, 4, 5]);
  const [tripsPerDay, setTripsPerDay] = useState(1);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [selectedMoves, setSelectedMoves] = useState([]);

  const [routeInfo, setRouteInfo] = useState(null);
  const [route, setRoute] = useState(null);
  const [savings, setSavings] = useState(null);
  const [currentStress, setCurrentStress] = useState(null);
  const [betterStress, setBetterStress] = useState(null);
  const [transit, setTransit] = useState(null);
  const [selectedRouteTab, setSelectedRouteTab] = useState("budget");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(getHistory());
  const [activeView, setActiveView] = useState(getStoredActiveView);
  const [selectedDestinationCard, setSelectedDestinationCard] = useState(DESTINATIONS[0]);
  const [favoriteDestinations, setFavoriteDestinations] = useState([]);
  const [currentNow, setCurrentNow] = useState(() => new Date());
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [fareDiscountType, setFareDiscountType] = useState(getStoredFareDiscountType);

  const budgetPeriod = "daily";
  const fareDiscountRate = getFareDiscountRate(fareDiscountType);

  const heatIndex = getHeatIndexC(WEATHER.temperatureC, WEATHER.humidity);
  const effectiveTripCount = 1;
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

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(ACTIVE_VIEW_KEY, activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem(FARE_DISCOUNT_KEY, fareDiscountType);
  }, [fareDiscountType]);

  const profileName = user?.name?.trim() || "Juan Dela Cruz";
  const profileEmail = user?.email?.trim() || "Traveler";
  const visibleDestinations = DESTINATIONS.slice(0, 6);

  const handleBudgetChange = (value) => {
    if (value === "") {
      setBudgetAmount("");
      return;
    }

    const amount = Number(value);
    setBudgetAmount(Number.isFinite(amount) ? String(Math.max(0, amount)) : "");
  };

  const handleUseAgain = (item) => {
    setOriginText(item.from || "");
    setDestinationText(item.to || "");
    setStopoverText(item.stopoverText || "");
    setOrigin(item.origin || null);
    setDestination(item.destination || null);
    setStopover(item.stopover || null);
    setFareDiscountType(item.fareDiscountType || "regular");

    setBudgetAmount(item.budgetAmount ? String(Math.max(0, Number(item.budgetAmount) || 0)) : "");
    setSelectedMoves(item.selectedMoves || []);
    setCalendarMonth(item.calendarMonth || new Date().toISOString().slice(0, 7));
    setSelectedCommuteDays(
      item.selectedCommuteDays?.length ? item.selectedCommuteDays : [1, 2, 3, 4, 5]
    );
    setTripsPerDay(1);

    setRoute(null);
    setRouteInfo(null);
    setSavings(null);
    setCurrentStress(null);
    setBetterStress(null);
    setTransit(null);
    setSelectedRouteTab("budget");

    setActiveView("planner");
  };

  const handleChooseDestination = (item) => {
    setSelectedDestinationCard(item);
    setDestinationText(item.name);
    setDestination({
      id: item.name.toLowerCase().replaceAll(" ", "-"),
      name: item.name,
      lat: item.lat,
      lon: item.lon,
    });
  };

  const handleFavoriteDestination = (item) => {
    setFavoriteDestinations((current) => {
      if (current.some((destination) => destination.name === item.name)) {
        return current.filter((destination) => destination.name !== item.name);
      }
      return [...current, item];
    });
  };

  const generateRoute = async () => {
    if (!origin || !destination || !budgetAmount) {
      alert("Please complete your savings form first.");
      return;
    }

    if (stopoverText.trim() && !stopover) {
      alert("Please select a stopover from the suggestions, or clear the stopover field.");
      return;
    }

    try {
      setLoading(true);

      const data = await getRoute(origin, destination, stopover);
      setRoute(data.coordinates);
      setRouteInfo(data);

      const computedSavings = calculateSavings({
        distanceKm: Number(data.distanceKm),
        durationMinutes: Number(data.durationMin),
        budgetPeriod,
        budgetAmount,
        tripCount: effectiveTripCount,
        selectedMoves,
        tripsPerDay: 1,
        commuteDayCount: 1,
        fareDiscountRate,
      });

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

      const transitData = applyStopoverMetrics(getTransitRecommendation(
        originText,
        destinationText,
        selectedMoves,
        origin,
        destination,
        1,
        fareDiscountRate,
        stopoverText
      ), data, computedSavings.betterCost);

      const recommendedCost = transitData.primaryRoute?.estimatedCostPerDay;
      const displaySavings = Number.isFinite(recommendedCost)
        ? {
            ...computedSavings,
            betterCost: recommendedCost,
            projectedSpend: recommendedCost,
            budgetLeft: Math.round(Math.max(0, (Number(budgetAmount) || 0) - recommendedCost) * 100) / 100,
          }
        : computedSavings;

      setSavings(displaySavings);
      setTransit(transitData);
      setSelectedRouteTab(transitData.availableTabs?.[0] || "budget");
      setActiveView("results");

      const historyItem = {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        from: originText,
        to: destinationText,
        stopoverText,
        origin,
        destination,
        stopover,
        budgetPeriod,
        budgetAmount: Number(budgetAmount),
        tripCount: effectiveTripCount,
        commuteTrips: effectiveTripCount,
        calendarMonth,
        selectedCommuteDays,
        tripsPerDay: 1,
        selectedMoves,
        fareDiscountType,
        estimatedSpent: displaySavings.projectedSpend,
        actualSpent: displaySavings.betterCost,
        perTripSaved: displaySavings.perTrip,
        dailySaved: displaySavings.perDay,
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

  const viewTitle =
    activeView === "history"
      ? "Trip History"
      : activeView === "results"
      ? "Map & Route Details"
      : activeView === "travelPlan"
      ? "My Cebu Itinerary"
      : activeView === "tripPlanner"
      ? "Trip Planner"
      : activeView === "destinations"
      ? "Cebu Destinations"
      : activeView === "settings"
      ? "Profile"
      : ["favorites", "guide"].includes(activeView)
      ? NAV_ITEMS.find((item) => item.id === activeView)?.label
      : `Hello, ${user?.name?.split(" ")[0] || "Juan"}!`;

  const renderLegend = () => (
    <div className="legend-box light">
      <div className="legend-row">
        <span className="legend-line blue" />
        <span>Jeepney Route</span>
      </div>
      <div className="legend-row">
        <span className="legend-line green" />
        <span>Bus Route</span>
      </div>
      <div className="legend-row">
        <span className="legend-line dashed-purple" />
        <span>Alternative Route</span>
      </div>
      <div className="legend-row">
        <span className="legend-marker legend-origin">O</span>
        <span>Origin</span>
      </div>
      <div className="legend-row">
        <span className="legend-marker legend-stopover">S</span>
        <span>Stopover</span>
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
        <span className="legend-marker legend-waiting">W</span>
        <span>Waiting Shed</span>
      </div>
      <div className="legend-row">
        <span className="legend-marker legend-landmark">L</span>
        <span>Landmark</span>
      </div>
    </div>
  );

  const renderDestinations = ({ expanded = false } = {}) => (
    <div className={`card panel-card destinations-card ${expanded ? "expanded" : ""}`}>
      <div className="panel-head compact-head">
        <div>
          <div className="panel-kicker">Travel Destinations</div>
          <h2 className="section-title destination-title">
            Explore places across Cebu
            <img src="/assets/icons/destinations.svg" alt="" />
          </h2>
        </div>
        {expanded ? (
          <button
            className="ghost-btn compact"
            type="button"
            onClick={() => setActiveView("planner")}
          >
            Back
          </button>
        ) : null}
      </div>

      <div className="destination-grid">
        {(expanded ? DESTINATIONS : visibleDestinations).map((item) => (
          <button
            type="button"
            className={`destination-tile ${item.tone} ${
              selectedDestinationCard?.name === item.name ? "selected" : ""
            }`}
            key={item.name}
            onClick={() => handleChooseDestination(item)}
          >
            <img
              className="destination-photo"
              src={`/assets/icons/destinations/pictures/${item.slug}.png`}
              alt=""
            />
            <img
              className="destination-icon"
              src={`/assets/icons/destinations/icons/${item.slug}.svg`}
              alt=""
            />
            <span>{item.name}</span>
            <small>{item.type}</small>
          </button>
        ))}
      </div>

      {expanded ? (
        <div className="destination-detail">
          <div>
            <span className="panel-kicker">Selected Destination</span>
            <h3>{selectedDestinationCard.name}</h3>
            <p>{selectedDestinationCard.notes}</p>
          </div>
          <div className="destination-actions">
            <button
              className="button-primary"
              type="button"
              onClick={() => {
                handleChooseDestination(selectedDestinationCard);
                setActiveView("tripPlanner");
              }}
            >
              Use as Destination
            </button>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => handleFavoriteDestination(selectedDestinationCard)}
            >
              {favoriteDestinations.some(
                (item) => item.name === selectedDestinationCard.name
              )
                ? "Remove Favorite"
                : "Save Favorite"}
            </button>
          </div>
        </div>
      ) : (
        <button
          className="view-more-btn"
          type="button"
          onClick={() => setActiveView("destinations")}
        >
          View more destinations
        </button>
      )}
    </div>
  );

  const renderSidebarView = () => {
    if (activeView === "favorites") {
      return (
        <section className="card panel-card itinerary-card">
          <div className="panel-kicker">Favorites</div>
          <h2 className="section-title">Saved Cebu destinations</h2>
          {favoriteDestinations.length ? (
            <div className="destination-list">
              {favoriteDestinations.map((item) => (
                <button
                  className="destination-list-item"
                  type="button"
                  key={item.name}
                  onClick={() => {
                    handleChooseDestination(item);
                    setActiveView("tripPlanner");
                  }}
                >
                  <strong>{item.name}</strong>
                  <span>{item.type}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">
              Click a Cebu destination, then save it as a favorite from the destinations page.
            </p>
          )}
        </section>
      );
    }

    if (activeView === "guide") {
      return (
        <section className="card panel-card itinerary-card">
          <div className="panel-kicker">Travel Guide</div>
          <h2 className="section-title">First-time Cebu travel guide</h2>
          <div className="guide-grid">
            {[
              ["Start with terminals", "Use South Bus Terminal for south Cebu and North Bus Terminal for northbound trips."],
              ["Check transfers", "Compare direct, fastest, and budget-friendly options before leaving."],
              ["Keep fare buffer", "Leave extra budget for short taxi, tricycle, or habal-habal connections."],
              ["Save reusable trips", "Open Trip History to reuse routes you already planned."],
            ].map(([title, body]) => (
              <div className="guide-card" key={title}>
                <strong>{title}</strong>
                <span>{body}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeView === "settings") {
      return (
        <section className="card panel-card itinerary-card settings-card">
          <div className="panel-kicker">Settings</div>
          <h2 className="section-title">Profile and travel preferences</h2>
          <div className="settings-profile">
            <div className="avatar large"><UserIcon /></div>
            <div>
              <strong>{profileName}</strong>
              <span>{profileEmail}</span>
            </div>
          </div>
          <div className="settings-list">
            <label>
              <input type="checkbox" defaultChecked /> Prefer budget-friendly rides
            </label>
            <label>
              <input type="checkbox" defaultChecked /> Show terminals and landmarks
            </label>
            <label>
              <input type="checkbox" /> Prioritize fastest route
            </label>
          </div>
          <div className="settings-fare">
            <label className="field-label">Fare category</label>
            <select
              className="input"
              value={fareDiscountType}
              onChange={(e) => setFareDiscountType(e.target.value)}
            >
              {FARE_DISCOUNT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="input-help">
              Applies the 20% concession to jeepney and bus fares when available.
            </small>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="BiyaHero" className="sidebar-logo" />
          <div>
            <strong>BiyaHero</strong>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              onClick={() => setActiveView(item.id)}
            >
              <span>
                <img src={item.icon} alt="" />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="sidebar-card user-card"
          type="button"
          onClick={() => setActiveView("settings")}
        >
          <div className="avatar"><UserIcon /></div>
          <div>
            <strong>{profileName}</strong>
          </div>
        </button>

        <div className="sidebar-footer">
          <button className="ghost-btn full-width inverse" onClick={onLogout} type="button">
            Log out
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="top-header">
          <div>
            <h1 className="header-title">{viewTitle}</h1>
            <p className="header-subtitle">
              Plan your trip, track your budget, and explore all of Cebu.
            </p>
            <div className="mobile-header-meta">
              <span>{heatIndex}C heat index</span>
              <span>{formatHeaderDate(currentNow)}</span>
              <span>{formatHeaderTime(currentNow)}</span>
              <span>Cebu City</span>
            </div>
          </div>

          <div className="header-weather">
            <span className="weather-sun">
              <img src="/assets/icons/weather-sun.svg" alt="" />
            </span>
            <div>
              <strong>{heatIndex}C heat index</strong>
              <small>{formatHeaderDate(currentNow)} · {formatHeaderTime(currentNow)}</small>
              <small>Cebu City</small>
            </div>
          </div>
          <button className="notification-btn" type="button" aria-label="Notifications">
            <BellIcon />
          </button>
        </header>

        <SavingsDashboard
          history={history}
          savings={savings}
          budgetAmount={budgetAmount}
          tripCount={effectiveTripCount}
          totalMoneySaved={totalMoneySaved}
          tripsThisMonth={tripsThisMonth}
          daysWithTrips={daysWithTrips}
        />

        {activeView === "planner" || activeView === "tripPlanner" ? (
          <section className="dashboard-grid">
            <div className="card panel-card setup-card">
              <div className="panel-kicker">Commute Setup</div>
              <h2 className="section-title">Find the best Cebu route</h2>

              <label className="field-label">Origin</label>
              <LocationAutocompleteInput
                value={originText}
                setValue={setOriginText}
                onSelect={setOrigin}
                placeholder="Mactan-Cebu International Airport"
              />

              <label className="field-label">Destination</label>
              <LocationAutocompleteInput
                value={destinationText}
                setValue={setDestinationText}
                onSelect={setDestination}
                placeholder="Oslob, Cebu"
              />

              <label className="field-label">Stop Over (Optional)</label>
              <LocationAutocompleteInput
                value={stopoverText}
                setValue={setStopoverText}
                onSelect={setStopover}
                onValueChange={() => setStopover(null)}
                placeholder="South Bus Terminal, SM City Cebu"
              />
              <small className="input-help">
                Add one place to pause, eat, or change rides along the way.
              </small>

              <div>
                <label className="field-label">Daily Budget</label>
                <input
                  className="input budget-input"
                  type="number"
                  placeholder="PHP 600.00"
                  value={budgetAmount}
                  min="0"
                  onChange={(e) => handleBudgetChange(e.target.value)}
                />
                <small className="input-help">Your spending limit for today</small>
              </div>

              <button
                className="button-primary full-width setup-submit"
                onClick={generateRoute}
                disabled={loading}
                type="button"
              >
                {loading ? "Finding route..." : "Find Best Route"}
              </button>
            </div>

            {renderDestinations()}

            <div className="card panel-card legend-card">
              <div className="panel-kicker">Map Legend</div>
              <h2 className="section-title">Route symbols</h2>
              {renderLegend()}
            </div>

            <TransitPanel
              transit={transit}
              selectedRouteTab={selectedRouteTab}
              onSelectRouteTab={setSelectedRouteTab}
              originText={originText}
              destinationText={destinationText}
              stopoverText={stopoverText}
              fareDiscountType={fareDiscountType}
              budgetAmount={budgetAmount}
              tripCount={effectiveTripCount}
              selectedMoves={selectedMoves}
            />
          </section>
        ) : activeView === "destinations" ? (
          <section className="destinations-page">
            {renderDestinations({ expanded: true })}
          </section>
        ) : activeView === "results" ? (
          <section className="planner-grid">
            <div className="left-column">
              <RouteSummaryCard
                routeInfo={routeInfo}
                savings={savings}
                currentStress={currentStress}
              betterStress={betterStress}
              transit={transit}
              selectedRouteTab={selectedRouteTab}
              stopoverText={stopoverText}
              fareDiscountType={fareDiscountType}
            />
              <MapView
                origin={origin}
                destination={destination}
                stopover={routeInfo?.stopover}
                route={route}
                terminals={transit?.routeOptions?.[selectedRouteTab]?.terminals || []}
                landmarks={transit?.routeOptions?.[selectedRouteTab]?.landmarks || landmarks}
                pujRoutePolylines={transit?.routeOptions?.[selectedRouteTab]?.pujRoutePolylines || []}
              />
            </div>

            <div className="right-column">
              <TransitPanel
              transit={transit}
              selectedRouteTab={selectedRouteTab}
              onSelectRouteTab={setSelectedRouteTab}
              originText={originText}
              destinationText={destinationText}
              stopoverText={stopoverText}
              fareDiscountType={fareDiscountType}
              budgetAmount={budgetAmount}
              tripCount={effectiveTripCount}
              selectedMoves={selectedMoves}
              />
            </div>
          </section>
        ) : (
          <>
            {activeView === "travelPlan" ? (
              <section className="card panel-card itinerary-card">
                <div className="panel-kicker">Travel Plan</div>
                <h2 className="section-title">My Cebu day-by-day plan</h2>
                <div className="itinerary-list">
                  {[
                    "Set origin, destination, and daily budget.",
                    "Generate the best route and compare recommended rides.",
                    "Review map markers, terminals, route paths, and notes.",
                    "Save the trip so you can reuse or compare it later.",
                  ].map((item, index) => (
                    <div className="itinerary-step" key={item}>
                      <span>{index + 1}</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : activeView === "history" ? (
              <TripHistoryPage
                history={history}
                onBack={() => setActiveView("planner")}
                onClear={() => {
                  clearHistory();
                  setHistory([]);
                }}
                onUseAgain={handleUseAgain}
              />
            ) : activeView === "favorites" ||
              activeView === "guide" ||
              activeView === "settings" ? (
              renderSidebarView()
            ) : null}
          </>
        )}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {MOBILE_NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeView === item.id ? "active" : ""}
            onClick={() => setActiveView(item.id)}
          >
            <span>
              <img src={item.icon} alt="" />
            </span>
            {item.label.replace("Map & Routes", "Map")}
          </button>
        ))}
        <button
          type="button"
          className={showMobileMore ? "active" : ""}
          onClick={() => setShowMobileMore((current) => !current)}
        >
          <span>
            <MenuIcon />
          </span>
          More
        </button>
      </nav>

      {showMobileMore ? (
        <MobileMoreMenu
          activeView={activeView}
          items={MOBILE_MORE_ITEMS}
          onClose={() => setShowMobileMore(false)}
          onLogout={onLogout}
          onSelectView={setActiveView}
          profileName={profileName}
        />
      ) : null}
    </div>
  );
}
