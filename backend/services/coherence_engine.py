# ============================================================
# PHYSICAL-SOCIAL COHERENCE ENGINE
# Rule-based validation of citizen reports
# against official weather observations
# ============================================================


def calculate_coherence(
    event_type: str,
    rainfall: float = 0,
    temperature: float = 0,
    wind_speed: float = 0,
    humidity: float = 0,
    thunderstorm: bool = False
):
    """
    Compare citizen-reported weather event
    with official weather observations.

    Returns:
        coherence level
        score
        trust adjustment
        explanation
    """

    event = event_type.strip().lower()

    rainfall = float(rainfall or 0)
    temperature = float(temperature or 0)
    wind_speed = float(wind_speed or 0)

    # --------------------------------------------------------
    # FLOOD
    # --------------------------------------------------------

    if event in ["flood", "waterlogging", "heavy rain"]:

        if rainfall >= 20:
            return {
                "coherence": "HIGH",
                "score": 100,
                "trust_adjustment": 20,
                "reason": (
                    f"Official rainfall of {rainfall:.1f} mm "
                    "strongly supports the citizen report."
                )
            }

        elif rainfall >= 10:
            return {
                "coherence": "MEDIUM",
                "score": 70,
                "trust_adjustment": 10,
                "reason": (
                    f"Official rainfall of {rainfall:.1f} mm "
                    "partially supports the reported condition."
                )
            }

        else:
            return {
                "coherence": "LOW",
                "score": 20,
                "trust_adjustment": -10,
                "reason": (
                    f"Official rainfall is only {rainfall:.1f} mm, "
                    "which does not strongly support the report."
                )
            }

    # --------------------------------------------------------
    # HEATWAVE
    # --------------------------------------------------------

    if event in ["heatwave", "extreme heat"]:

        if temperature >= 40:
            return {
                "coherence": "HIGH",
                "score": 100,
                "trust_adjustment": 20,
                "reason": (
                    f"Official temperature of {temperature:.1f}°C "
                    "strongly supports a heatwave report."
                )
            }

        elif temperature >= 35:
            return {
                "coherence": "MEDIUM",
                "score": 70,
                "trust_adjustment": 10,
                "reason": (
                    f"Official temperature of {temperature:.1f}°C "
                    "partially supports the heatwave report."
                )
            }

        else:
            return {
                "coherence": "LOW",
                "score": 20,
                "trust_adjustment": -10,
                "reason": (
                    f"Official temperature of {temperature:.1f}°C "
                    "does not strongly support a heatwave."
                )
            }

    # --------------------------------------------------------
    # THUNDERSTORM / LIGHTNING
    # --------------------------------------------------------

    if event in ["thunderstorm", "lightning"]:

        if thunderstorm or rainfall >= 10:
            return {
                "coherence": "HIGH",
                "score": 100,
                "trust_adjustment": 20,
                "reason": (
                    "Official weather conditions support "
                    "the reported thunderstorm."
                )
            }

        elif rainfall >= 3:
            return {
                "coherence": "MEDIUM",
                "score": 65,
                "trust_adjustment": 10,
                "reason": (
                    "Some official weather conditions "
                    "support the reported thunderstorm."
                )
            }

        else:
            return {
                "coherence": "LOW",
                "score": 20,
                "trust_adjustment": -10,
                "reason": (
                    "Official weather conditions do not "
                    "strongly support the report."
                )
            }

    # --------------------------------------------------------
    # STRONG WIND
    # --------------------------------------------------------

    if event in ["strongwind", "strong wind", "gale", "high wind"]:

        if wind_speed >= 40:
            return {
                "coherence": "HIGH",
                "score": 100,
                "trust_adjustment": 20,
                "reason": (
                    f"Official wind speed of {wind_speed:.1f} km/h "
                    "strongly supports the report."
                )
            }

        elif wind_speed >= 25:
            return {
                "coherence": "MEDIUM",
                "score": 70,
                "trust_adjustment": 10,
                "reason": (
                    f"Official wind speed of {wind_speed:.1f} km/h "
                    "partially supports the report."
                )
            }

        else:
            return {
                "coherence": "LOW",
                "score": 20,
                "trust_adjustment": -10,
                "reason": (
                    f"Official wind speed of {wind_speed:.1f} km/h "
                    "does not support strong winds."
                )
            }

    # --------------------------------------------------------
    # DEFAULT
    # --------------------------------------------------------

    return {
        "coherence": "UNKNOWN",
        "score": 50,
        "trust_adjustment": 0,
        "reason": (
            "No specific physical validation rule "
            "is available for this event type."
        )
    }