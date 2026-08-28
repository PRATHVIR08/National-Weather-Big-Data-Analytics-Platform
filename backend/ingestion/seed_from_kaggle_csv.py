import os
import sys
import csv
import random
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from supabase_client import get_supabase_client
from ml.classify import classify_event
from ml.trust_score import calculate_trust_score

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

SAMPLE_CITIES = [
    {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    {"city": "Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"city": "Guwahati", "state": "Assam", "lat": 26.1445, "lng": 91.7362}
]

def ensure_sample_csv_exists():
    os.makedirs(DATA_DIR, exist_ok=True)
    sample_file = os.path.join(DATA_DIR, "rainfall_india_sample.csv")
    if not os.path.exists(sample_file):
        print(f"[*] Creating sample Kaggle CSV file at {sample_file}...")
        headers = ["SUBDIVISION", "YEAR", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "ANNUAL"]
        rows = [
            ["SUB HIMALAYAN WEST BENGAL & SIKKIM", "2015", "12.4", "23.5", "54.1", "120.3", "310.2", "540.6", "680.1", "520.4", "380.2", "90.1", "15.4", "5.2", "2752.5"],
            ["KONKAN & GOA", "2015", "0.1", "0.0", "1.2", "4.5", "18.2", "720.4", "950.3", "610.2", "340.5", "110.2", "12.1", "0.5", "2768.2"],
            ["TAMIL NADU", "2015", "15.2", "8.4", "22.1", "45.6", "95.1", "80.2", "110.4", "130.5", "140.2", "380.6", "520.1", "310.4", "1858.8"],
            ["COASTAL KARNATAKA", "2015", "1.0", "0.5", "10.2", "35.4", "140.5", "890.1", "1120.4", "780.2", "410.6", "180.2", "30.1", "2.5", "3601.7"],
            ["ASSAM & MEGHALAYA", "2015", "18.5", "32.1", "68.4", "150.2", "340.5", "610.2", "730.5", "580.4", "410.2", "120.5", "20.1", "10.2", "3091.6"]
        ]
        with open(sample_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(rows)

def process_kaggle_csvs():
    ensure_sample_csv_exists()
    
    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".csv")]
    print(f"[*] Found {len(files)} CSV datasets in {DATA_DIR}")
    
    reports_to_insert = []
    now = datetime.now(timezone.utc)
    
    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        print(f"[*] Processing dataset: {filename}")
        
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= 50: # Limit rows per file for demo seed speed
                    break
                    
                loc = random.choice(SAMPLE_CITIES)
                subdiv = row.get("SUBDIVISION", row.get("City", loc["city"]))
                annual_rain = row.get("ANNUAL", row.get("rainfall", "1200"))
                
                text_content = f"Official Kaggle seed data: Historical weather metrics recorded for {subdiv}. Annual rainfall level registered at {annual_rain} mm."
                event_type = classify_event("heavy rainfall flood waterlogging monsoon")
                
                posted_at = (now - timedelta(days=random.uniform(1, 180))).isoformat()
                
                score, status = calculate_trust_score(
                    source="kaggle_seed",
                    text_content=text_content,
                    has_photo=False,
                    has_video=False,
                    latitude=loc["lat"],
                    longitude=loc["lng"],
                    is_duplicate=False
                )
                
                reports_to_insert.append({
                    "source": "kaggle_seed",
                    "text_content": text_content,
                    "event_type": event_type,
                    "city": loc["city"],
                    "state": loc["state"],
                    "latitude": loc["lat"],
                    "longitude": loc["lng"],
                    "posted_at": posted_at,
                    "verification_status": status,
                    "trust_score": score,
                    "is_duplicate": False,
                    "created_at": datetime.now(timezone.utc).isoformat()
                })

    print(f"[+] Formatted {len(reports_to_insert)} Kaggle seed reports.")
    
    supabase = get_supabase_client()
    if supabase and reports_to_insert:
        try:
            supabase.table("reports").insert(reports_to_insert).execute()
            print("[✓] Kaggle seed dataset populated to Supabase!")
        except Exception as e:
            print(f"[!] Error seeding Kaggle data into database: {e}")

if __name__ == "__main__":
    process_kaggle_csvs()
