import httpx
from datetime import datetime, timezone
from typing import List, Dict


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


# Major Indian cities.
# We can expand this later to 50/100+ locations.
INDIA_WEATHER_LOCATIONS = [
    {
        "city": "Delhi",
        "state": "Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
    },
    {
        "city": "Mumbai",
        "state": "Maharashtra",
        "latitude": 19.0760,
        "longitude": 72.8777,
    },
    {
        "city": "Bengaluru",
        "state": "Karnataka",
        "latitude": 12.9716,
        "longitude": 77.5946,
    },
    {
        "city": "Chennai",
        "state": "Tamil Nadu",
        "latitude": 13.0827,
        "longitude": 80.2707,
    },
    {
        "city": "Kolkata",
        "state": "West Bengal",
        "latitude": 22.5726,
        "longitude": 88.3639,
    },
    {
        "city": "Hyderabad",
        "state": "Telangana",
        "latitude": 17.3850,
        "longitude": 78.4867,
    },
    {
        "city": "Ahmedabad",
        "state": "Gujarat",
        "latitude": 23.0225,
        "longitude": 72.5714,
    },
    {
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5204,
        "longitude": 73.8567,
    },
    {
        "city": "Jaipur",
        "state": "Rajasthan",
        "latitude": 26.9124,
        "longitude": 75.7873,
    },
    {
        "city": "Lucknow",
        "state": "Uttar Pradesh",
        "latitude": 26.8467,
        "longitude": 80.9462,
    },
    {
        "city": "Kochi",
        "state": "Kerala",
        "latitude": 9.9312,
        "longitude": 76.2673,
    },
    {
        "city": "Bhopal",
        "state": "Madhya Pradesh",
        "latitude": 23.2599,
        "longitude": 77.4126,
    },
    {
        "city": "Bhubaneswar",
        "state": "Odisha",
        "latitude": 20.2961,
        "longitude": 85.8245,
    },
    {
        "city": "Guwahati",
        "state": "Assam",
        "latitude": 26.1445,
        "longitude": 91.7362,
    },
    {
        "city": "Chandigarh",
        "state": "Chandigarh",
        "latitude": 30.7333,
        "longitude": 76.7794,
    },
    {
        "city": "Patna",
        "state": "Bihar",
        "latitude": 25.5941,
        "longitude": 85.1376,
    },
    {
        "city": "Ranchi",
        "state": "Jharkhand",
        "latitude": 23.3441,
        "longitude": 85.3096,
    },
    {
        "city": "Thiruvananthapuram",
        "state": "Kerala",
        "latitude": 8.5241,
        "longitude": 76.9366,
    },
    {
        "city": "Visakhapatnam",
        "state": "Andhra Pradesh",
        "latitude": 17.6868,
        "longitude": 83.2185,
    },
    {
        "city": "Nagpur",
        "state": "Maharashtra",
        "latitude": 21.1458,
        "longitude": 79.0882,
    },
]


WEATHER_CODE_MAP = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    56: "Light Freezing Drizzle",
    57: "Dense Freezing Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Light Freezing Rain",
    67: "Heavy Freezing Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm With Hail",
    99: "Thunderstorm With Heavy Hail",
}


def get_weather_description(weather_code: int) -> str:
    return WEATHER_CODE_MAP.get(weather_code, "Unknown")


async def fetch_weather_for_locations() -> List[Dict]:
    """
    Fetch current weather for all configured Indian cities.

    Open-Meteo supports multiple coordinates in one request.
    """

    latitudes = ",".join(
        str(location["latitude"])
        for location in INDIA_WEATHER_LOCATIONS
    )

    longitudes = ",".join(
        str(location["longitude"])
        for location in INDIA_WEATHER_LOCATIONS
    )

    params = {
        "latitude": latitudes,
        "longitude": longitudes,

        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "rain",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
        ]),

        "timezone": "Asia/Kolkata",

        "wind_speed_unit": "kmh",

        "temperature_unit": "celsius",

        "precipitation_unit": "mm",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:

        response = await client.get(
            OPEN_METEO_URL,
            params=params
        )

        response.raise_for_status()

        data = response.json()

    # Open-Meteo returns a list when multiple coordinates are supplied.
    if isinstance(data, dict):
        data = [data]

    results = []

    for index, weather_data in enumerate(data):

        if index >= len(INDIA_WEATHER_LOCATIONS):
            break

        location = INDIA_WEATHER_LOCATIONS[index]

        current = weather_data.get("current", {})

        weather_code = current.get("weather_code")

        weather_result = {
            "city": location["city"],
            "state": location["state"],

            "latitude": location["latitude"],
            "longitude": location["longitude"],

            "temperature": current.get("temperature_2m"),
            "apparent_temperature": current.get(
                "apparent_temperature"
            ),

            "humidity": current.get(
                "relative_humidity_2m"
            ),

            "precipitation": current.get(
                "precipitation"
            ),

            "rain": current.get("rain"),

            "cloud_cover": current.get(
                "cloud_cover"
            ),

            "wind_speed": current.get(
                "wind_speed_10m"
            ),

            "wind_direction": current.get(
                "wind_direction_10m"
            ),

            "wind_gusts": current.get(
                "wind_gusts_10m"
            ),

            "weather_code": weather_code,

            "condition": get_weather_description(
                weather_code
            ),

            "observed_at": current.get("time"),

            "source": "Open-Meteo",

            "fetched_at": datetime.now(
                timezone.utc
            ).isoformat(),
        }

        results.append(weather_result)

    return results