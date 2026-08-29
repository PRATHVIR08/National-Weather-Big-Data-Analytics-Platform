import os
import re
import joblib

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

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "weather_nlp_model.pkl")
_ml_pipeline = None

def _get_ml_pipeline():
    """
    Lazy loader for trained Scikit-Learn NLP pipeline.
    """
    global _ml_pipeline
    if _ml_pipeline is None and os.path.exists(MODEL_PATH):
        try:
            _ml_pipeline = joblib.load(MODEL_PATH)
            print("[+] Loaded trained Scikit-Learn NLP Model Pipeline.")
        except Exception as e:
            print(f"[!] Could not load ML model: {e}")
    return _ml_pipeline

def classify_event_with_confidence(text: str) -> tuple[str, float]:
    """
    Classifies a weather report using trained Scikit-Learn NLP Model.
    Returns tuple: (predicted_category, confidence_probability_0_to_100).
    Falls back to rule-based keyword matcher if ML model is unavailable.
    """
    if not text or not text.strip():
        return "Other", 0.0
        
    pipeline = _get_ml_pipeline()
    if pipeline:
        try:
            prediction = pipeline.predict([text])[0]
            probabilities = pipeline.predict_proba([text])[0]
            max_prob = float(max(probabilities)) * 100.0
            return str(prediction), round(max_prob, 2)
        except Exception as e:
            print(f"[WARN] ML inference error: {e}")

    # Fallback: Rule-based keyword matching engine
    category = classify_event(text)
    confidence = 75.0 if category != "Other" else 30.0
    return category, confidence

def classify_event(text: str) -> str:
    """
    Classifies a weather report text using rule-based keyword matching fallback.
    """
    if not text:
        return "Other"
        
    text_lower = text.lower()
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
        
    return max(category_scores, key=category_scores.get)
