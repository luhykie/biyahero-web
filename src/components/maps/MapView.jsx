import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";

export default function MapView({ origin, destination, route, terminals = [] }) {
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
          <Marker position={[origin.lat, origin.lon]}>
            <Popup>Origin</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lon]}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {route && <Polyline positions={route} color="#1c46c7" weight={5} />}

        {terminals.map((terminal) => (
          <Marker key={terminal.id} position={[terminal.lat, terminal.lon]}>
            <Popup>
              <strong>{terminal.name}</strong>
              <br />
              {terminal.type}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}