import terminals from "../data/terminals.json";
import transitRoutes from "../data/transitRoutes.json";

function includesArea(text, area) {
  return text.toLowerCase().includes(area.toLowerCase());
}

export function getTransitRecommendation(originText, destinationText, selectedMoves) {
  const combined = `${originText} ${destinationText}`;

  let recommendation = "PUJ";
  let reason = "Most budget-friendly option.";

  if (selectedMoves.includes("less_crowded")) {
    recommendation = "CeBus";
    reason = "Less crowded option for smoother trips.";
  } else if (
    includesArea(combined, "SM City Cebu") ||
    includesArea(combined, "Ayala Center Cebu") ||
    includesArea(combined, "Airport")
  ) {
    recommendation = "MyBus";
    reason = "Best for major hubs and mall connector routes.";
  }

  const matchingRoutes = transitRoutes.filter(
    (route) =>
      route.type === recommendation &&
      route.areas.some((area) => includesArea(combined, area))
  );

  const matchingTerminals = terminals.filter(
    (terminal) =>
      terminal.type === recommendation &&
      (includesArea(combined, terminal.area) || includesArea(combined, terminal.name))
  );

  return {
    recommendation,
    reason,
    routes: matchingRoutes,
    terminals: matchingTerminals,
  };
}