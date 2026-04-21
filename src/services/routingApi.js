export async function getRoute(origin, destination) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origin.lon},${origin.lat};${destination.lon},${destination.lat}` +
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
  };
}