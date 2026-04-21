export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];

  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(query + ", Cebu City, Cebu, Philippines")}` +
    `&format=jsonv2&limit=6&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) return [];

  const data = await res.json();

  return data.map((item) => ({
    id: String(item.place_id),
    name: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  }));
}