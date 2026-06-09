import terminals from "../data/terminals.json";
import transitRoutes from "../data/transitRoutes.json";
import landmarks from "../data/landmarks.json";
import { computePujFare } from "./calculations";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function includesArea(text, area) {
  return normalize(text).includes(normalize(area));
}

function getLandmarkByName(name) {
  return landmarks.find(
    (landmark) => normalize(landmark.name) === normalize(name)
  );
}

function buildLandmarks(route) {
  return (route.path || [])
    .map((stop) => {
      const known = getLandmarkByName(stop);
      return known
        ? known
        : {
            id: normalize(stop).replace(/\s+/g, "-"),
            name: stop,
            lat: null,
            lon: null,
          };
    })
    .filter(Boolean);
}

function hasStopMatch(text, stopName) {
  return includesArea(text, stopName);
}

function routeTouchesOrigin(route, originText) {
  return (route.path || []).some((stop) => hasStopMatch(originText, stop));
}

function routeTouchesDestination(route, destinationText) {
  return (route.path || []).some((stop) => hasStopMatch(destinationText, stop));
}

function routeTouchesStopover(route, stopoverText) {
  return stopoverText
    ? (route.path || []).some((stop) => hasStopMatch(stopoverText, stop))
    : false;
}

function scoreRouteMatch(route, originText, destinationText, stopoverText) {
  let score = 0;
  if (routeTouchesOrigin(route, originText)) score += 3;
  if (routeTouchesDestination(route, destinationText)) score += 3;
  if (routeTouchesStopover(route, stopoverText)) score += 2;
  return score;
}

function getOrderedSharedStops(routeA, routeB) {
  const stopsA = new Set((routeA.path || []).map(normalize));
  return (routeB.path || [])
    .filter((stop) => stopsA.has(normalize(stop)))
    .sort((a, b) => {
      const aIndex = (routeA.path || []).findIndex((s) => normalize(s) === normalize(a));
      const bIndex = (routeA.path || []).findIndex((s) => normalize(s) === normalize(b));
      return aIndex - bIndex;
    });
}

function getStopIndex(route, stopName) {
  return (route.path || []).findIndex(
    (stop) => normalize(stop) === normalize(stopName)
  );
}

function buildSegmentPolyline(
  route,
  startStopName,
  endStopName,
  origin,
  destination,
  isFirst,
  isLast
) {
  const routeLandmarks = buildLandmarks(route);
  const path = route.path || [];

  let startIndex = 0;
  let endIndex = path.length - 1;

  if (startStopName) {
    const idx = getStopIndex(route, startStopName);
    if (idx !== -1) startIndex = idx;
  }

  if (endStopName) {
    const idx = getStopIndex(route, endStopName);
    if (idx !== -1) endIndex = idx;
  }

  if (startIndex > endIndex) {
    [startIndex, endIndex] = [endIndex, startIndex];
  }

  const slicedPoints = routeLandmarks
    .slice(startIndex, endIndex + 1)
    .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lon))
    .map((l) => [l.lat, l.lon]);

  const fullLine = [];

  if (isFirst && origin && Number.isFinite(origin.lat) && Number.isFinite(origin.lon)) {
    fullLine.push([origin.lat, origin.lon]);
  }

  fullLine.push(...slicedPoints);

  if (isLast && destination && Number.isFinite(destination.lat) && Number.isFinite(destination.lon)) {
    fullLine.push([destination.lat, destination.lon]);
  }

  return fullLine;
}

