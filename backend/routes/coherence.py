from fastapi import APIRouter, HTTPException, Query

from ml.coherence import calculate_physical_social_coherence


router = APIRouter(
    prefix="/coherence",
    tags=["Physical-Social Coherence"]
)


@router.get("/check")
def check_coherence(
    event_type: str = Query(..., description="Weather event type"),
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude"),
    city: str = Query(..., description="City name")
):
    """
    Cross-validates a citizen weather report
    against official weather data from Open-Meteo.

    Rule-based Physical-Social Coherence Engine.
    """

    # Validate coordinates
    if latitude < -90 or latitude > 90:
        raise HTTPException(
            status_code=400,
            detail="Latitude must be between -90 and 90"
        )

    if longitude < -180 or longitude > 180:
        raise HTTPException(
            status_code=400,
            detail="Longitude must be between -180 and 180"
        )

    result = calculate_physical_social_coherence(
        event_type=event_type,
        latitude=latitude,
        longitude=longitude,
        city=city
    )

    return result