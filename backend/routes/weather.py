from fastapi import APIRouter, HTTPException, Query

from services.weather import (
    fetch_weather_for_locations,
    fetch_weather_by_city,
)
from services.agri_advisory import fetch_agri_advisory


router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)


# ============================================================
# LIVE WEATHER
# ============================================================

@router.get("/live")
async def get_live_weather():
    """
    Fetch live weather for configured Indian locations.
    """

    try:

        data = await fetch_weather_for_locations()

        return {
            "success": True,
            "data": data
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch live weather: {str(e)}"
        )


# ============================================================
# CITY WEATHER SEARCH
# ============================================================

@router.get("/city")
async def get_city_weather(
    city: str = Query(
        ...,
        min_length=2,
        description="Indian city name"
    )
):
    """
    Search any Indian city dynamically and
    return its current weather.
    """

    try:

        data = await fetch_weather_by_city(city)

        return data

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Weather service error: {str(e)}"
        )


# ============================================================
# AGRI-ADVISORY & SOIL FORECAST (72 HOURS)
# ============================================================

@router.get("/agri-advisory")
async def get_agri_advisory(
    city: str = Query("Bengaluru", description="Indian city name for Agri-Advisory forecast")
):
    """
    Fetch 72-hour soil moisture, soil temperature, and relative humidity forecast,
    and generate rule-based crop advisories.
    """
    try:
        data = await fetch_agri_advisory(city)
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate agri-advisory: {str(e)}"
        )


# ============================================================
# PAN-INDIA DOPPLER RADAR MOSAIC STITCHING (DEMO METADATA)
# ============================================================

@router.get("/radar-mosaic")
async def get_doppler_radar_mosaic():
    """
    Fetch metadata and station network status for Pan-India Doppler Weather Radar (DWR) 
    Mosaic composite stitching.
    """
    try:
        mosaic_data = {
            "title": "Pan-India Composite Doppler Weather Radar (DWR) Mosaic",
            "provider": "IMD / National Weather Big Data Analytics Platform",
            "update_interval_mins": 10,
            "bounding_box": {
                "southWest": [6.5, 68.0],
                "northEast": [35.5, 97.0]
            },
            "legend_dbz": [
                {"range": "15-25 dBZ", "color": "#00e5ff", "label": "Light Rain"},
                {"range": "25-35 dBZ", "color": "#00e676", "label": "Moderate Rain"},
                {"range": "35-45 dBZ", "color": "#ffeb3b", "label": "Heavy Rain"},
                {"range": "45-55 dBZ", "color": "#ff5722", "label": "Severe Storm"},
                {"range": "55+ dBZ", "color": "#d500f9", "label": "Extreme / Hail"}
            ],
            "stations": [
                {"id": "DEL", "name": "DWR New Delhi", "lat": 28.6139, "lon": 77.2090, "status": "ACTIVE", "type": "S-Band", "range_km": 500, "max_dbz": 54},
                {"id": "BOM", "name": "DWR Mumbai", "lat": 19.0760, "lon": 72.8777, "status": "ACTIVE", "type": "C-Band", "range_km": 500, "max_dbz": 48},
                {"id": "CCU", "name": "DWR Kolkata", "lat": 22.5726, "lon": 88.3639, "status": "ACTIVE", "type": "S-Band", "range_km": 500, "max_dbz": 58},
                {"id": "MAA", "name": "DWR Chennai", "lat": 13.0827, "lon": 80.2707, "status": "ACTIVE", "type": "S-Band", "range_km": 500, "max_dbz": 42},
                {"id": "BLR", "name": "DWR Bengaluru", "lat": 12.9716, "lon": 77.5946, "status": "ACTIVE", "type": "C-Band", "range_km": 500, "max_dbz": 38},
                {"id": "HYD", "name": "DWR Hyderabad", "lat": 17.3850, "lon": 78.4867, "status": "ACTIVE", "type": "C-Band", "range_km": 500, "max_dbz": 45},
                {"id": "GAU", "name": "DWR Guwahati", "lat": 26.1445, "lon": 91.7362, "status": "ACTIVE", "type": "C-Band", "range_km": 500, "max_dbz": 52},
                {"id": "NAG", "name": "DWR Nagpur", "lat": 21.1458, "lon": 79.0882, "status": "ACTIVE", "type": "S-Band", "range_km": 500, "max_dbz": 40}
            ]
        }
        return {
            "success": True,
            "data": mosaic_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch radar mosaic metadata: {str(e)}"
        )