function dedupeByKey(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildDirectOptions(routes, originText, destinationText) {
  return routes
    .filter(
      (route) =>
        routeTouchesOrigin(route, originText) &&
        routeTouchesDestination(route, destinationText)
    )
    .map((route) => ({
      type: "direct",
      id: `direct-${route.code}`,
      rides: [
        {
          route,
          boardAt:
            (route.path || []).find((stop) => hasStopMatch(originText, stop)) ||
            route.path?.[0] ||
            "",
          alightAt:
            [...(route.path || [])]
              .reverse()
              .find((stop) => hasStopMatch(destinationText, stop)) ||
            route.path?.[route.path.length - 1] ||
            "",
        },
      ],
    }));
}

function buildOneTransferOptions(routes, originText, destinationText) {
  const options = [];
  const originRoutes = routes.filter((route) =>
    routeTouchesOrigin(route, originText)
  );
  const destinationRoutes = routes.filter((route) =>
    routeTouchesDestination(route, destinationText)
  );

  for (const firstRoute of originRoutes) {
    for (const secondRoute of destinationRoutes) {
      if (firstRoute.code === secondRoute.code) continue;

      const sharedStops = getOrderedSharedStops(firstRoute, secondRoute);
      if (sharedStops.length === 0) continue;

      const transferStop = sharedStops[0];

      options.push({
        type: "one-transfer",
        id: `transfer1-${firstRoute.code}-${secondRoute.code}-${normalize(transferStop)}`,
        rides: [
          {
            route: firstRoute,
            boardAt:
              (firstRoute.path || []).find((stop) => hasStopMatch(originText, stop)) ||
              firstRoute.path?.[0] ||
              "",
            alightAt: transferStop,
          },
          {
            route: secondRoute,
            boardAt: transferStop,
            alightAt:
              [...(secondRoute.path || [])]
                .reverse()
                .find((stop) => hasStopMatch(destinationText, stop)) ||
              secondRoute.path?.[secondRoute.path.length - 1] ||
              "",
          },
        ],
      });
    }
  }

  return options;
}

function estimateOptionCost(option, selectedMoves, tripsPerDay = 1, fareDiscountRate = 0) {
  const rideCount = option.rides.length;
  const basePerRide = computePujFare(4) * rideCount;

  let perRide = basePerRide;

  if (selectedMoves.includes("fare_discount")) {
    perRide = perRide * 0.8;
  }

  if (selectedMoves.includes("walk")) {
    perRide -= 2;
  }

  if (fareDiscountRate > 0) {
    perRide = perRide * (1 - fareDiscountRate);
  }

  return Math.max(10, Math.round(perRide * tripsPerDay * 100) / 100);
}

function estimateOptionDuration(option) {
  const rideCount = option.rides.length;
  const stopCount = option.rides.reduce(
    (sum, ride) => sum + Math.max(0, (ride.route.path?.length || 1) - 1),
    0
  );

  return 8 + stopCount * 3 + (rideCount - 1) * 10;
}

function scoreOption(option, selectedMoves, tripsPerDay = 1) {
  const estimatedCostPerDay = estimateOptionCost(option, selectedMoves, tripsPerDay);
  const estimatedDuration = estimateOptionDuration(option);
  const rideCount = option.rides.length;

  let score = 100;
  score -= estimatedCostPerDay * 1.2;
  score -= estimatedDuration * 0.8;
  score -= (rideCount - 1) * 18;

  if (selectedMoves.includes("avoid_peak")) score += 4;
  if (selectedMoves.includes("walk")) score += 2;

  return score;
}

function buildRideGuide(option) {
  if (!option?.rides?.length) return [];

  const lines = [];
  option.rides.forEach((ride, index) => {
    const mode = ride.mode || ride.route.type || "Ride";
    const code = ride.route.code ? ` ${ride.route.code}` : "";
    lines.push(`Ride ${mode}${code} (${ride.route.name}) from ${ride.boardAt} to ${ride.alightAt}.`);
    if (index < option.rides.length - 1) {
      lines.push(`Transfer at ${ride.alightAt}.`);
    }
  });

  return lines;
}

function buildMainPolylinesForOption(option, origin, destination, color) {
  return option.rides
    .map((ride, index) => ({
      positions: buildSegmentPolyline(
        ride.route,
        ride.boardAt,
        ride.alightAt,
        origin,
        destination,
        index === 0,
        index === option.rides.length - 1
      ),
      color,
      dashArray: null,
      weight: 4,
      opacity: 0.95,
    }))
    .filter((line) => line.positions.length > 1);
}

function buildAlternativePolylines(options, activeId, origin, destination) {
  return options
    .filter((option) => option.id !== activeId)
    .flatMap((option) =>
      option.rides.map((ride, index) => ({
        positions: buildSegmentPolyline(
          ride.route,
          ride.boardAt,
          ride.alightAt,
          origin,
          destination,
          index === 0,
          index === option.rides.length - 1
        ),
        color: "#7c3aed",
        dashArray: "10, 8",
        weight: 3,
        opacity: 0.8,
      }))
    )
    .filter((line) => line.positions.length > 1);
}

function getOptionLandmarks(option) {
  return dedupeByKey(
    option.rides.flatMap((ride) => buildLandmarks(ride.route)),
    (item) => item.id
  ).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon));
}

