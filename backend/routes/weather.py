from fastapi import APIRouter, HTTPException

from services.weather import fetch_weather_for_locations


router = APIRouter(
    prefix="/weather",
    tags=["Live Weather"]
)


@router.get("/live")
async def get_live_weather():
    """
    Returns current weather conditions
    for configured Indian cities.
    """

    try:
        weather_data = await fetch_weather_for_locations()

        return {
            "success": True,
            "source": "Open-Meteo",
            "count": len(weather_data),
            "data": weather_data
        }

    except Exception as e:
        print(f"[ERROR] Live weather API failed: {e}")

        raise HTTPException(
            status_code=502,
            detail=f"Unable to fetch live weather data: {str(e)}"
        )