import React from 'react';

export default function LoadingIndicator({ message = 'Updating weather data...' }) {
  return (
    <div className="weather-loading-indicator">
      <div className="weather-loading-dot"></div>
      <span>{message}</span>
    </div>
  );
}
