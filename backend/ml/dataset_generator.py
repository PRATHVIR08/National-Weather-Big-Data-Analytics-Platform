import os
import csv
import random

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

CATEGORIES_TEMPLATES = {
    "Flood": [
        "Incessant rainfall leading to severe waterlogging on main roads in {city}. Water levels reaching 2 feet deep.",
        "Torrential downpour has inundated low-lying residential sectors near {city}. Stranded vehicles reported.",
        "Flooding reported in {city} after 4 hours of non-stop rain. Submerged streets disrupting traffic.",
        "Heavy deluge causing river overflow and severe urban flooding in outskirts of {city}.",
        "Waterlogging reported near railway station and main bus terminus in {city}. Commuters advised to avoid.",
        "Extreme monsoon rain submerges underpasses in {city}. Emergency services responding to waterlogging."
    ],
    "Heatwave": [
        "Scorching heatwave conditions in {city} with mercury touching 44.5 degrees celsius.",
        "Sweltering heat and extreme sunstroke warnings issued for residents in {city} today.",
        "Blistering heatwave and hot dry winds blowing across {city}. Authorities issue heat advisory.",
        "Mercury hits seasonal high in {city}. High temperature causing unbearable heatwave conditions.",
        "Severe heat stroke alert active across {city}. Temperatures expected to exceed 45C tomorrow.",
        "Hot summer breeze and blistering sunshine making commute difficult in {city}."
    ],
    "Thunderstorm": [
        "Violent thunderstorm with frequent lightning strikes and sudden heavy downpour hitting {city}.",
        "Cloudburst and severe hailstorm disrupting power supply and damaging crops near {city}.",
        "Loud thunderclaps and torrential rain accompanied by high lightning activity in {city}.",
        "Intense thunderstorm activity with heavy rain and small hail reported in suburban {city}.",
        "Severe weather alert: thunderstorm with sudden wind squalls hitting {city} this evening.",
        "Continuous lightning and severe thunderclaps terrifying residents across {city}."
    ],
    "Fog": [
        "Dense winter fog reducing visibility to below 20 meters near airport road in {city}.",
        "Thick smog and mist blinding early morning commute across key highways in {city}.",
        "Zero visibility reported in {city} due to heavy blinding fog. Flight operations delayed.",
        "Misty morning and poor visibility causing slow moving traffic on arterial roads in {city}.",
        "Dense fog advisory active in {city}. Drivers urged to keep fog lights on.",
        "Smog and low visibility enveloping entire city center of {city} during early hours."
    ],
    "DustStorm": [
        "Massive dust storm sweeping through {city}, pushing thick dust clouds into residential areas.",
        "Blinding sandstorm and severe dust haze rapidly reducing visibility across {city}.",
        "Strong squall and dust storm causing tree branches to snap in outer {city}.",
        "Thick dust clouds and turbulent winds creating blinding dust haze in {city}.",
        "Sudden duststorm engulfing highway corridors near {city} with high wind speeds.",
        "Blinding dust haze and windstorm disrupting local markets in {city}."
    ],
    "StrongWind": [
        "Gale force winds and cyclone warnings issued for coastal areas surrounding {city}.",
        "Severe gusty winds uprooting large trees and damaging tin roofs in {city}.",
        "High wind gusts exceeding 75 km/h causing structural damages in commercial hubs of {city}.",
        "Tempest winds tearing through streets of {city}, downing power cables.",
        "Strong winds and high velocity squalls creating hazardous conditions in {city}.",
        "Violent windstorm knocking down hoardings and electrical poles across {city}."
    ],
    "Other": [
        "Mild overcast weather in {city} with pleasant afternoon breeze and clear skies.",
        "Normal seasonal weather condition recorded in {city} today. No warnings issued.",
        "Clear blue skies and comfortable temperature recorded across {city} today.",
        "Light scattered drizzle in parts of {city} followed by mild sunshine.",
        "Humidity levels rising slightly in {city} with moderate cloud cover.",
        "Partly cloudy sky observed in {city} with gentle evening breeze."
    ]
}

INDIAN_CITIES = [
    "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", 
    "Ahmedabad", "Pune", "Jaipur", "Lucknow", "Guwahati", "Bhubaneswar",
    "Patna", "Kochi", "Chandigarh", "Bhopal", "Surat", "Indore", "Nagpur", "Visakhapatnam"
]

def generate_dataset(total_samples: int = 1400) -> str:
    """
    Generates a rich, labeled dataset of weather report text samples for ML model training.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    filepath = os.path.join(DATA_DIR, "weather_reports_dataset.csv")
    
    rows = []
    per_category = total_samples // len(CATEGORIES_TEMPLATES)
    
    for category, templates in CATEGORIES_TEMPLATES.items():
        for _ in range(per_category):
            city = random.choice(INDIAN_CITIES)
            template = random.choice(templates)
            text = template.format(city=city)
            
            # Introduce small text variations / typos / variations to make ML robust
            if random.random() < 0.15:
                text = text.replace("severe", "heavy").replace("rain", "downpour")
            elif random.random() < 0.15:
                text = text.lower()
                
            rows.append({"text_content": text, "event_type": category})
            
    random.shuffle(rows)
    
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text_content", "event_type"])
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"[+] Generated {len(rows)} labeled samples in {filepath}")
    return filepath

if __name__ == "__main__":
    generate_dataset()
