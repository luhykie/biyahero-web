const DISCOUNT_AMOUNT = 5;

export function calculateSavings({
  distanceKm,
  durationMinutes,
  budgetPeriod,
  budgetAmount,
  tripCount,
  selectedMoves,
}) {
  const trips = Number(tripCount) || 1;
  const budget = Number(budgetAmount) || 0;

  let currentCost = Math.max(25, Math.round(distanceKm * 10 + 15));
  let betterCost = Math.max(15, Math.round(distanceKm * 8 + 10));

  let currentTime = Math.max(10, Math.round(durationMinutes + 12));
  let betterTime = Math.max(5, Math.round(durationMinutes));

  if (selectedMoves.includes("walk")) betterCost -= 5;
  if (selectedMoves.includes("avoid_hailing")) betterCost -= 15;
  if (selectedMoves.includes("avoid_tricycle")) betterCost -= 10;
  if (selectedMoves.includes("combine")) betterCost -= 5;
  if (selectedMoves.includes("brt")) betterTime -= 5;
  if (selectedMoves.includes("direct")) betterTime -= 4;
  if (selectedMoves.includes("avoid_peak")) betterTime -= 3;

  const hasDiscount =
    selectedMoves.includes("student_discount") ||
    selectedMoves.includes("pwd_discount") ||
    selectedMoves.includes("senior_discount");

  if (hasDiscount) {
    betterCost -= DISCOUNT_AMOUNT;
  }

  betterCost = Math.max(10, betterCost);
  betterTime = Math.max(5, betterTime);

  const perTrip = Math.max(0, currentCost - betterCost);
  const timeSaved = Math.max(0, currentTime - betterTime);

  let projectedSpend = betterCost * trips;
  if (budgetPeriod === "monthly") {
    projectedSpend = betterCost * trips;
  }
  if (budgetPeriod === "weekly") {
    projectedSpend = betterCost * trips;
  }
  if (budgetPeriod === "daily") {
    projectedSpend = betterCost * trips;
  }

  return {
    currentCost,
    betterCost,
    currentTime,
    betterTime,
    perTrip,
    perDay: perTrip * trips,
    perMonth: perTrip * trips * 4,
    timeSaved,
    projectedSpend,
    budget,
  };
}