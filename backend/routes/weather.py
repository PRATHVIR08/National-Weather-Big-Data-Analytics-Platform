from fastapi import APIRouter
from services.weather import fetch_weather_for_locations

router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)


@router.get("/live")
async def get_live_weather():
    """
    Fetch live weather for multiple major Indian cities.
    """

    try:
        weather = await fetch_weather_for_locations()

        return {
            "success": True,
            "count": len(weather),
            "data": weather
        }

    except Exception as e:
        return {
            "success": False,
            "count": 0,
            "data": [],
            "error": str(e)
        }