function getOptionTerminals(option) {
  const routeAreas = new Set(
    option.rides.flatMap((ride) => ride.route.path || [])
  );

  return terminals.filter(
    (terminal) =>
      [...routeAreas].some((area) => includesArea(terminal.area, area)) ||
      [...routeAreas].some((area) => includesArea(terminal.name, area))
  );
}

function getTerminalByArea(area) {
  return terminals.find((terminal) => includesArea(terminal.area, area));
}

function getIntercityBusDestination(destinationText) {
  const destination = normalize(destinationText);

  if (destination.includes("oslob")) {
    return {
      id: "oslob-southbound-bus",
      name: "Oslob",
      terminalArea: "South Bus Terminal",
      terminalName: "South Bus Terminal Area",
      code: "Southbound Bus",
      routeName: "South Bus Terminal - Oslob",
      fare: 250,
      duration: 210,
      direction: "Bato via Oslob",
    };
  }

  if (destination.includes("moalboal")) {
    return {
      id: "moalboal-southbound-bus",
      name: "Moalboal",
      terminalArea: "South Bus Terminal",
      terminalName: "South Bus Terminal Area",
      code: "Southbound Bus",
      routeName: "South Bus Terminal - Moalboal",
      fare: 220,
      duration: 180,
      direction: "Bato via Barili",
    };
  }

  if (destination.includes("kawasan") || destination.includes("badian")) {
    return {
      id: "badian-southbound-bus",
      name: "Badian",
      terminalArea: "South Bus Terminal",
      terminalName: "South Bus Terminal Area",
      code: "Southbound Bus",
      routeName: "South Bus Terminal - Badian",
      fare: 230,
      duration: 190,
      direction: "Bato via Barili",
    };
  }

  if (destination.includes("simala") || destination.includes("sibonga")) {
    return {
      id: "simala-southbound-bus",
      name: "Simala Shrine",
      terminalArea: "South Bus Terminal",
      terminalName: "South Bus Terminal Area",
      code: "Southbound Bus",
      routeName: "South Bus Terminal - Sibonga/Simala",
      fare: 120,
      duration: 95,
      direction: "Sibonga",
    };
  }

  if (destination.includes("carcar")) {
    return {
      id: "carcar-southbound-bus",
      name: "Carcar",
      terminalArea: "South Bus Terminal",
      terminalName: "South Bus Terminal Area",
      code: "Southbound Bus",
      routeName: "South Bus Terminal - Carcar",
      fare: 100,
      duration: 80,
      direction: "Carcar",
    };
  }

  return null;
}

