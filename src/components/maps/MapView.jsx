import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
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

export default function MapView({
  origin,
  destination,
  route,
  terminals = [],
  landmarks = [],
  pujRoutePolylines = [],
}) {
  const center = origin ? [origin.lat, origin.lon] : [10.3157, 123.8854];

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
            positions={line}
            color="#00a86b"
            weight={3}
            opacity={0.65}
            dashArray="8, 8"
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
      </MapContainer>
    </div>
  );
}