import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getTemperatureColor, getWeatherIconSymbol } from '../../utils/weatherUtils';

export default function LiveWeatherMarker({ station }) {
  const position = [station.latitude, station.longitude];
  const tempVal = Number(station.temperature);
  const tempStr = Number.isFinite(tempVal) ? `${Math.round(tempVal)}°` : '--°';

  const customDivIcon = useMemo(() => {
    const color = getTemperatureColor(tempVal);
    const symbol = getWeatherIconSymbol(station);

    const html = `
      <div className="live-weather-marker" style="border-color: ${color}; color: ${color};">
        <span className="live-weather-icon-symbol">${symbol}</span>
        <span className="weather-temp">${tempStr}</span>
      </div>
    `;

    return L.divIcon({
      className: 'live-weather-icon',
      html: html,
      iconSize: [68, 44],
      iconAnchor: [34, 22],
      popupAnchor: [0, -20],
    });
  }, [tempVal, tempStr, station]);

  return (
    <Marker position={position} icon={customDivIcon}>
      <Popup minWidth={280}>
        <div className="live-weather-popup">
          <div className="live-weather-popup-header">
            <div>
              <div className="live-weather-city">{station.city || 'Weather Station'}</div>
              <div className="weather-state">{station.state || 'India'}</div>
            </div>
            <div className="weather-condition">{station.condition || 'Clear'}</div>
          </div>

          <div className="live-weather-main-temp">
            {Number.isFinite(tempVal) ? `${Math.round(tempVal)} °C` : '-- °C'}
          </div>

          <div className="weather-grid">
            <div className="weather-item">
              <span>Feels Like</span>
              <strong>{station.feels_like !== null ? `${Math.round(station.feels_like)} °C` : '--'}</strong>
            </div>

            <div className="weather-item">
              <span>Humidity</span>
              <strong>{station.humidity !== null ? `${station.humidity} %` : '--'}</strong>
            </div>

            <div className="weather-item">
              <span>Wind Speed</span>
              <strong>{station.wind_speed !== null ? `${station.wind_speed} km/h` : '--'}</strong>
            </div>

            <div className="weather-item">
              <span>Precipitation</span>
              <strong>{station.rain !== null ? `${station.rain} mm` : '--'}</strong>
            </div>
          </div>

          <div className="weather-updated">
            Updated: {station.updated_at || 'Just now'}
          </div>
          <div className="weather-source">Source: Open-Meteo API</div>
        </div>
      </Popup>
    </Marker>
  );
}
