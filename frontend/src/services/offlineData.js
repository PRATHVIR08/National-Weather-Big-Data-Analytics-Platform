// Comprehensive offline fallback weather telemetry & hazard reports dataset
// Used when backend service is stopped or unreachable.

export const OFFLINE_LIVE_WEATHER = [
  { city: "Delhi", state: "Delhi", latitude: 28.6139, longitude: 77.2090, temperature: 34.2, apparent_temperature: 37.5, humidity: 48, precipitation: 0.0, rain: 0.0, cloud_cover: 25, pressure: 1011.2, wind_speed: 14.5, wind_direction: 290, wind_gusts: 22.0, weather_code: 1, condition: "Mainly Clear", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Mumbai", state: "Maharashtra", latitude: 19.0760, longitude: 72.8777, temperature: 30.5, apparent_temperature: 35.8, humidity: 82, precipitation: 18.5, rain: 18.5, cloud_cover: 90, pressure: 1008.4, wind_speed: 24.0, wind_direction: 240, wind_gusts: 38.5, weather_code: 63, condition: "Moderate Rain", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946, temperature: 25.8, apparent_temperature: 26.4, humidity: 74, precipitation: 2.4, rain: 2.4, cloud_cover: 75, pressure: 1014.1, wind_speed: 16.2, wind_direction: 260, wind_gusts: 26.0, weather_code: 51, condition: "Light Drizzle", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639, temperature: 31.8, apparent_temperature: 38.2, humidity: 86, precipitation: 42.0, rain: 42.0, cloud_cover: 95, pressure: 1005.8, wind_speed: 28.4, wind_direction: 180, wind_gusts: 44.0, weather_code: 65, condition: "Heavy Rain", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707, temperature: 33.1, apparent_temperature: 39.0, humidity: 71, precipitation: 0.0, rain: 0.0, cloud_cover: 30, pressure: 1010.5, wind_speed: 18.0, wind_direction: 120, wind_gusts: 25.0, weather_code: 0, condition: "Clear Sky", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Hyderabad", state: "Telangana", latitude: 17.3850, longitude: 78.4867, temperature: 29.4, apparent_temperature: 32.1, humidity: 62, precipitation: 0.5, rain: 0.5, cloud_cover: 50, pressure: 1012.8, wind_speed: 12.8, wind_direction: 270, wind_gusts: 20.0, weather_code: 2, condition: "Partly Cloudy", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714, temperature: 36.5, apparent_temperature: 39.8, humidity: 42, precipitation: 0.0, rain: 0.0, cloud_cover: 10, pressure: 1009.2, wind_speed: 15.0, wind_direction: 280, wind_gusts: 24.0, weather_code: 0, condition: "Clear Sky", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873, temperature: 37.2, apparent_temperature: 39.1, humidity: 36, precipitation: 0.0, rain: 0.0, cloud_cover: 15, pressure: 1007.9, wind_speed: 17.5, wind_direction: 250, wind_gusts: 28.0, weather_code: 0, condition: "Clear Sky", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567, temperature: 27.2, apparent_temperature: 28.5, humidity: 76, precipitation: 5.2, rain: 5.2, cloud_cover: 80, pressure: 1013.0, wind_speed: 13.4, wind_direction: 230, wind_gusts: 22.0, weather_code: 61, condition: "Slight Rain", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462, temperature: 32.6, apparent_temperature: 36.4, humidity: 65, precipitation: 0.0, rain: 0.0, cloud_cover: 40, pressure: 1010.8, wind_speed: 9.8, wind_direction: 110, wind_gusts: 16.0, weather_code: 45, condition: "Fog", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Guwahati", state: "Assam", latitude: 26.1445, longitude: 91.7362, temperature: 28.0, apparent_temperature: 33.2, humidity: 88, precipitation: 32.5, rain: 32.5, cloud_cover: 98, pressure: 1006.2, wind_speed: 21.0, wind_direction: 150, wind_gusts: 35.0, weather_code: 95, condition: "Thunderstorm", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Srinagar", state: "Jammu and Kashmir", latitude: 34.0837, longitude: 74.7973, temperature: 19.5, apparent_temperature: 19.0, humidity: 58, precipitation: 1.2, rain: 1.2, cloud_cover: 60, pressure: 1016.4, wind_speed: 8.5, wind_direction: 340, wind_gusts: 14.0, weather_code: 61, condition: "Slight Rain", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Bhopal", state: "Madhya Pradesh", latitude: 23.2599, longitude: 77.4126, temperature: 30.1, apparent_temperature: 33.0, humidity: 64, precipitation: 1.8, rain: 1.8, cloud_cover: 70, pressure: 1011.5, wind_speed: 14.0, wind_direction: 250, wind_gusts: 21.0, weather_code: 3, condition: "Overcast", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Chandigarh", state: "Chandigarh", latitude: 30.7333, longitude: 76.7794, temperature: 33.8, apparent_temperature: 36.2, humidity: 52, precipitation: 0.0, rain: 0.0, cloud_cover: 30, pressure: 1011.0, wind_speed: 11.2, wind_direction: 300, wind_gusts: 18.0, weather_code: 1, condition: "Mainly Clear", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Thiruvananthapuram", state: "Kerala", latitude: 8.5241, longitude: 76.9366, temperature: 28.6, apparent_temperature: 33.4, humidity: 84, precipitation: 14.2, rain: 14.2, cloud_cover: 85, pressure: 1010.1, wind_speed: 20.5, wind_direction: 220, wind_gusts: 32.0, weather_code: 80, condition: "Slight Rain Showers", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Patna", state: "Bihar", latitude: 25.5941, longitude: 85.1376, temperature: 31.4, apparent_temperature: 36.8, humidity: 75, precipitation: 8.4, rain: 8.4, cloud_cover: 80, pressure: 1008.9, wind_speed: 13.0, wind_direction: 130, wind_gusts: 22.0, weather_code: 61, condition: "Slight Rain", observed_at: new Date().toISOString(), source: "Offline Cache" },
  { city: "Panaji", state: "Goa", latitude: 15.4909, longitude: 73.8278, temperature: 29.2, apparent_temperature: 34.0, humidity: 85, precipitation: 26.0, rain: 26.0, cloud_cover: 92, pressure: 1009.5, wind_speed: 25.0, wind_direction: 250, wind_gusts: 39.0, weather_code: 81, condition: "Moderate Rain Showers", observed_at: new Date().toISOString(), source: "Offline Cache" }
];

