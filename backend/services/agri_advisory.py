import httpx
from datetime import datetime
from typing import Dict, Any, List

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"

# Fallback coordinates for major Indian agricultural regions if geocoding yields no result
INDIAN_CITIES_COORDS = {
    "delhi": {"lat": 28.6139, "lon": 77.2090, "state": "Delhi"},
    "ludhiana": {"lat": 30.9010, "lon": 75.8573, "state": "Punjab"},
    "amritsar": {"lat": 31.6340, "lon": 74.8723, "state": "Punjab"},
    "jaipur": {"lat": 26.9124, "lon": 75.7873, "state": "Rajasthan"},
    "lucknow": {"lat": 26.8467, "lon": 80.9462, "state": "Uttar Pradesh"},
    "kanpur": {"lat": 26.4499, "lon": 80.3319, "state": "Uttar Pradesh"},
    "bhopal": {"lat": 23.2599, "lon": 77.4126, "state": "Madhya Pradesh"},
    "indore": {"lat": 22.7196, "lon": 75.8577, "state": "Madhya Pradesh"},
    "pune": {"lat": 18.5204, "lon": 73.8567, "state": "Maharashtra"},
    "nashik": {"lat": 19.9975, "lon": 73.7898, "state": "Maharashtra"},
    "nagpur": {"lat": 21.1458, "lon": 79.0882, "state": "Maharashtra"},
    "ahmedabad": {"lat": 23.0225, "lon": 72.5714, "state": "Gujarat"},
    "bengaluru": {"lat": 12.9716, "lon": 77.5946, "state": "Karnataka"},
    "mysuru": {"lat": 12.2958, "lon": 76.6394, "state": "Karnataka"},
    "hyderabad": {"lat": 17.3850, "lon": 78.4867, "state": "Telangana"},
    "guntur": {"lat": 16.3067, "lon": 80.4365, "state": "Andhra Pradesh"},
    "chennai": {"lat": 13.0827, "lon": 80.2707, "state": "Tamil Nadu"},
    "coimbatore": {"lat": 11.0168, "lon": 76.9558, "state": "Tamil Nadu"},
    "patna": {"lat": 25.5941, "lon": 85.1376, "state": "Bihar"},
    "kolkata": {"lat": 22.5726, "lon": 88.3639, "state": "West Bengal"},
    "bhubaneswar": {"lat": 20.2961, "lon": 85.8245, "state": "Odisha"},
}

async def geocode_city(city_name: str) -> Dict[str, Any]:
    """Find latitude & longitude for a city name."""
    clean_city = city_name.strip().lower()
    if clean_city in INDIAN_CITIES_COORDS:
        info = INDIAN_CITIES_COORDS[clean_city]
        return {"name": city_name.capitalize(), "lat": info["lat"], "lon": info["lon"], "state": info["state"]}

    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(GEOCODING_URL, params={"name": city_name, "count": 1, "language": "en", "format": "json"})
        if res.status_code == 200:
            data = res.json()
            if "results" in data and len(data["results"]) > 0:
                first = data["results"][0]
                return {
                    "name": first.get("name", city_name),
                    "lat": first["latitude"],
                    "lon": first["longitude"],
                    "state": first.get("admin1", "India")
                }
    
    # Fallback to Delhi if city not found
    return {"name": city_name.capitalize(), "lat": 28.6139, "lon": 77.2090, "state": "India"}

