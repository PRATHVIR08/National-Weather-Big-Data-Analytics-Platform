import requests
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/weather", tags=["Weather"])


WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


@router.get("")
def get_weather(city: str = Query(..., min_length=2)):

    geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"

    geocoding_params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json",
        "countryCode": "IN",
    }

    try:
        geo_response = requests.get(
            geocoding_url,
            params=geocoding_params,
            timeout=10
        )
        geo_response.raise_for_status()
        geo_data = geo_response.json()

    except requests.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Weather location service unavailable: {str(e)}"
        )

    if not geo_data.get("results"):
        raise HTTPException(
            status_code=404,
            detail=f"City '{city}' was not found."
        )

    location = geo_data["results"][0]

    latitude = location["latitude"]
    longitude = location["longitude"]

    weather_url = "https://api.open-meteo.com/v1/forecast"

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation,"
            "weather_code,"
            "cloud_cover,"
            "pressure_msl,"
            "wind_speed_10m,"
            "wind_direction_10m,"
            "wind_gusts_10m"
        ),
        "timezone": "auto",
        "temperature_unit": "celsius",
        "wind_speed_unit": "kmh",
        "precipitation_unit": "mm"
    }

    try:
        weather_response = requests.get(
            weather_url,
            params=weather_params,
            timeout=10
        )
        weather_response.raise_for_status()
        weather_data = weather_response.json()

    except requests.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Weather service unavailable: {str(e)}"
        )

    current = weather_data.get("current", {})
    weather_code = current.get("weather_code")

    return {
        "location": {
            "city": location.get("name"),
            "state": location.get("admin1"),
            "country": location.get("country"),
            "latitude": latitude,
            "longitude": longitude,
            "timezone": weather_data.get("timezone")
        },
        "weather": {
            "temperature_c": current.get("temperature_2m"),
            "feels_like_c": current.get("apparent_temperature"),
            "humidity_pct": current.get("relative_humidity_2m"),
            "precipitation_mm": current.get("precipitation"),
            "condition": WEATHER_CODES.get(weather_code, "Unknown"),
            "weather_code": weather_code,
            "cloud_cover_pct": current.get("cloud_cover"),
            "pressure_hpa": current.get("pressure_msl"),
            "wind_speed_kmh": current.get("wind_speed_10m"),
            "wind_direction_deg": current.get("wind_direction_10m"),
            "wind_gust_kmh": current.get("wind_gusts_10m")
        },
        "observed_at": current.get("time"),
        "source": "Open-Meteo"
    }