export const OFFLINE_INCIDENT_REPORTS = [
  {
    id: 101,
    source: "citizen",
    event_type: "Flood",
    city: "Mumbai",
    state: "Maharashtra",
    latitude: 19.0760,
    longitude: 72.8777,
    text_content: "Severe waterlogging on Western Express Highway near Andheri flyover. Water depth over 2 feet.",
    verification_status: "verified",
    trust_score: 92,
    photo_url: null,
    posted_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 102,
    source: "citizen",
    event_type: "Thunderstorm",
    city: "Delhi",
    state: "Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    text_content: "Heavy thunderstorm with gusty winds near Connaught Place. Tree branches down blocking lane.",
    verification_status: "verified",
    trust_score: 88,
    photo_url: null,
    posted_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 103,
    source: "citizen",
    event_type: "Flood",
    city: "Guwahati",
    state: "Assam",
    latitude: 26.1445,
    longitude: 91.7362,
    text_content: "Brahmaputra river overflow alert in low-lying residential sectors of Zoo Road.",
    verification_status: "verified",
    trust_score: 95,
    photo_url: null,
    posted_at: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 104,
    source: "citizen",
    event_type: "Heatwave",
    city: "Jaipur",
    state: "Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
    text_content: "Extreme heatwave conditions recorded. Surface temperature soaring past 42°C with dry winds.",
    verification_status: "pending",
    trust_score: 65,
    photo_url: null,
    posted_at: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 105,
    source: "citizen",
    event_type: "Flood",
    city: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    text_content: "Flash waterlogging under Silk Board flyover causing 3km traffic bottleneck.",
    verification_status: "verified",
    trust_score: 85,
    photo_url: null,
    posted_at: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: 106,
    source: "citizen",
    event_type: "StrongWind",
    city: "Kolkata",
    state: "West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
    text_content: "High gale force wind gusts (44 km/h) accompanied by torrential squalls near Salt Lake.",
    verification_status: "verified",
    trust_score: 90,
    photo_url: null,
    posted_at: new Date(Date.now() - 21600000).toISOString()
  },
  {
    id: 107,
    source: "citizen",
    event_type: "Fog",
    city: "Lucknow",
    state: "Uttar Pradesh",
    latitude: 26.8467,
    longitude: 80.9462,
    text_content: "Dense fog cloud layer reducing highway visibility to under 60 meters.",
    verification_status: "pending",
    trust_score: 58,
    photo_url: null,
    posted_at: new Date(Date.now() - 25200000).toISOString()
  }
];

