import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import GlassCard from '../common/GlassCard';

function LocationSelector({ onSelectLocation, selectedCoords }) {
  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  if (!selectedCoords) return null;

  return (
    <Marker position={[selectedCoords.lat, selectedCoords.lng]}>
      <Popup>
        <strong>Selected Location</strong><br />
        Latitude: {selectedCoords.lat.toFixed(6)}<br />
        Longitude: {selectedCoords.lng.toFixed(6)}
      </Popup>
    </Marker>
  );
}

export default function LocationPickerMap({ onClose, onConfirm }) {
  const [selectedCoords, setSelectedCoords] = useState(null);

  const handleSelectLocation = (lat, lng) => {
    setSelectedCoords({ lat, lng });
  };

  const handleConfirm = () => {
    if (selectedCoords) {
      onConfirm(selectedCoords.lat, selectedCoords.lng);
    }
  };

  return (
    <div className="location-picker-container" style={{ display: 'block', marginTop: '1rem' }}>
      <div className="location-picker-header">
        <div>
          <strong>📍 Select Incident Location</strong>
          <p>Click anywhere on the map to place the incident pin.</p>
        </div>
        <button type="button" className="location-picker-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div id="locationPickerMap" style={{ height: '380px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
        <MapContainer
          center={[22.5937, 78.9629]}
          zoom={5}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector onSelectLocation={handleSelectLocation} selectedCoords={selectedCoords} />
        </MapContainer>
      </div>

      <div className="selected-location-info">
        <span>Latitude: <strong>{selectedCoords ? selectedCoords.lat.toFixed(6) : '—'}</strong></span>
        <span>Longitude: <strong>{selectedCoords ? selectedCoords.lng.toFixed(6) : '—'}</strong></span>
      </div>

      <button
        type="button"
        className="btn-primary"
        disabled={!selectedCoords}
        onClick={handleConfirm}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        ✓ Use This Location
      </button>
    </div>
  );
}
