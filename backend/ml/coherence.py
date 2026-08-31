# ============================================================
# PHYSICAL–SOCIAL COHERENCE ENGINE
# National Weather Big Data Analytics Platform
# ============================================================

import math
import requests
from typing import Optional


# ============================================================
# EVENT KEYWORDS
# ============================================================

EVENT_KEYWORDS = {

    "Flood": [
        "flood",
        "flooding",
        "waterlogging",
        "water logged",
        "water level",
        "inundation",
        "heavy rain",
        "heavy rainfall"
    ],

    "Thunderstorm": [
        "thunderstorm",
        "thunder",
        "lightning",
        "lightning strike",
        "storm"
    ],

    "Heatwave": [
        "heatwave",
        "heat wave",
        "extreme heat",
        "very hot",
        "scorching"
    ],

    "Fog": [
        "fog",
        "dense fog",
        "mist",
        "low visibility",
        "poor visibility"
    ],

    "DustStorm": [
        "dust storm",
        "duststorm",
        "dust",
        "sandstorm"
    ],

    "StrongWind": [
        "strong wind",
        "high wind",
        "gale",
        "storm winds",
        "heavy wind"
    ]
}


# ============================================================
# HAVERSINE DISTANCE
# ============================================================

def haversine_distance_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
) -> float:

    R = 6371.0

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        +
        math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return R * c


# ============================================================
# FETCH PHYSICAL WEATHER DATA
# ============================================================