export function getOfflineCityWeather(cityName) {
  const norm = (cityName || '').trim().toLowerCase();
  const match = OFFLINE_LIVE_WEATHER.find(item => item.city.toLowerCase() === norm);
  
  if (match) {
    return {
      location: {
        city: match.city,
        state: match.state,
        country: "India",
        latitude: match.latitude,
        longitude: match.longitude
      },
      weather: {
        temperature_c: match.temperature,
        feels_like_c: match.apparent_temperature,
        condition: match.condition,
        humidity_pct: match.humidity,
        wind_speed_kmh: match.wind_speed,
        wind_direction_deg: match.wind_direction,
        wind_gust_kmh: match.wind_gusts,
        precipitation_mm: match.precipitation,
        rain_mm: match.rain,
        cloud_cover_pct: match.cloud_cover,
        pressure_hpa: match.pressure,
        weather_code: match.weather_code
      },
      observed_at: match.observed_at,
      source: "Offline Cache Data"
    };
  }

  // Fallback dynamic synthesis for unlisted city search while offline
  const hash = norm.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const temp = 24 + (hash % 14);
  const humidity = 45 + (hash % 45);
  const wind = 8 + (hash % 20);

  return {
    location: {
      city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
      state: "India",
      country: "India",
      latitude: 20.5937 + ((hash % 10) - 5) * 0.5,
      longitude: 78.9629 + ((hash % 10) - 5) * 0.5
    },
    weather: {
      temperature_c: temp,
      feels_like_c: temp + 2.5,
      condition: "Partly Cloudy (Offline Mode)",
      humidity_pct: humidity,
      wind_speed_kmh: wind,
      wind_direction_deg: (hash * 17) % 360,
      wind_gust_kmh: wind + 6,
      precipitation_mm: 0.0,
      rain_mm: 0.0,
      cloud_cover_pct: 35,
      pressure_hpa: 1012.0,
      weather_code: 2
    },
    observed_at: new Date().toISOString(),
    source: "Offline Synthesized Telemetry"
  };
}

export function getOfflineAgriAdvisory(cityName = 'Bengaluru') {
  const cityWeather = getOfflineCityWeather(cityName);
  const temp = cityWeather.weather.temperature_c;
  const humidity = cityWeather.weather.humidity_pct;

  const hours = Array.from({ length: 12 }, (_, i) => `${i * 6}h`);
  const soilMoisture = [0.28, 0.29, 0.31, 0.34, 0.35, 0.33, 0.32, 0.30, 0.29, 0.28, 0.27, 0.27];
  const soilTemp = [21.5, 22.0, 23.2, 24.5, 25.1, 24.8, 23.9, 22.8, 22.1, 21.8, 21.4, 21.2];
  const rhList = [68, 72, 78, 85, 82, 76, 70, 65, 64, 66, 68, 70];

  return {
    city: cityWeather.location.city,
    state: cityWeather.location.state,
    current_metrics: {
      soil_moisture: 0.31,
      soil_moisture_pct: 31,
      soil_temperature: 23.4,
      relative_humidity: humidity,
      rain_72h: 12.5
    },
    advisories: [
      {
        category: "IRRIGATION ADVISORY",
        level: "NORMAL",
        badge: "OPTIMAL",
        icon: "💧",
        title: "Soil Moisture Levels Favorable",
        message: "Current root-zone soil moisture is adequate. No immediate irrigation required for cereal crops."
      },
      {
        category: "PLANT PROTECTION",
        level: "WARNING",
        badge: "MONITOR",
        icon: "🐛",
        title: "Fungal Spore Risk",
        message: `Relative humidity at ${humidity}% creates favorable microclimate for blast/blight fungus. Inspect leaf undersides.`
      },
      {
        category: "HARVEST PLANNING",
        level: "NORMAL",
        badge: "CLEAR",
        icon: "🌾",
        title: "Favorable Field Drying Window",
        message: "Moderate wind speeds will assist post-harvest field drying over the next 48 hours."
      }
    ],
    chart_data: {
      labels: hours,
      soil_moisture: soilMoisture,
      soil_temperature: soilTemp,
      humidity: rhList
    }
  };
}
