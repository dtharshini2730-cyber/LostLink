import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { JourneyCheckpoint } from '../types';

// Custom Map center fitter component
const MapRecenter: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [coords, map]);
  return null;
};

// Create custom colored HTML markers
const createCustomIcon = (type: string, seq: number) => {
  let bgColor = '#2563EB'; // Blue
  let label = '📍';

  if (type === 'ORIGIN') {
    bgColor = '#DC2626'; // Red
    label = '🚨';
  } else if (type === 'WITNESS') {
    bgColor = '#059669'; // Emerald
    label = '👁️';
  } else if (type === 'STAFF_OBSERVATION') {
    bgColor = '#7C3AED'; // Purple
    label = '🛡️';
  } else if (type === 'FOUND_CUSTODY') {
    bgColor = '#16A34A'; // Green
    label = '✅';
  }

  const html = `
    <div style="
      background-color: ${bgColor};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25), 0 2px 4px -2px rgba(0,0,0,0.1);
      border: 2px solid white;
    ">
      ${label}
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

interface JourneyMapProps {
  checkpoints: JourneyCheckpoint[];
  routeCoordinates: [number, number][];
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ checkpoints, routeCoordinates }) => {
  const defaultCenter: [number, number] = routeCoordinates.length > 0
    ? routeCoordinates[0]
    : [11.0016, 76.9629];

  return (
    <div className="w-full h-80 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden border border-borderCustom shadow-sm relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Route Polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#2563EB',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8',
            }}
          />
        )}

        {/* Fit Bounds */}
        {routeCoordinates.length > 0 && <MapRecenter coords={routeCoordinates} />}

        {/* Checkpoint Markers */}
        {checkpoints.map((chk, index) => (
          <Marker
            key={chk.id || index}
            position={[chk.latitude, chk.longitude]}
            icon={createCustomIcon(chk.type, index + 1)}
          >
            <Popup className="custom-popup">
              <div className="p-1 space-y-1.5 max-w-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {chk.source_badge}
                  </span>
                  <span className="text-[11px] font-medium text-textSecondary">
                    {new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <h4 className="font-bold text-sm text-textPrimary leading-tight">
                  {chk.title}
                </h4>
                
                <p className="text-xs text-textSecondary">
                  📍 {chk.location_name} {chk.vehicle_info && `• ${chk.vehicle_info}`}
                </p>

                <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60 leading-relaxed">
                  {chk.description}
                </p>

                {chk.image_url && (
                  <div className="mt-1 rounded-lg overflow-hidden border border-borderCustom h-24 w-full bg-slate-100">
                    <img
                      src={chk.image_url.startsWith('/') ? `http://localhost:8000${chk.image_url}` : chk.image_url}
                      alt={chk.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-textSecondary">Evidence Confidence:</span>
                  <span className="font-bold text-primary">{chk.confidence}%</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