def fetch_physical_weather(
    latitude: float,
    longitude: float
) -> Optional[dict]:

    """
    Fetch physical weather observations.

    Currently uses Open-Meteo as the physical weather source.

    This function can later be replaced with IMD/sensor API
    without changing the coherence engine.
    """

    try:

        url = "https://api.open-meteo.com/v1/forecast"

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": (
                "temperature_2m,"
                "relative_humidity_2m,"
                "precipitation,"
                "rain,"
                "weather_code,"
                "wind_speed_10m,"
                "wind_gusts_10m"
            ),
            "timezone": "auto"
        }

        response = requests.get(
            url,
            params=params,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        return data.get("current")

    except Exception as e:

        print(
            f"[COHERENCE] Weather fetch failed: {e}"
        )

        return None


# ============================================================
# WEATHER CONDITIONS
# ============================================================

def analyse_physical_conditions(
    event_type: str,
    weather: dict
) -> tuple[bool, str, float]:

    """
    Returns:

        coherent
        explanation
        physical_score

    physical_score = 0 - 100
    """

    if not weather:

        return (
            False,
            "Physical weather data unavailable.",
            0
        )


    precipitation = float(
        weather.get("precipitation") or 0
    )

    rain = float(
        weather.get("rain") or 0
    )

    temperature = float(
        weather.get("temperature_2m") or 0
    )

    humidity = float(
        weather.get("relative_humidity_2m") or 0
    )

    wind_speed = float(
        weather.get("wind_speed_10m") or 0
    )

    wind_gust = float(
        weather.get("wind_gusts_10m") or 0
    )


    # ========================================================
    # FLOOD
    # ========================================================

    if event_type == "Flood":

        if precipitation >= 10 or rain >= 10:

            return (
                True,
                (
                    f"Heavy precipitation detected "
                    f"({precipitation:.1f} mm). "
                    f"Physical conditions support the flood/rain report."
                ),
                95
            )

        elif precipitation >= 2 or rain >= 2:

            return (
                True,
                (
                    f"Rainfall detected "
                    f"({precipitation:.1f} mm). "
                    f"Partial physical support for the report."
                ),
                70
            )

        else:

            return (
                False,
                (
                    "No significant rainfall detected "
                    "at the reported location."
                ),
                20
            )


    # ========================================================
    # THUNDERSTORM
    # ========================================================

    if event_type == "Thunderstorm":

        if wind_gust >= 40 and precipitation > 0:

            return (
                True,
                (
                    "Strong wind gusts and precipitation "
                    "support thunderstorm activity."
                ),
                90
            )

        elif wind_gust >= 25:

            return (
                True,
                (
                    "Elevated wind gusts detected. "
                    "Partial support for thunderstorm report."
                ),
                65
            )

        else:

            return (
                False,
                (
                    "Current physical weather conditions "
                    "do not strongly support a thunderstorm."
                ),
                25
            )


    # ========================================================
    # HEATWAVE
    # ========================================================

    if event_type == "Heatwave":

        if temperature >= 40:

            return (
                True,
                (
                    f"Extreme temperature detected "
                    f"({temperature:.1f}°C)."
                ),
                95
            )

        elif temperature >= 35:

            return (
                True,
                (
                    f"High temperature detected "
                    f"({temperature:.1f}°C)."
                ),
                70
            )

        else:

            return (
                False,
                (
                    f"Temperature is {temperature:.1f}°C, "
                    "which does not strongly support heatwave conditions."
                ),
                20
            )


    # ========================================================
    # FOG
    # ========================================================

    if event_type == "Fog":

        if humidity >= 90:

            return (
                True,
                (
                    f"Very high humidity detected "
                    f"({humidity:.0f}%)."
                ),
                85
            )

        elif humidity >= 80:

            return (
                True,
                (
                    f"High humidity detected "
                    f"({humidity:.0f}%)."
                ),
                65
            )

        else:

            return (
                False,
                "Humidity conditions do not strongly support fog.",
                25
            )


    # ========================================================
    # DUST STORM
    # ========================================================

    if event_type == "DustStorm":

        if wind_speed >= 35:

            return (
                True,
                (
                    f"Strong winds detected "
                    f"({wind_speed:.1f} km/h)."
                ),
                85
            )

        elif wind_speed >= 20:

            return (
                True,
                (
                    f"Elevated wind speed detected "
                    f"({wind_speed:.1f} km/h)."
                ),
                60
            )

        else:

            return (
                False,
                "Wind conditions do not strongly support a dust storm.",
                20
            )


    # ========================================================
    # STRONG WIND
    # ========================================================

    if event_type == "StrongWind":

        if wind_speed >= 50 or wind_gust >= 60:

            return (
                True,
                (
                    f"Strong winds detected. "
                    f"Wind: {wind_speed:.1f} km/h, "
                    f"Gust: {wind_gust:.1f} km/h."
                ),
                95
            )

        elif wind_speed >= 30 or wind_gust >= 40:

            return (
                True,
                (
                    f"Elevated winds detected. "
                    f"Wind: {wind_speed:.1f} km/h."
                ),
                70
            )

        else:

            return (
                False,
                "Current wind conditions do not strongly support the report.",
                20
            )


    # ========================================================
    # UNKNOWN EVENT
    # ========================================================

    return (
        False,
        "No physical weather rule available for this event type.",
        0
    )


# ============================================================
# MAIN COHERENCE FUNCTION
# ============================================================

def calculate_physical_social_coherence(
    event_type: str,
    latitude: float,
    longitude: float,
    city: Optional[str] = None
) -> dict:

    """
    Cross-validates a citizen weather report against
    physical weather observations.

    Returns a structured coherence result.
    """

    weather = fetch_physical_weather(
        latitude,
        longitude
    )


    if weather is None:

        return {
            "coherent": False,
            "coherence_score": 0,
            "trust_boost": 0,
            "status": "UNAVAILABLE",
            "reason": "Physical weather data unavailable.",
            "weather": None
        }


    coherent, explanation, physical_score = (
        analyse_physical_conditions(
            event_type,
            weather
        )
    )


    # ========================================================
    # TRUST BOOST
    # ========================================================

    if physical_score >= 90:

        trust_boost = 20
        status = "STRONG_COHERENCE"

    elif physical_score >= 60:

        trust_boost = 10
        status = "PARTIAL_COHERENCE"

    else:

        trust_boost = 0
        status = "LOW_COHERENCE"


    return {

        "coherent": coherent,

        "coherence_score": physical_score,

        "trust_boost": trust_boost,

        "status": status,

        "reason": explanation,

        "weather": {

            "temperature":
                weather.get("temperature_2m"),

            "humidity":
                weather.get("relative_humidity_2m"),

            "precipitation":
                weather.get("precipitation"),

            "rain":
                weather.get("rain"),

            "wind_speed":
                weather.get("wind_speed_10m"),

            "wind_gust":
                weather.get("wind_gusts_10m"),

            "weather_code":
                weather.get("weather_code")

        }

    }