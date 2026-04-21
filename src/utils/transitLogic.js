import terminals from "../data/terminals.json";
import transitRoutes from "../data/transitRoutes.json";
import landmarks from "../data/landmarks.json";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function includesArea(text, area) {
  return normalize(text).includes(normalize(area));
}

function getLandmarkByName(name) {
  return landmarks.find((landmark) => normalize(landmark.name) === normalize(name));
}

function computeRouteScore(route, combinedText, originText, destinationText) {
  const stops = route.path || [];
  let score = 0;

  if (stops.some((stop) => includesArea(combinedText, stop))) score += 1;
  if (stops.some((stop) => includesArea(originText, stop))) score += 2;
  if (stops.some((stop) => includesArea(destinationText, stop))) score += 2;
  return score;
}

export function getTransitRecommendation(originText, destinationText, selectedMoves) {
  const combined = `${originText} ${destinationText}`;
  const recommendation = "PUJ";

  const scoredRoutes = transitRoutes
    .filter((route) => route.type === "PUJ")
    .map((route) => ({
      ...route,
      id: route.code,
      landmarks: (route.path || [])
        .map((stop) => {
          const knownLandmark = getLandmarkByName(stop);
          return knownLandmark
            ? knownLandmark
            : {
                id: normalize(stop).replace(/\s+/g, "-"),
                name: stop,
                lat: null,
                lon: null,
              };
        })
        .filter(Boolean),
      score: computeRouteScore(route, combined, originText, destinationText),
    }))
    .sort((a, b) => b.score - a.score);

  const prioritizedRoutes = scoredRoutes.filter((route) => route.score > 0);
  const matchingRoutes = (prioritizedRoutes.length > 0 ? prioritizedRoutes : scoredRoutes).slice(0, 12);
  const primaryRoute = matchingRoutes[0];

  const routeAreas = new Set(matchingRoutes.flatMap((route) => route.path || []));
  const matchingTerminals = terminals.filter(
    (terminal) =>
      terminal.type === recommendation &&
      ([...routeAreas].some((area) => includesArea(terminal.area, area)) ||
        [...routeAreas].some((area) => includesArea(terminal.name, area)))
  );

  const pujRoutePolylines = matchingRoutes
    .map((route) =>
      route.landmarks
        .filter((landmark) => Number.isFinite(landmark.lat) && Number.isFinite(landmark.lon))
        .map((landmark) => [landmark.lat, landmark.lon])
    )
    .filter((coordinates) => coordinates.length > 1);

  const visibleLandmarks = (primaryRoute?.landmarks || []).filter(
    (landmark) => Number.isFinite(landmark.lat) && Number.isFinite(landmark.lon)
  );

  const lessCrowdedPreferred = selectedMoves.includes("less_crowded");
  const reason = lessCrowdedPreferred
    ? "Showing PUJ routes that match your trip while prioritizing clearer landmark-based paths."
    : "Showing PUJ routes with popular Cebu landmarks along your origin and destination.";

  return {
    recommendation,
    reason,
    routes: matchingRoutes,
    terminals: matchingTerminals,
    landmarks: visibleLandmarks,
    pujRoutePolylines,
  };
}