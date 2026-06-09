const BASE_FARE = 14;
const BASE_DISTANCE_KM = 4;
const SUCCEEDING_PER_KM = 2;
const DISCOUNT_RATE = 0.2;

function round2(value) {
  return Math.round(value * 100) / 100;
}

export function computePujFare(distanceKm) {
  const distance = Number(distanceKm) || 0;

  if (distance <= BASE_DISTANCE_KM) {
    return BASE_FARE;
  }

  const succeedingDistance = distance - BASE_DISTANCE_KM;
  return round2(BASE_FARE + succeedingDistance * SUCCEEDING_PER_KM);
}

export function calculateSavings({
  distanceKm,
  durationMinutes,
  budgetAmount,
  tripCount,
  tripsPerDay = 1,
  commuteDayCount = 1,
  selectedMoves,
}) {
  const totalTripsForMonth = Number(tripCount) || 1;
  const dailyBudget = Math.max(0, Number(budgetAmount) || 0);
  const commuteDays = Number(commuteDayCount) || 1;
  const ridesPerDay = Number(tripsPerDay) || 1;

  const regularPujFare = computePujFare(distanceKm);

  let betterFarePerRide = regularPujFare;
  let currentCostPerRide = Math.max(regularPujFare + 35, Math.round(distanceKm * 10 + 15));

  let currentTime = Math.max(10, Math.round(durationMinutes + 12));
  let betterTime = Math.max(5, Math.round(durationMinutes));

  if (selectedMoves.includes("walk")) betterFarePerRide -= 3;
  if (selectedMoves.includes("avoid_hailing")) currentCostPerRide += 10;
  if (selectedMoves.includes("avoid_tricycle")) currentCostPerRide += 5;
  if (selectedMoves.includes("brt")) betterTime -= 5;
  if (selectedMoves.includes("avoid_peak")) betterTime -= 3;

  if (selectedMoves.includes("fare_discount")) {
    betterFarePerRide = betterFarePerRide * (1 - DISCOUNT_RATE);
  }

  betterFarePerRide = Math.max(8, round2(betterFarePerRide));
  currentCostPerRide = Math.max(betterFarePerRide, round2(currentCostPerRide));
  betterTime = Math.max(5, betterTime);

  const currentCostPerDay = round2(currentCostPerRide * ridesPerDay);
  const betterCostPerDay = round2(betterFarePerRide * ridesPerDay);

  const projectedSpend = round2(betterFarePerRide * totalTripsForMonth);
  const budgetTarget = round2(dailyBudget * commuteDays);
  const budgetLeft = round2(Math.max(0, budgetTarget - projectedSpend));

  const perTrip = round2(Math.max(0, currentCostPerRide - betterFarePerRide));
  const perDay = round2(Math.max(0, currentCostPerDay - betterCostPerDay));
  const perMonth = round2(perDay * commuteDays);
  const timeSaved = Math.max(0, currentTime - betterTime);

  return {
    currentCost: currentCostPerRide,
    betterCost: betterFarePerRide,
    currentCostPerDay,
    betterCostPerDay,
    currentTime,
    betterTime,
    perTrip,
    perDay,
    perMonth,
    timeSaved,
    projectedSpend,
    budget: budgetTarget,
    dailyBudget,
    commuteDays,
    budgetLeft,
    fareBreakdown: {
      baseFare: BASE_FARE,
      baseDistanceKm: BASE_DISTANCE_KM,
      succeedingPerKm: SUCCEEDING_PER_KM,
      regularFarePerRide: regularPujFare,
      discountedFarePerRide: betterFarePerRide,
      ridesPerDay,
      hasDiscount: selectedMoves.includes("fare_discount"),
      discountRate: selectedMoves.includes("fare_discount") ? DISCOUNT_RATE : 0,
    },
  };
}
