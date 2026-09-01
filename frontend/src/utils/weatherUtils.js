export const EVENT_COLORS = {
  Flood: '#3b82f6',
  Heatwave: '#ef4444',
  Thunderstorm: '#a855f7',
  Fog: '#94a3b8',
  DustStorm: '#eab308',
  StrongWind: '#06b6d4',
  Other: '#64748b',
};

export function getEventColor(eventType) {
  return EVENT_COLORS[eventType] || EVENT_COLORS.Other;
}

export function getTemperatureColor(tempC) {
  if (tempC === null || tempC === undefined) return '#94a3b8';
  if (tempC < 15) return '#38bdf8';
  if (tempC < 20) return '#60a5fa';
  if (tempC < 25) return '#34d399';
  if (tempC < 30) return '#facc15';
  if (tempC < 35) return '#fb923c';
  if (tempC < 40) return '#f87171';
  return '#ef4444';
}

export function getWeatherIconSymbol(item) {
  const condition = (item?.condition || '').toLowerCase();
  const rain = Number(item?.rain ?? 0);
  const temp = Number(item?.temperature ?? 20);

  if (condition.includes('thunder') || condition.includes('storm')) return '⛈️';
  if (condition.includes('rain') || rain > 0) return '🌧️';
  if (condition.includes('snow') || temp < 0) return '❄️';
  if (condition.includes('fog') || condition.includes('mist')) return '🌫️';
  if (condition.includes('cloud') || condition.includes('overcast')) return '☁️';
  if (temp > 38) return '🔥';
  return '☀️';
}

export function createCustomReportSvgPin(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z"/>
    <circle cx="16" cy="16" r="6" fill="#ffffff"/>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}
