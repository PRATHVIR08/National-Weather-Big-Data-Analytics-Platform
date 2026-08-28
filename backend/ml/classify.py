import re

KEYWORDS_MAP = {
    "Flood": [
        "flood", "flooding", "waterlogging", "waterlogged", "inundated", "inundation", 
        "overflow", "submerged", "submergence", "heavy deluge", "torrential rain"
    ],
    "Heatwave": [
        "heatwave", "heat wave", "scorching", "sweltering", "extreme heat", "sunstroke",
        "high temperature", "blistering heat", "heat stroke", "hot day", "mercury touches"
    ],
    "Thunderstorm": [
        "thunderstorm", "lightning", "thunder", "severe storm", "hailstorm", "hail",
        "cloudburst", "heavy downpour", "lightening", "thunderclap"
    ],
    "Fog": [
        "fog", "dense fog", "visibility", "smog", "mist", "misty", "zero visibility",
        "poor visibility", "blind fog", "foggy"
    ],
    "DustStorm": [
        "dust storm", "duststorm", "sandstorm", "dust haze", "blinding dust", 
        "andhi", "dust clouds", "squall dust"
    ],
    "StrongWind": [
        "strong wind", "gale", "cyclone", "squall", "gusty wind", "high winds",
        "uprooted trees", "windstorm", "tempest", "typhoon"
    ]
}

def classify_event(text: str) -> str:
    """
    Classifies a weather report text into one of the designated categories using rule-based keyword matching.
    """
    if not text:
        return "Other"
        
    text_lower = text.lower()
    
    # Calculate keyword match counts for each category
    category_scores = {}
    for category, keywords in KEYWORDS_MAP.items():
        score = 0
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                score += 2
            elif kw in text_lower:
                score += 1
        if score > 0:
            category_scores[category] = score
            
    if not category_scores:
        return "Other"
        
    # Return category with highest match score
    return max(category_scores, key=category_scores.get)
