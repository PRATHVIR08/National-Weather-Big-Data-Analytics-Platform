def calculate_trust_score(
    source: str,
    text_content: str,
    has_photo: bool,
    has_video: bool,
    latitude: float,
    longitude: float,
    is_duplicate: bool,
    ml_confidence: float = 80.0
) -> tuple[float, str]:
    """
    Calculates dynamic trust score (0-100) and maps to verification status ('verified', 'pending', 'rejected').
    
    Rules:
    - Base score: 0
    - Has photo or video: +20
    - Source is government/IMD: +40
    - Text length > 20 chars: +10
    - Has GPS coordinates: +15
    - High ML Model Confidence (>= 80%): +15 bonus
    - Duplicate penalty: -50
    """
    score = 0.0
    
    # 1. Media attachment check (+20)
    if has_photo or has_video:
        score += 20.0
        
    # 2. Source check (+40)
    source_lower = (source or "").strip().lower()
    if source_lower in ["imd", "government", "official", "gov"]:
        score += 40.0
    elif source_lower == "kaggle_seed":
        score += 35.0
        
    # 3. Text content quality (+10)
    if text_content and len(text_content.strip()) > 20:
        score += 10.0
        
    # 4. GPS Coordinates presence (+15)
    if latitude != 0.0 or longitude != 0.0:
        if -90 <= latitude <= 90 and -180 <= longitude <= 180:
            score += 15.0
            
    # 5. ML Model Confidence Bonus (+15)
    if ml_confidence >= 80.0:
        score += 15.0
    elif ml_confidence >= 60.0:
        score += 8.0
        
    # 6. Duplicate penalty (-50)
    if is_duplicate:
        score -= 50.0
        
    # Clamp score between 0 and 100
    final_score = max(0.0, min(100.0, score))
    
    # Determine status
    if final_score >= 70.0:
        status = "verified"
    elif final_score >= 40.0:
        status = "pending"
    else:
        status = "rejected"
        
    return final_score, status
