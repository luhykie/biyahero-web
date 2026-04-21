import landmarks from "../data/landmarks.json";
import terminals from "../data/terminals.json";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function buildLocalSuggestions(query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const landmarkSuggestions = landmarks
    .filter((item) => normalize(item.name).includes(normalizedQuery))
    .map((item) => ({
      id: `landmark-${item.id}`,
      name: `${item.name}, Cebu`,
      lat: Number(item.lat),
      lon: Number(item.lon),
    }));

  const terminalSuggestions = terminals
    .filter(
      (item) =>
        normalize(item.name).includes(normalizedQuery) ||
        normalize(item.area).includes(normalizedQuery)
    )
    .map((item) => ({
      id: `terminal-${item.id}`,
      name: `${item.name}, Cebu`,
      lat: Number(item.lat),
      lon: Number(item.lon),
    }));

  return [...landmarkSuggestions, ...terminalSuggestions];
}

export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];
  const localSuggestions = buildLocalSuggestions(query).slice(0, 5);

  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(query + ", Cebu, Philippines")}` +
    `&format=jsonv2&limit=8&addressdetails=1&countrycodes=ph` +
    `&viewbox=123.78,10.44,124.08,10.16&bounded=1`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!res.ok) return localSuggestions;

    const data = await res.json();
    const remoteSuggestions = data.map((item) => ({
      id: `osm-${item.place_id}`,
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));

    const merged = [...localSuggestions, ...remoteSuggestions];
    const seenNames = new Set();

    return merged.filter((item) => {
      const key = normalize(item.name);
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    }).slice(0, 8);
  } catch {
    return localSuggestions;
  }
}