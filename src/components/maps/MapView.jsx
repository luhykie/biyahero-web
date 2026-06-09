import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

const originIcon = L.divIcon({
  className: "map-pin map-pin-origin",
  html: '<span>O</span>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const destinationIcon = L.divIcon({
  className: "map-pin map-pin-destination",
  html: '<span>D</span>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const terminalIcon = L.divIcon({
  className: "map-pin map-pin-terminal",
  html: '<span>T</span>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
});

const landmarkIcon = L.divIcon({
  className: "map-pin map-pin-landmark",
  html: '<span>L</span>',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20],
});

function MapBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    const validPoints = points.filter(
      ([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon)
    );

    if (validPoints.length < 2) return;

    map.fitBounds(validPoints, { padding: [28, 28] });
  }, [map, points]);

  return null;
}

export default function MapView({
  origin,
  destination,
  route,
  terminals = [],
  landmarks = [],
  pujRoutePolylines = [],
}) {
  const center = origin ? [origin.lat, origin.lon] : [10.3157, 123.8854];
  const mapPoints = [
    ...(origin ? [[origin.lat, origin.lon]] : []),
    ...(destination ? [[destination.lat, destination.lon]] : []),
    ...(route || []),
    ...pujRoutePolylines.flatMap((line) => line.positions || []),
    ...terminals.map((terminal) => [terminal.lat, terminal.lon]),
    ...landmarks.map((landmark) => [landmark.lat, landmark.lon]),
  ];

  return (
    <div className="card glossy-card" style={{ marginTop: 18, padding: 10 }}>
      <h3 className="section-title">Route Map</h3>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "360px", borderRadius: "14px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds points={mapPoints} />

        {origin && (
          <Marker position={[origin.lat, origin.lon]} icon={originIcon}>
            <Popup>Origin</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lon]} icon={destinationIcon}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {route && <Polyline positions={route} color="#1c46c7" weight={5} />}

        {pujRoutePolylines.map((line, index) => (
          <Polyline
            key={`puj-line-${index}`}
            positions={line.positions}
            color={line.color || "#16a34a"}
            weight={line.weight || 4}
            opacity={line.opacity || 0.85}
            dashArray={line.dashArray || undefined}
          />
        ))}

        {terminals.map((terminal) => (
          <Marker key={terminal.id} position={[terminal.lat, terminal.lon]} icon={terminalIcon}>
            <Popup>
              <strong>{terminal.name}</strong>
              <br />
              {terminal.type}
            </Popup>
          </Marker>
        ))}

        {landmarks
          .filter((landmark) => Number.isFinite(landmark.lat) && Number.isFinite(landmark.lon))
          .map((landmark) => (
            <Marker key={landmark.id} position={[landmark.lat, landmark.lon]} icon={landmarkIcon}>
              <Popup>
                <strong>{landmark.name}</strong>
                <br />
                Cebu Landmark
              </Popup>
            </Marker>
          ))}

        <div className="map-legend-overlay">
          <strong>Map Legend</strong>
          <span><i className="legend-line blue" /> Jeepney Route</span>
          <span><i className="legend-line green" /> Bus Route</span>
          <span><i className="legend-line dashed-purple" /> Transfer / Alternate</span>
          <span><i className="legend-marker legend-origin">O</i> Origin</span>
          <span><i className="legend-marker legend-destination">D</i> Destination</span>
          <span><i className="legend-marker legend-terminal">T</i> Terminal</span>
          <span><i className="legend-marker legend-waiting">W</i> Waiting Shed</span>
          <span><i className="legend-marker legend-landmark">L</i> Landmark / Stop</span>
        </div>
      </MapContainer>
    </div>
  );
}