function buildIntercityBusOption(
  originText,
  destinationText,
  origin,
  destination,
  tripsPerDay,
  fareDiscountRate = 0
) {
  const busDestination = getIntercityBusDestination(destinationText);
  if (!busDestination) return null;

  const terminal = getTerminalByArea(busDestination.terminalArea);
  const connectorFare = 15;
  const connectorDuration = 15;

  const regularCostPerDay = (connectorFare + busDestination.fare) * tripsPerDay;
  const discountedCostPerDay = fareDiscountRate > 0
    ? regularCostPerDay * (1 - fareDiscountRate)
    : regularCostPerDay;

  return {
    type: "bus-transfer",
    id: busDestination.id,
    estimatedCostPerDay: Math.round(discountedCostPerDay * 100) / 100,
    regularFarePerDay: Math.round(regularCostPerDay * 100) / 100,
    discountedFareRate: fareDiscountRate,
    estimatedDuration: connectorDuration + busDestination.duration,
    score: 1,
    rides: [
      {
        mode: "Jeep/Walk",
        route: {
          code: "Connector",
          name: `Go to ${busDestination.terminalName}`,
          path: ["Origin", busDestination.terminalArea],
          type: "Jeep/Walk",
        },
        boardAt: originText || "Your origin",
        alightAt: busDestination.terminalName,
      },
      {
        mode: "Bus",
        route: {
          code: busDestination.code,
          name: `${busDestination.routeName} (${busDestination.direction})`,
          path: [busDestination.terminalArea, busDestination.name],
          type: "Bus",
        },
        boardAt: busDestination.terminalName,
        alightAt: destinationText || busDestination.name,
      },
    ],
    landmarks: [
      ...(terminal
        ? [{
            id: `terminal-${terminal.id}`,
            name: terminal.name,
            lat: terminal.lat,
            lon: terminal.lon,
          }]
        : []),
      ...(destination && Number.isFinite(destination.lat) && Number.isFinite(destination.lon)
        ? [{
            id: busDestination.id,
            name: destinationText || busDestination.name,
            lat: destination.lat,
            lon: destination.lon,
          }]
        : []),
    ],
    terminals: terminal ? [terminal] : [],
  };
}

function toDisplayRoute(option) {
  return {
    id: option.id,
    type: option.rides.length === 1 ? "Direct PUJ" : "1 Transfer",
    code: option.rides.map((ride) => ride.route.code).join(" → "),
    name: option.rides.map((ride) => ride.route.name).join(" → "),
    path: option.rides.flatMap((ride) => ride.route.path || []),
    landmarks: option.landmarks,
    estimatedCostPerDay: option.estimatedCostPerDay,
    estimatedDuration: option.estimatedDuration,
    rideCount: option.rides.length,
  };
}