async def fetch_agri_advisory(city_name: str) -> Dict[str, Any]:
    """Fetch 72-hour soil/humidity forecast and compute agronomic advisories."""
    geo = await geocode_city(city_name)
    lat, lon = geo["lat"], geo["lon"]

    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "soil_moisture_0_to_7cm,soil_temperature_0_to_7cm,relative_humidity_2m,precipitation,temperature_2m,wind_speed_10m",
        "forecast_days": 3,
        "timezone": "Asia/Kolkata"
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.get(OPEN_METEO_FORECAST_URL, params=params)
        if res.status_code != 200:
            raise Exception(f"Open-Meteo returned status {res.status_code}")
        
        forecast_data = res.json()

    hourly = forecast_data.get("hourly", {})
    times = hourly.get("time", [])[:72]
    soil_moist = hourly.get("soil_moisture_0_to_7cm", [])[:72]
    soil_temp = hourly.get("soil_temperature_0_to_7cm", [])[:72]
    humidity = hourly.get("relative_humidity_2m", [])[:72]
    precipitation = hourly.get("precipitation", [])[:72]
    temp = hourly.get("temperature_2m", [])[:72]
    wind = hourly.get("wind_speed_10m", [])[:72]

    # Calculate summary statistics
    current_soil_moisture = soil_moist[0] if soil_moist else 0.25
    current_soil_temp = soil_temp[0] if soil_temp else 24.0
    current_humidity = humidity[0] if humidity else 65.0
    current_temp = temp[0] if temp else 28.0

    avg_humidity = sum(humidity) / len(humidity) if humidity else 65.0
    avg_temp = sum(temp) / len(temp) if temp else 28.0
    total_rain_72h = sum(precipitation) if precipitation else 0.0
    max_wind = max(wind) if wind else 0.0

    # Rule-Based Advisory Generation
    advisories = []

    # 1. Irrigation Advisory
    if total_rain_72h >= 12.0:
        advisories.append({
            "category": "Irrigation Management",
            "level": "OPTIMAL",
            "badge": "Delay Irrigation",
            "icon": "🌧️",
            "title": "Hold Irrigation - Heavy Rain Forecast",
            "message": f"Precipitation of {total_rain_72h:.1f} mm expected over next 72 hours. Postpone irrigation to save water and prevent soil oversaturation."
        })
    elif current_soil_moisture < 0.18:
        advisories.append({
            "category": "Irrigation Management",
            "level": "ALERT",
            "badge": "Urgent Irrigation",
            "icon": "💧",
            "title": "Critical Low Soil Moisture",
            "message": f"Topsoil moisture is low ({current_soil_moisture:.2f} m³/m³). Irrigate crops within 24 hours to prevent stress."
        })
    elif current_soil_moisture < 0.26:
        advisories.append({
            "category": "Irrigation Management",
            "level": "WARNING",
            "badge": "Moderate Soil Moisture",
            "icon": "🚿",
            "title": "Light Irrigation Recommended",
            "message": f"Soil moisture ({current_soil_moisture:.2f} m³/m³) is declining. Schedule light drip or furrow irrigation."
        })
    else:
        advisories.append({
            "category": "Irrigation Management",
            "level": "OPTIMAL",
            "badge": "Moisture Adequate",
            "icon": "✅",
            "title": "Optimal Soil Moisture",
            "message": f"Topsoil moisture level ({current_soil_moisture:.2f} m³/m³) is ideal. Maintain standard monitoring."
        })

    # 2. Fungal & Pest Disease Advisory
    if avg_humidity > 78 and avg_temp >= 22:
        advisories.append({
            "category": "Disease & Pest Risk",
            "level": "WARNING",
            "badge": "High Fungal Risk",
            "icon": "🦠",
            "title": "Elevated Blight & Mildew Threat",
            "message": f"High relative humidity ({avg_humidity:.1f}%) combined with warm temp ({avg_temp:.1f}°C) creates ideal conditions for fungal pathogens."
        })
    else:
        advisories.append({
            "category": "Disease & Pest Risk",
            "level": "OPTIMAL",
            "badge": "Low Pest Pressure",
            "icon": "🛡️",
            "title": "Favorable Atmospheric Conditions",
            "message": f"Relative humidity ({current_humidity:.0f}%) and temperatures are within safe agricultural thresholds."
        })

    # 3. Waterlogging & Aeration Advisory
    if current_soil_moisture > 0.42 or total_rain_72h > 45:
        advisories.append({
            "category": "Soil Aeration",
            "level": "ALERT",
            "badge": "Waterlogging Alert",
            "icon": "⚠️",
            "title": "Soil Saturation Warning",
            "message": "High soil saturation detected/forecast. Clear field drainage channels to prevent root hypoxia."
        })
    else:
        advisories.append({
            "category": "Soil Aeration",
            "level": "OPTIMAL",
            "badge": "Good Aeration",
            "icon": "🌱",
            "title": "Healthy Root Respiration",
            "message": "Soil oxygen and moisture balance is supporting healthy root growth."
        })

    # 4. Field Work & Spray Window
    if total_rain_72h < 3.0 and max_wind < 18.0:
        advisories.append({
            "category": "Field Operations",
            "level": "OPTIMAL",
            "badge": "Good Spray Window",
            "icon": "🚜",
            "title": "Favorable Spray & Fertilizer Window",
            "message": f"Low rainfall expected (<{total_rain_72h:.1f} mm) with light wind ({max_wind:.1f} km/h). Good window for foliar application."
        })
    else:
        advisories.append({
            "category": "Field Operations",
            "level": "WARNING",
            "badge": "Unfavorable Spray",
            "icon": "🚫",
            "title": "Postpone Chemical Application",
            "message": f"Rain ({total_rain_72h:.1f} mm) or wind ({max_wind:.1f} km/h) may wash away spray applications or cause drift."
        })

    # Format hourly chart labels
    chart_labels = []
    for t_str in times:
        try:
            dt = datetime.fromisoformat(t_str)
            chart_labels.append(dt.strftime("%b %d %H:%M"))
        except Exception:
            chart_labels.append(t_str)

    return {
        "city": geo["name"],
        "state": geo["state"],
        "latitude": lat,
        "longitude": lon,
        "current_metrics": {
            "soil_moisture": round(current_soil_moisture, 3),
            "soil_moisture_pct": round(current_soil_moisture * 100, 1),
            "soil_temperature": round(current_soil_temp, 1),
            "relative_humidity": round(current_humidity, 1),
            "temperature": round(current_temp, 1),
            "rain_72h": round(total_rain_72h, 1)
        },
        "advisories": advisories,
        "chart_data": {
            "labels": chart_labels,
            "soil_moisture": [round(val, 3) for val in soil_moist],
            "soil_temperature": [round(val, 1) for val in soil_temp],
            "humidity": [round(val, 1) for val in humidity],
            "precipitation": [round(val, 2) for val in precipitation]
        }
    }
