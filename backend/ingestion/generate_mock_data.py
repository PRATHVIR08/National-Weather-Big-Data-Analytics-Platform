import os
import sys
import random
from datetime import datetime, timedelta, timezone

# Add backend directory to module search path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from supabase_client import get_supabase_client
from ml.classify import classify_event
from ml.dedupe import check_duplicate
from ml.trust_score import calculate_trust_score

CITIES = [
    {"city": "Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    {"city": "Pune", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567},
    {"city": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714},
    {"city": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    {"city": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462},
    {"city": "Guwahati", "state": "Assam", "lat": 26.1445, "lng": 91.7362},
    {"city": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lng": 85.8245}
]

EVENT_TEMPLATES = {
    "Flood": [
        "Severe waterlogging reported near {location} after 3 hours of incessant rain. Vehicles stranded.",
        "Inundation on main road in {location}. Water levels reaching knee height in low-lying areas.",
        "Heavy deluge causing massive flooding in residential sectors around {location}.",
        "Submerged streets reported by citizens in {location}. Traffic movement completely halted."
    ],
    "Heatwave": [
        "Extreme scorching heat wave conditions in {location}. Temperature touches 44.5°C today.",
        "Sweltering heatwave warning issued for {location}. High humidity and blistering sunshine.",
        "Hot dry winds blowing across {location}. Local authorities advise staying indoors.",
        "Mercury hits record high in {location} with severe heat wave advisory active."
    ],
    "Thunderstorm": [
        "Severe thunderstorm accompanied by frequent lightning strikes and heavy downpour in {location}.",
        "Violent cloudburst and hail storm hitting {location} right now. High gusty winds reported.",
        "Loud thunderclaps and heavy torrential rain disrupting power supply across {location}.",
        "Heavy downpour with intense thunderstorm activity recorded in {location}."
    ],
    "Fog": [
        "Dense fog reducing visibility to under 20 meters near airport road in {location}.",
        "Thick smog and mist blinding morning commute in {location}. Flights delayed.",
        "Zero visibility reported on highways leading to {location} due to dense winter fog.",
        "Heavy morning fog causing slow traffic movement across key corridors in {location}."
    ],
    "DustStorm": [
        "Massive dust storm sweeping across {location}. High winds pushing dust clouds into city center.",
        "Blinding sandstorm and strong dust haze reducing visibility rapidly in {location}.",
        "Squall and dust storm causing minor tree branch damages in outskirts of {location}.",
        "Thick dust haze engulfing {location} following intense wind turbulence."
    ],
    "StrongWind": [
        "Gale force winds and cyclone warnings active in coastal zones near {location}.",
        "Uprooted trees and fallen signboards reported in {location} due to severe gusty winds.",
        "High wind gusts exceeding 70 km/h tearing through commercial hubs in {location}.",
        "Tempest winds causing structural damage and power line disruptions in {location}."
    ]
}

SOURCES = ["citizen", "reddit", "imd", "kaggle_seed"]

SAMPLE_MEDIA_PHOTOS = [
    "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1561484930-998b6a7b22e8?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?auto=format&fit=crop&w=600&q=80",
    None
]

def generate_mock_reports(count: int = 300):
    print(f"[*] Generating {count} synthetic weather reports for Indian cities...")
    reports = []
    now = datetime.now(timezone.utc)
    
    for i in range(count):
        loc_info = random.choice(CITIES)
        event = random.choice(list(EVENT_TEMPLATES.keys()))
        template = random.choice(EVENT_TEMPLATES[event])
        
        # Add slight jitter to latitude and longitude (within ~10-15km)
        lat_jitter = loc_info["lat"] + random.uniform(-0.08, 0.08)
        lng_jitter = loc_info["lng"] + random.uniform(-0.08, 0.08)
        
        # Random timestamp across last 30 days
        days_ago = random.uniform(0, 30)
        posted_at = (now - timedelta(days=days_ago)).isoformat()
        
        sub_loc = random.choice(["Sector 4", "Main Junction", "Railway Station Road", "Ring Road", "Airport Highway", "City Center"])
        text = template.format(location=f"{sub_loc}, {loc_info['city']}")
        
        source = random.choice(SOURCES)
        photo_url = random.choice(SAMPLE_MEDIA_PHOTOS) if random.random() > 0.4 else None
        video_url = None
        
        # Determine classification & trust
        classified_event = classify_event(text)
        
        # Simulate slight duplicate chance
        is_dup = (i > 10 and random.random() < 0.08)
        
        has_p = bool(photo_url)
        trust_score, status = calculate_trust_score(
            source=source,
            text_content=text,
            has_photo=has_p,
            has_video=False,
            latitude=lat_jitter,
            longitude=lng_jitter,
            is_duplicate=is_dup
        )
        
        report = {
            "source": source,
            "text_content": text,
            "event_type": classified_event,
            "city": loc_info["city"],
            "state": loc_info["state"],
            "latitude": round(lat_jitter, 6),
            "longitude": round(lng_jitter, 6),
            "photo_url": photo_url,
            "video_url": video_url,
            "posted_at": posted_at,
            "verification_status": status,
            "trust_score": trust_score,
            "is_duplicate": is_dup,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        reports.append(report)
        
    print(f"[+] Successfully generated {len(reports)} reports.")
    
    # Try inserting into Supabase database
    supabase = get_supabase_client()
    if supabase:
        try:
            print("[*] Inserting mock reports into Supabase `reports` table in batches...")
            batch_size = 50
            for b in range(0, len(reports), batch_size):
                chunk = reports[b:b+batch_size]
                supabase.table("reports").insert(chunk).execute()
            print("[OK] Supabase database populated successfully!")
            return
        except Exception as e:
            print(f"[!] Could not insert into Supabase: {e}")
            
    print("[!] Supabase not connected or error occurred. Saved batch locally for fallback.")

if __name__ == "__main__":
    generate_mock_reports(300)
