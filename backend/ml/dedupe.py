from difflib import SequenceMatcher
from datetime import datetime, timedelta, timezone

SIMILARITY_THRESHOLD = 0.85

def check_duplicate(new_text: str, new_city: str, recent_reports: list) -> bool:
    """
    Compares new report text against recent reports from the same city (within last 24h).
    Returns True if similarity > 0.85, else False.
    
    `recent_reports` should be a list of dictionaries/objects containing 'text_content', 'city', and 'posted_at'.
    """
    if not new_text or not recent_reports:
        return False
        
    normalized_new_text = new_text.strip().lower()
    
    for report in recent_reports:
        # Check matching city (case-insensitive)
        report_city = report.get('city', '').strip().lower()
        if report_city != new_city.strip().lower():
            continue
            
        existing_text = report.get('text_content', '').strip().lower()
        if not existing_text:
            continue
            
        # Measure text similarity
        similarity = SequenceMatcher(None, normalized_new_text, existing_text).ratio()
        if similarity >= SIMILARITY_THRESHOLD:
            return True
            
    return False
