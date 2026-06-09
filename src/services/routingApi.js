function isValidPoint(point) {
  return (
    point &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lon)
  );
}

export async function getRoute(origin, destination, stopover = null) {
  const points = [origin, stopover, destination].filter(isValidPoint);
  if (points.length < 2) {
    throw new Error("Origin and destination are required.");
  }

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    points.map((point) => `${point.lon},${point.lat}`).join(";") +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch route.");

  const data = await res.json();
  if (!data.routes?.length) throw new Error("No route found.");

  const route = data.routes[0];

  return {
    distanceKm: route.distance / 1000,
    durationMin: Math.round(route.duration / 60),
    coordinates: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    stopover: isValidPoint(stopover) ? stopover : null,
  };
}
