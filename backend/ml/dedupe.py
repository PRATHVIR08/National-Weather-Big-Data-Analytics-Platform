from difflib import SequenceMatcher
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    TfidfVectorizer = None
    cosine_similarity = None

SIMILARITY_THRESHOLD = 0.85

def check_duplicate(new_text: str, new_city: str, recent_reports: list) -> bool:
    """
    Compares new report text against recent reports from the same city (within last 24h).
    Uses TF-IDF Cosine Similarity with SequenceMatcher fallback.
    Returns True if similarity >= 0.85, else False.
    """
    if not new_text or not recent_reports:
        return False
        
    normalized_new_text = new_text.strip().lower()
    city_matched_texts = []
    
    for report in recent_reports:
        report_city = report.get('city', '').strip().lower()
        if report_city == new_city.strip().lower():
            existing_text = report.get('text_content', '').strip().lower()
            if existing_text:
                city_matched_texts.append(existing_text)
                
    if not city_matched_texts:
        return False
        
    # Attempt TF-IDF Cosine Similarity check if Scikit-Learn is installed
    if TfidfVectorizer and cosine_similarity:
        try:
            corpus = [normalized_new_text] + city_matched_texts
            vectorizer = TfidfVectorizer(stop_words='english').fit_transform(corpus)
            vectors = vectorizer.toarray()
            new_vec = vectors[0].reshape(1, -1)
            existing_vecs = vectors[1:]
            
            sim_scores = cosine_similarity(new_vec, existing_vecs)[0]
            if max(sim_scores) >= SIMILARITY_THRESHOLD:
                return True
        except Exception:
            pass

    # SequenceMatcher fallback
    for existing_text in city_matched_texts:
        similarity = SequenceMatcher(None, normalized_new_text, existing_text).ratio()
        if similarity >= SIMILARITY_THRESHOLD:
            return True
            
    return False
