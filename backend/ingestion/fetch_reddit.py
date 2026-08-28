import os
import sys
import random
from datetime import datetime, timezone, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from supabase_client import get_supabase_client
from ml.classify import classify_event
from ml.trust_score import calculate_trust_score

REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "NationalWeatherAnalytics/1.0")

MOCK_REDDIT_POSTS = [
    {"subreddit": "r/india", "title": "Heavy waterlogging near Silk Board Bengaluru after midnight rain", "city": "Bengaluru", "state": "Karnataka", "lat": 12.9172, "lng": 77.6228},
    {"subreddit": "r/IndiaWeather", "title": "IMD issues red alert for Mumbai monsoon rainfall tomorrow", "city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"subreddit": "r/india", "title": "Dense fog causing zero visibility near IGI Airport Delhi today", "city": "Delhi", "state": "Delhi", "lat": 28.5562, "lng": 77.1000},
    {"subreddit": "r/IndiaWeather", "title": "Scorching heatwave in Jaipur touches 45 deg C today", "city": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    {"subreddit": "r/india", "title": "Thunderstorm and lightning strikes reported across Hyderabad suburbs", "city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867}
]

def fetch_reddit_weather_reports():
    reports = []
    now = datetime.now(timezone.utc)
    
    if REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET:
        try:
            import praw
            print("[*] Connecting to Reddit API via PRAW...")
            reddit = praw.Reddit(
                client_id=REDDIT_CLIENT_ID,
                client_secret=REDDIT_CLIENT_SECRET,
                user_agent=REDDIT_USER_AGENT
            )
            subreddits = ["india", "IndiaWeather", "mumbai", "bangalore", "delhi"]
            keywords = ["rain", "flood", "heatwave", "storm", "fog", "weather", "monsoon"]
            
            for sub in subreddits:
                subreddit = reddit.subreddit(sub)
                for post in subreddit.search(" OR ".join(keywords), limit=10):
                    text = f"{post.title} {post.selftext[:150]}"
                    event_type = classify_event(text)
                    score, status = calculate_trust_score(
                        source="reddit",
                        text_content=text,
                        has_photo=bool(post.url and ('.jpg' in post.url or '.png' in post.url)),
                        has_video=False,
                        latitude=20.5937, # Default center fallback
                        longitude=78.9629,
                        is_duplicate=False
                    )
                    reports.append({
                        "source": "reddit",
                        "text_content": text,
                        "event_type": event_type,
                        "city": sub.capitalize(),
                        "state": "India",
                        "latitude": 20.5937,
                        "longitude": 78.9629,
                        "photo_url": post.url if ('.jpg' in post.url or '.png' in post.url) else None,
                        "posted_at": datetime.fromtimestamp(post.created_utc, timezone.utc).isoformat(),
                        "verification_status": status,
                        "trust_score": score,
                        "is_duplicate": False,
                        "created_at": now.isoformat()
                    })
        except Exception as e:
            print(f"[!] PRAW API fetch failed: {e}. Falling back to mock Reddit posts.")
            
    if not reports:
        print("[*] Using mock Reddit weather post generator...")
        for item in MOCK_REDDIT_POSTS:
            event_type = classify_event(item["title"])
            score, status = calculate_trust_score(
                source="reddit",
                text_content=item["title"],
                has_photo=True,
                has_video=False,
                latitude=item["lat"],
                longitude=item["lng"],
                is_duplicate=False
            )
            reports.append({
                "source": "reddit",
                "text_content": f"[{item['subreddit']}] {item['title']}",
                "event_type": event_type,
                "city": item["city"],
                "state": item["state"],
                "latitude": item["lat"],
                "longitude": item["lng"],
                "photo_url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
                "posted_at": (now - timedelta(hours=random.randint(1, 48))).isoformat(),
                "verification_status": status,
                "trust_score": score,
                "is_duplicate": False,
                "created_at": now.isoformat()
            })

    print(f"[+] Processed {len(reports)} Reddit reports.")
    
    supabase = get_supabase_client()
    if supabase and reports:
        try:
            supabase.table("reports").insert(reports).execute()
            print("[✓] Reddit reports saved to Supabase!")
        except Exception as e:
            print(f"[!] Error inserting Reddit reports to Supabase: {e}")

if __name__ == "__main__":
    fetch_reddit_weather_reports()
