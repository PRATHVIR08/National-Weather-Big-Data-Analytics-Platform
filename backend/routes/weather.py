from fastapi import APIRouter, HTTPException, Query

from services.weather import (
    fetch_weather_for_locations,
    fetch_weather_by_city,
)


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