export function getTransitRecommendation(
  originText,
  destinationText,
  selectedMoves,
  origin,
  destination,
  tripsPerDay = 1,
  fareDiscountRate = 0,
  stopoverText = ""
) {
  const preparedRoutes = transitRoutes
    .filter((route) => route.type === "PUJ")
    .map((route) => ({ ...route, id: route.code }));

  let allOptions = [
    ...buildDirectOptions(preparedRoutes, originText, destinationText),
    ...buildOneTransferOptions(preparedRoutes, originText, destinationText),
  ];

  allOptions = dedupeByKey(allOptions, (option) =>
    option.rides
      .map((ride) => `${ride.route.code}:${ride.boardAt}:${ride.alightAt}`)
      .join("|")
  );

  allOptions = allOptions
    .map((option) => {
      const estimatedCostPerDay = estimateOptionCost(
        option,
        selectedMoves,
        tripsPerDay,
        fareDiscountRate
      );
      const estimatedDuration = estimateOptionDuration(option);
      return {
        ...option,
        estimatedCostPerDay,
        estimatedDuration,
        score: scoreOption(option, selectedMoves, tripsPerDay),
        rideGuide: buildRideGuide(option),
        landmarks: getOptionLandmarks(option),
        terminals: getOptionTerminals(option),
      };
    })
    .sort((a, b) => b.score - a.score);

  if (allOptions.length === 0) {
    const busOption = buildIntercityBusOption(
      originText,
      destinationText,
      origin,
      destination,
      tripsPerDay,
      fareDiscountRate
    );

    if (busOption) {
      busOption.rideGuide = buildRideGuide(busOption);
      allOptions = [busOption];
    }
  }

  const jeepneyCandidates = dedupeByKey(
    preparedRoutes.filter(
      (route) =>
        routeTouchesOrigin(route, originText) ||
        routeTouchesDestination(route, destinationText) ||
        routeTouchesStopover(route, stopoverText)
    ),
    (route) => route.code
  )
    .sort((a, b) =>
      scoreRouteMatch(b, originText, destinationText, stopoverText) -
      scoreRouteMatch(a, originText, destinationText, stopoverText)
    )
    .slice(0, 6)
    .map((route) => ({
      code: route.code,
      name: route.name,
      path: route.path || [],
      fare: Math.round(computePujFare(4) * 100) / 100,
      discountedFare:
        fareDiscountRate > 0
          ? Math.round(computePujFare(4) * (1 - fareDiscountRate) * 100) / 100
          : Math.round(computePujFare(4) * 100) / 100,
    }));

  const busDestination = getIntercityBusDestination(destinationText);
  const busCandidates = busDestination
    ? [
        {
          code: busDestination.code,
          name: busDestination.routeName,
          fare:
            Math.round(
              (busDestination.fare + 15) * tripsPerDay * 100
            ) / 100,
          discountedFare:
            Math.round(
              (busDestination.fare + 15) * tripsPerDay * (1 - fareDiscountRate) * 100
            ) / 100,
          duration: busDestination.duration + 15,
          direction: busDestination.direction,
        },
      ]
    : [];

  const bestRoute = allOptions[0] || null;
  const cheapestRoute =
    [...allOptions].sort((a, b) => a.estimatedCostPerDay - b.estimatedCostPerDay)[0] || null;
  const fastestRoute =
    [...allOptions].sort((a, b) => a.estimatedDuration - b.estimatedDuration)[0] || null;
  const directRoute =
    allOptions.filter((option) => option.rides.length === 1)[0] || null;

  const orderedCandidates = [
    ["budget", bestRoute],
    ["cheapest", cheapestRoute],
    ["fastest", fastestRoute],
    ["direct", directRoute],
  ].filter(([, option]) => option);

  const uniqueTabs = [];
  const seenIds = new Set();

  for (const [tab, option] of orderedCandidates) {
    if (seenIds.has(option.id)) continue;
    seenIds.add(option.id);
    uniqueTabs.push([tab, option]);
  }

  const colorMap = {
    budget: "#16a34a",
    cheapest: "#22c55e",
    fastest: "#f59e0b",
    direct: "#2563eb",
  };

  const uniqueOptionsOnly = uniqueTabs.map(([, option]) => option);

  const routeOptions = Object.fromEntries(
    uniqueTabs.map(([key, option]) => [
      key,
      {
        ...option,
        pujRoutePolylines: [
          ...buildMainPolylinesForOption(option, origin, destination, colorMap[key]),
          ...buildAlternativePolylines(uniqueOptionsOnly, option.id, origin, destination),
        ],
      },
    ])
  );

  const availableTabs = uniqueTabs.map(([key]) => key);
  const primaryKey = availableTabs[0] || null;
  const primaryRoute = primaryKey ? routeOptions[primaryKey] : null;

  const routes = dedupeByKey(
    uniqueOptionsOnly.map(toDisplayRoute),
    (route) => route.id
  );

  return {
    recommendation: primaryRoute?.rides?.some((ride) => ride.mode === "Bus")
      ? "Jeep/Walk + Bus"
      : "PUJ",
    reason: primaryRoute
      ? "Showing where to ride and the recommended jeep/bus route for this trip."
      : "No jeep or bus route found for this trip.",
    routes,
    routeOptions,
    availableTabs,
    primaryRoute,
    possibleJeepneys: jeepneyCandidates,
    possibleBusRoutes: busCandidates,
    terminals: primaryRoute?.terminals || [],
    landmarks: primaryRoute?.landmarks || [],
    pujRoutePolylines: primaryRoute?.pujRoutePolylines || [],
    rideGuide: primaryRoute?.rideGuide || [],
  };
}
