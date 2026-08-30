import httpx
from datetime import datetime, timezone
from typing import List, Dict


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


# Major Indian cities.
# We can expand this later to 50/100+ locations.
INDIA_WEATHER_LOCATIONS = [
    # North India
    {"city": "Delhi", "state": "Delhi", "latitude": 28.6139, "longitude": 77.2090},
    {"city": "Chandigarh", "state": "Chandigarh", "latitude": 30.7333, "longitude": 76.7794},
    {"city": "Amritsar", "state": "Punjab", "latitude": 31.6340, "longitude": 74.8723},
    {"city": "Ludhiana", "state": "Punjab", "latitude": 30.9010, "longitude": 75.8573},
    {"city": "Jalandhar", "state": "Punjab", "latitude": 31.3260, "longitude": 75.5762},
    {"city": "Jaipur", "state": "Rajasthan", "latitude": 26.9124, "longitude": 75.7873},
    {"city": "Jodhpur", "state": "Rajasthan", "latitude": 26.2389, "longitude": 73.0243},
    {"city": "Udaipur", "state": "Rajasthan", "latitude": 24.5854, "longitude": 73.7125},
    {"city": "Lucknow", "state": "Uttar Pradesh", "latitude": 26.8467, "longitude": 80.9462},
    {"city": "Kanpur", "state": "Uttar Pradesh", "latitude": 26.4499, "longitude": 80.3319},
    {"city": "Varanasi", "state": "Uttar Pradesh", "latitude": 25.3176, "longitude": 82.9739},
    {"city": "Agra", "state": "Uttar Pradesh", "latitude": 27.1767, "longitude": 78.0081},
    {"city": "Prayagraj", "state": "Uttar Pradesh", "latitude": 25.4358, "longitude": 81.8463},
    {"city": "Dehradun", "state": "Uttarakhand", "latitude": 30.3165, "longitude": 78.0322},
    {"city": "Srinagar", "state": "Jammu and Kashmir", "latitude": 34.0837, "longitude": 74.7973},
    {"city": "Jammu", "state": "Jammu and Kashmir", "latitude": 32.7266, "longitude": 74.8570},
    {"city": "Shimla", "state": "Himachal Pradesh", "latitude": 31.1048, "longitude": 77.1734},

    # West India
    {"city": "Mumbai", "state": "Maharashtra", "latitude": 19.0760, "longitude": 72.8777},
    {"city": "Pune", "state": "Maharashtra", "latitude": 18.5204, "longitude": 73.8567},
    {"city": "Nagpur", "state": "Maharashtra", "latitude": 21.1458, "longitude": 79.0882},
    {"city": "Nashik", "state": "Maharashtra", "latitude": 19.9975, "longitude": 73.7898},
    {"city": "Aurangabad", "state": "Maharashtra", "latitude": 19.8762, "longitude": 75.3433},
    {"city": "Ahmedabad", "state": "Gujarat", "latitude": 23.0225, "longitude": 72.5714},
    {"city": "Surat", "state": "Gujarat", "latitude": 21.1702, "longitude": 72.8311},
    {"city": "Vadodara", "state": "Gujarat", "latitude": 22.3072, "longitude": 73.1812},
    {"city": "Rajkot", "state": "Gujarat", "latitude": 22.3039, "longitude": 70.8022},
    {"city": "Panaji", "state": "Goa", "latitude": 15.4909, "longitude": 73.8278},

    # Central India
    {"city": "Bhopal", "state": "Madhya Pradesh", "latitude": 23.2599, "longitude": 77.4126},
    {"city": "Indore", "state": "Madhya Pradesh", "latitude": 22.7196, "longitude": 75.8577},
    {"city": "Gwalior", "state": "Madhya Pradesh", "latitude": 26.2183, "longitude": 78.1828},
    {"city": "Jabalpur", "state": "Madhya Pradesh", "latitude": 23.1815, "longitude": 79.9864},
    {"city": "Raipur", "state": "Chhattisgarh", "latitude": 21.2514, "longitude": 81.6296},
    {"city": "Bilaspur", "state": "Chhattisgarh", "latitude": 22.0797, "longitude": 82.1409},

    # East India
    {"city": "Kolkata", "state": "West Bengal", "latitude": 22.5726, "longitude": 88.3639},
    {"city": "Siliguri", "state": "West Bengal", "latitude": 26.7271, "longitude": 88.3953},
    {"city": "Bhubaneswar", "state": "Odisha", "latitude": 20.2961, "longitude": 85.8245},
    {"city": "Cuttack", "state": "Odisha", "latitude": 20.4625, "longitude": 85.8830},
    {"city": "Ranchi", "state": "Jharkhand", "latitude": 23.3441, "longitude": 85.3096},
    {"city": "Jamshedpur", "state": "Jharkhand", "latitude": 22.8046, "longitude": 86.2029},
    {"city": "Patna", "state": "Bihar", "latitude": 25.5941, "longitude": 85.1376},
    {"city": "Gaya", "state": "Bihar", "latitude": 24.7914, "longitude": 85.0002},
    {"city": "Guwahati", "state": "Assam", "latitude": 26.1445, "longitude": 91.7362},
    {"city": "Shillong", "state": "Meghalaya", "latitude": 25.5788, "longitude": 91.8933},
    {"city": "Imphal", "state": "Manipur", "latitude": 24.8170, "longitude": 93.9368},
    {"city": "Agartala", "state": "Tripura", "latitude": 23.8315, "longitude": 91.2868},

    # South India
    {"city": "Bengaluru", "state": "Karnataka", "latitude": 12.9716, "longitude": 77.5946},
    {"city": "Mysuru", "state": "Karnataka", "latitude": 12.2958, "longitude": 76.6394},
    {"city": "Mangaluru", "state": "Karnataka", "latitude": 12.9141, "longitude": 74.8560},
    {"city": "Hubballi", "state": "Karnataka", "latitude": 15.3647, "longitude": 75.1240},
    {"city": "Chennai", "state": "Tamil Nadu", "latitude": 13.0827, "longitude": 80.2707},
    {"city": "Coimbatore", "state": "Tamil Nadu", "latitude": 11.0168, "longitude": 76.9558},
    {"city": "Madurai", "state": "Tamil Nadu", "latitude": 9.9252, "longitude": 78.1198},
    {"city": "Tiruchirappalli", "state": "Tamil Nadu", "latitude": 10.7905, "longitude": 78.7047},
    {"city": "Hyderabad", "state": "Telangana", "latitude": 17.3850, "longitude": 78.4867},
    {"city": "Warangal", "state": "Telangana", "latitude": 17.9689, "longitude": 79.5941},
    {"city": "Vijayawada", "state": "Andhra Pradesh", "latitude": 16.5062, "longitude": 80.6480},
    {"city": "Visakhapatnam", "state": "Andhra Pradesh", "latitude": 17.6868, "longitude": 83.2185},
    {"city": "Tirupati", "state": "Andhra Pradesh", "latitude": 13.6288, "longitude": 79.4192},
    {"city": "Kochi", "state": "Kerala", "latitude": 9.9312, "longitude": 76.2673},
    {"city": "Thiruvananthapuram", "state": "Kerala", "latitude": 8.5241, "longitude": 76.9366},
    {"city": "Kozhikode", "state": "Kerala", "latitude": 11.2588, "longitude": 75.7804},
    {"city": "Bhubaneswar", "state": "Odisha", "latitude": 20.2961, "longitude": 85.8245},

    # Northeast / additional coverage
    {"city": "Aizawl", "state": "Mizoram", "latitude": 23.7271, "longitude": 92.7176},
    {"city": "Kohima", "state": "Nagaland", "latitude": 25.6751, "longitude": 94.1086},
    {"city": "Itanagar", "state": "Arunachal Pradesh", "latitude": 27.0844, "longitude": 93.6053},
    {"city": "Gangtok", "state": "Sikkim", "latitude": 27.3389, "longitude": 88.6065},
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