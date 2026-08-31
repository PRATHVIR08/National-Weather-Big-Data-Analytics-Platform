# National Weather Big Data Analytics Platform 

A full-stack web application designed to collect, verify, categorize, and visualize real-time weather-related reports across India (rainfall, flooding, thunderstorms, heatwaves, fog, dust storms, strong winds) sourced from social media (Reddit), public Kaggle datasets, IMD government feeds, and citizen crowd-reports.

---

## 🏗️ Architecture Overview

```
                      +-----------------------------------+
                      |      Frontend (HTML/CSS/JS)       |
                      |  - index.html (Live Dashboard)    |
                      |  - report.html (Citizen Form)     |
                      |  - admin.html (Admin Control)     |
                      +-----------------+-----------------+
                                        |
              HTTP REST / Upload        | Supabase Realtime (Websocket)
                                        v
    +-----------------------------+   +-----------------------------+
    |    FastAPI Backend Server   |   |   Supabase Postgres & Auth  |
    | - Ingestion (Kaggle/Reddit) |   | - Table: reports            |
    | - ML (Classify/Dedupe/Trust)|   | - Storage: weather-media    |
    | - REST API Endpoints        |---| - Auth: Admin JWT           |
    +-----------------------------+   +-----------------------------+
```

---

## 🛠️ Tech Stack

- **Frontend:** Plain HTML5, Vanilla CSS3 (Custom Dark Glassmorphic Design System), Plain JavaScript (ES6+).
- **Backend:** Python 3.10+ & FastAPI.
- **Database:** Supabase (Hosted PostgreSQL) using `supabase-py` client.
- **File Storage:** Supabase Storage (`weather-media` public bucket).
- **Auth:** Supabase Auth (Email/Password login for Admin Panel).
- **Live Updates:** Supabase Realtime (Websocket subscription on `postgres_changes` for `reports` table).
- **Maps & GIS:** Leaflet.js + OpenStreetMap / CartoDB Dark Tiles + Pan-India Doppler Weather Radar (DWR) Mosaic Engine.
- **Charts & Visualizations:** Chart.js.
- **Machine Learning & NLP Pipelines:**
  - **Scikit-Learn NLP Classifier:** `TfidfVectorizer` (N-grams 1-2) + `LogisticRegression` pipeline trained on 1,400+ labeled weather report text samples (`Flood`, `Heatwave`, `Thunderstorm`, `Fog`, `DustStorm`, `StrongWind`, `Other`) with confidence probability output.
  - **Semantic Deduplication Engine:** TF-IDF Cosine Similarity vectorizer + `difflib.SequenceMatcher` (>0.85 threshold on recent reports from the same city within 24 hours).
  - **Dynamic ML Trust Score Evaluator (0–100):** Weighted scoring engine (Photo/Video +20, IMD/Government source +40, Detailed text > 20 chars +10, GPS location +15, ML Confidence boost +15, Duplicate penalty -50). Auto-verifies score ≥ 70, pending for 40–69, rejects < 40.

---

## 🚀 Team Quick Start & Local Setup Guide

Follow these steps to set up, install dependencies, and run the project locally.

### 📋 Prerequisites
Make sure you have installed on your computer:
- **Git** ([Download Git](https://git-scm.com/))
- **Python 3.10+** ([Download Python](https://www.python.org/))

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/PRATHVIR08/National-Weather-Big-Data-Analytics-Platform.git
cd National-Weather-Big-Data-Analytics-Platform
```

---

### Step 2: Set Up Python Virtual Environment

Create and activate a virtual environment for the project:

#### On Windows (Command Prompt / PowerShell):
```powershell
python -m venv venv
venv\Scripts\activate
```

#### On macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

---

### Step 3: Install Backend Dependencies

Install all required Python packages (including Scikit-Learn and Joblib):

```bash
cd backend
pip install -r requirements.txt
```

*(Installed packages include `fastapi`, `uvicorn`, `supabase`, `scikit-learn`, `joblib`, `python-dotenv`, `pydantic`, `praw`, `requests`, `python-multipart`, `PyJWT`)*

---

### Step 4: Configure Environment Variables

1. Inside the `backend/` directory, copy `.env.example` to create your `.env` file:

```bash
cp .env.example .env
```

2. Open `backend/.env` in your text editor and fill in your Supabase credentials:

```ini
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

3. Open `frontend/js/supabase-config.js` and set the public Supabase parameters:

```javascript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
```

---

### Step 5: Database Setup (Supabase SQL Schema)

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Go to the **SQL Editor** tab.
3. Open [`backend/schema.sql`](file:///c:/Users/R%20S%20Prathvir/Desktop/projects/National%20Weather%20Big%20Data%20Analytics%20Platform/backend/schema.sql) from your local repository, copy all contents, paste into the Supabase SQL Editor, and click **Run**.

*This script automatically creates the `reports` table, performance indexes, RLS security policies, Realtime publication, and the `weather-media` storage bucket.*

---

### Step 6: Train the ML Model & Populate Seed Data

1. **Train the NLP ML Model**:
   Run the model trainer to generate the 1,400+ sample dataset and train the Scikit-Learn NLP model (`weather_nlp_model.pkl`):

   ```bash
   # From inside the backend directory
   python ml/train_classifier.py
   ```

2. **Populate Database with Seed Data**:
   Run the ingestion scripts to seed 300+ synthetic Indian weather reports, historical Kaggle rainfall metrics, and social media posts:

   ```bash
   python ingestion/generate_mock_data.py
   python ingestion/seed_from_kaggle_csv.py
   python ingestion/fetch_reddit.py
   ```

---

### Step 7: Start the FastAPI Backend Server

Start the backend API server:

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **Backend API Base URL:** `http://localhost:8000`
- **Interactive OpenAPI Documentation (Swagger UI):** `http://localhost:8000/docs`

---

### Step 8: Serve the Frontend Application

Open a **new terminal window**, navigate to the project root, and serve the `frontend/` folder:

```bash
cd frontend
python -m http.server 3000
```

Open your browser and navigate to:
- 📊 **Live Dashboard & Map:** `http://localhost:3000/index.html`
- 📝 **Citizen Incident Report Form:** `http://localhost:3000/report.html`
- 🔒 **Admin Verification Portal:** `http://localhost:3000/admin.html`

---

## 🧪 Local Testing & Verification Checklist

To test all major features end-to-end:

1. **Verify Map & Data Visualizations (`index.html`):**
   - Open `http://localhost:3000/index.html`.
   - Verify weather markers are visible across India on the Leaflet map.
   - Test event category filter (e.g. *Flood*, *Heatwave*, *Thunderstorm*) and location search.
   - Verify Chart.js bar and doughnut charts update dynamically.

2. **Test ML Incident Categorization & Trust Score (`report.html`):**
   - Open `http://localhost:3000/report.html`.
   - Click **📍 Capture Current GPS Location** to capture coordinates.
   - Attach a photo/video evidence file (tests upload to Supabase Storage `weather-media`).
   - Enter an incident description (e.g. *"Extreme waterlogging and flood on Ring Road"*).
   - Submit and confirm that the Scikit-Learn ML Model categorizes the event and calculates the dynamic Trust Score.

3. **Test Realtime Websocket Push (`index.html`):**
   - Open `index.html` in Tab 1 and submit a new report in `report.html` in Tab 2.
   - Verify that Tab 1 receives the Realtime event push and updates the live map automatically without requiring a page refresh.

4. **Test Admin Verification Queue (`admin.html`):**
   - Open `http://localhost:3000/admin.html`.
   - Sign in (or use dev credentials).
   - Review pending reports in the queue and test 1-click **✓ Verify** and **✕ Reject** buttons.

5. **Test 72-Hour Agri-Advisory & Soil Health Engine (`index.html`):**
   - Scroll to the **🌾 72-Hour Agri-Advisory & Soil Health** section at the bottom of `index.html`.
   - Search for any Indian agricultural city (e.g. `Ludhiana`, `Pune`, `Bhopal`, `Bengaluru`, `Nashik`).
   - Click **🔍 Fetch Advisory**.
   - Verify topsoil moisture ($0\text{--}7\text{ cm}$), soil temperature, relative humidity, and 72-hour rain accumulation.
   - Inspect the 4 automated agronomic crop advisory cards (**Irrigation**, **Disease/Pest Threat**, **Soil Aeration**, and **Field Spray Window**).
   - Hover over the dual-axis **72-Hour Trend Line Chart** to analyze hourly soil moisture vs. atmospheric humidity trends.

---

## 🤖 ML Dataset & Model Management

If team members want to add custom datasets or retrain the ML model:

1. **Adding Custom Training Datasets**:
   - Place training dataset CSV files into `backend/ml/data/` (columns required: `text_content`, `event_type`).

2. **Retraining the Model**:
   - Run `python ml/train_classifier.py` inside `backend/`. This trains the model and saves the updated pipeline artifact to `backend/ml/models/weather_nlp_model.pkl`.

---

## 📖 Backend API Reference

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/reports` | Public | Ingest new report. Runs ML NLP classification, TF-IDF deduplication, and trust score computation. |
| `GET` | `/reports` | Public / Admin | Filter & list weather reports. Public sees `verified` reports only; Admin JWT sees all. |
| `POST` | `/reports/upload` | Public | Upload photo/video evidence to Supabase Storage `weather-media` bucket (with local fallback). |
| `GET` | `/admin/pending` | Admin JWT | List reports flagged as `pending` review. |
| `POST` | `/admin/verify/{id}` | Admin JWT | Approves report and sets status to `verified`. |
| `POST` | `/admin/reject/{id}` | Admin JWT | Rejects report and sets status to `rejected`. |
| `POST` | `/admin/dispatch-alert` | Admin / Demo | Trigger multi-channel CAP emergency broadcast (SMS & Email) with OASIS CAP v1.2 XML receipt. |
| `GET` | `/weather/live` | Public | Fetch live weather for configured Indian locations using Open-Meteo API. |
| `GET` | `/weather/city` | Public | Dynamic weather search by city name. |
| `GET` | `/weather/agri-advisory` | Public | Fetch 72-hour soil moisture/temp & humidity forecast with automated agronomic crop advisories. |

---

## 📁 Directory Structure

```
.
├── .gitignore                    (Excludes .env and temporary environment files)
├── README.md                     (Project documentation & setup guide)
├── backend/
│   ├── main.py                   (FastAPI application entrypoint & CORS config)
│   ├── supabase_client.py        (Supabase client initialization & JWT validation)
│   ├── schemas.py                (Pydantic request/response models)
│   ├── schema.sql                (Postgres database & storage initialization script)
│   ├── routes/
│   │   ├── reports.py            (Report ingestion, filtering & upload endpoints)
│   │   ├── admin.py              (Protected admin verification & CAP dispatch endpoints)
│   │   └── weather.py            (Live weather & Agri-advisory endpoints)
│   ├── services/
│   │   ├── agri_advisory.py      (72-hour soil/humidity engine & rule-based advisories)
│   │   └── cap.py                (OASIS CAP v1.2 XML generator & SMS/Email dispatch simulator)
│   ├── ml/
│   │   ├── data/                 (ML Training CSV datasets)
│   │   │   └── weather_reports_dataset.csv
│   │   ├── models/               (Trained ML Model artifacts)
│   │   │   └── weather_nlp_model.pkl
│   │   ├── dataset_generator.py  (1,400+ sample training dataset builder)
│   │   ├── train_classifier.py   (Scikit-Learn TF-IDF + Logistic Regression trainer)
│   │   ├── classify.py           (ML NLP inference engine with confidence scoring)
│   │   ├── dedupe.py             (TF-IDF Cosine Similarity semantic deduplicator)
│   │   └── trust_score.py        (Dynamic ML-weighted trust score evaluator)
│   ├── ingestion/
│   │   ├── data/                 (Raw Kaggle & seed CSV datasets)
│   │   ├── generate_mock_data.py (300+ synthetic Indian weather report generator)
│   │   ├── seed_from_kaggle_csv.py (Kaggle dataset parser & sample creator)
│   │   └── fetch_reddit.py       (PRAW Reddit weather post scraper)
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── index.html                (Public live map dashboard with Leaflet & Chart.js)
    ├── report.html               (Citizen report submission form with GPS & media upload)
    ├── admin.html                (Admin authentication & pending verification portal)
    ├── css/
    │   └── style.css             (Custom glassmorphic dark design system)
    └── js/
        ├── supabase-config.js    (Supabase JS SDK configuration)
        ├── api.js                (REST API fetch wrapper service layer)
        ├── map.js                (Leaflet.js interactive map & custom pins)
        ├── charts.js             (Chart.js bar & doughnut charts)
        └── realtime.js           (Supabase Realtime subscription listener)
```
Live Weather Monitoring

The platform provides real-time weather monitoring across major cities in India. A predefined geographical dataset containing city names, states, latitude, and longitude is used to identify monitoring locations. These coordinates are not weather data; they simply define where weather observations should be obtained. For each location, the backend dynamically queries the Open-Meteo weather API to retrieve current meteorological conditions such as temperature, apparent temperature, humidity, wind speed, precipitation, and observation time. The collected data is returned through the FastAPI /weather/live endpoint and visualized as interactive weather markers on the Leaflet-based India map. The system automatically refreshes the weather information at regular intervals, ensuring that the displayed weather conditions remain up to date.

---

## 🌾 72-Hour Soil & Humidity Agri-Advisory Feature

The platform includes an automated **Agronomic Crop Advisory Engine** designed to assist farmers, agricultural planners, and regional managers:

### 1. Soil & Weather Forecast Parameters (Open-Meteo API)
- **Topsoil Moisture ($0\text{--}7\text{ cm}$):** Measured in $\text{m}^3/\text{m}^3$ volumetric index.
- **Soil Temperature ($0\text{--}7\text{ cm}$):** Measured in $^\circ\text{C}$.
- **Relative Humidity ($2\text{ m}$):** Hourly atmospheric moisture levels (%).
- **Precipitation:** 72-hour accumulated rainfall forecast ($\text{mm}$).

### 2. Automated Agronomic Rule Engine
- **Irrigation Management:** Evaluates topsoil moisture levels. Recommends delaying irrigation when $>12\text{ mm}$ of rain is expected to avoid overwatering and save energy, or flags urgent irrigation when moisture drop below threshold ($<0.18\text{ m}^3/\text{m}^3$).
- **Disease & Pest Threat Warning:** Evaluates temperature and humidity combinations. High relative humidity ($>78\%$) and warm temperatures ($>22^\circ\text{C}$) trigger warnings for fungal spore germination (e.g. blight, mildew).
- **Soil Aeration & Saturation:** Monitors soil waterlogging risk ($>0.42\text{ m}^3/\text{m}^3$) to protect root respiration.
- **Foliar Spray & Fertilizer Window:** Detects dry periods with low wind speed ($<18\text{ km/h}$) ideal for agrochemical application.

### 3. **How to Use the Feature**
1. Launch the FastAPI backend (`python -m uvicorn main:app --reload --port 8000`).
2. Open `frontend/index.html` in your browser.
3. Navigate to the **72-Hour Agri-Advisory & Soil Health** component.
4. Enter an Indian city name (e.g., *Ludhiana*, *Nashik*, *Bengaluru*, *Bhopal*) and click **Fetch Advisory**.
5. View real-time KPI metrics, rule-generated advisory cards (`OPTIMAL`, `WARNING`, `ALERT`), and interact with the 72-hour trend line chart.

---

## 🚨 CAP Emergency Dispatch System (SMS & Email Broadcast)

The platform features an automated **CAP (OASIS Common Alerting Protocol v1.2) Emergency Broadcast System** for emergency management authorities:

### 1. OASIS CAP v1.2 Standard XML Payload
Generates fully compliant OASIS CAP v1.2 XML alert documents specifying:
- `identifier`, `sender`, `sent`, `status`, `msgType`, `scope`.
- `category` (Met), `event` (Flash Flood, Thunderstorm, Cyclone, Heatwave, Landslide).
- `urgency` (Immediate/Expected), `severity` (EXTREME/SEVERE/MODERATE), `certainty` (Observed/Likely).
- `headline`, `description`, `instruction`, `areaDesc`.

### 2. Multi-Channel Dispatch Simulation
- **📱 SMS Gateway (Twilio Mock):** Simulates targeted SMS broadcast to registered mobile subscribers in the selected region (e.g., 68,500 contacts in Punjab, 142,000 in Delhi NCR). Generates Twilio batch message SIDs.
- **📧 Email Bulletin (SMTP / SendGrid Mock):** Simulates high-priority emergency bulletin emails to registered subscribers and authorities. Generates SendGrid batch IDs.

### 3. How to Use & Test the Feature
1. Open `frontend/admin.html` in your browser.
2. Click **🚨 Launch CAP Emergency Dispatch** (or click **🚨 CAP Emergency Dispatch** inside the Admin panel).
3. Select the target region (e.g., *Punjab*, *Maharashtra*, *Delhi NCR*, *Nationwide*), choose the hazard event type (*Flash Flood Warning*), and toggle **📱 SMS** and **📧 Email**.
4. Click **🚀 Broadcast Alert Now**.
5. View the real-time delivery receipt with total population reached, SMS & Email delivery metrics, and expand the **OASIS CAP v1.2 XML Payload** drawer.

---

# Dynamic City Weather Search

## What I Implemented

Added a dynamic city weather search feature.

Users can enter any Indian city name and get its current weather using the Open-Meteo API.

The search provides:
- City and State
- Temperature
- Feels Like Temperature
- Weather Condition
- Humidity
- Wind Speed
- Wind Gust
- Rain
- Precipitation
- Cloud Cover
- Atmospheric Pressure
- Last Updated Time

The city does not need to be present in the dashboard's predefined city list. The backend automatically finds the city using Open-Meteo's geocoding service and then fetches its weather.

## Backend Setup

Go to the backend folder:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend should run at:
`http://127.0.0.1:8000`

## API Endpoint

The city weather API is:
`http://127.0.0.1:8000/weather/city?city=Mumbai`

Example:
`http://127.0.0.1:8000/weather/city?city=Bengaluru`
`http://127.0.0.1:8000/weather/city?city=Delhi`

## How It Works

1. User enters a city name in the Weather Search box.
2. Frontend sends the city name to the backend.
3. Backend uses Open-Meteo Geocoding API to find the city's coordinates.
4. Backend uses the coordinates to request current weather data.
5. Backend sends the weather data back to the frontend.
6. Frontend displays the weather information.

## Data Source

Weather data is provided by Open-Meteo. No API key is required.

---

## 🌐 Physical-Social Coherence Engine

The **Physical-Social Coherence Engine** verifies citizen weather reports in real time by cross-referencing them against official weather observations from Open-Meteo. This prevents false reports, identifies hyper-local weather events, and calculates reliable validation scores.

### 1. Verification Rule Pipeline
The engine analyzes meteorological conditions for specific hazard events:
* **Flood / Rain:** Checks precipitation & rain accumulation thresholds (partial coherence $\ge 2\text{ mm}$, strong coherence $\ge 10\text{ mm}$).
* **Thunderstorm:** Validates wind gusts (partial $\ge 25\text{ km/h}$, strong $\ge 40\text{ km/h}$ combined with precipitation).
* **Heatwave:** Checks atmospheric temperature (partial $\ge 35^\circ\text{C}$, strong $\ge 40^\circ\text{C}$).
* **Fog / Visibility:** Assesses relative humidity (partial $\ge 80\%$, strong $\ge 90\%$).
* **Dust Storm / Sandstorm:** Validates wind speed thresholds (partial $\ge 20\text{ km/h}$, strong $\ge 35\text{ km/h}$).
* **Strong Winds:** Checks wind speed and gusts (partial speed $\ge 30\text{ km/h}$, strong speed $\ge 50\text{ km/h}$ or gusts $\ge 60\text{ km/h}$).

### 2. Dynamic Trust Score & Verification Boosting
* **Coherence Classification:** Outputs `STRONG_COHERENCE` (boosts trust score by $+20$), `PARTIAL_COHERENCE` (boosts trust score by $+10$), or `LOW_COHERENCE` (no boost).
* **Automatic Status Promotion:**
  - Reports with `STRONG_COHERENCE` and a total trust score $\ge 70$ are promoted to `verified` automatically.
  - Reports with `LOW_COHERENCE` and a total trust score $< 50$ are flagged as `pending` for manual admin review.

### 3. Architecture & API Layer
* **API Endpoint:** `GET /coherence/check` accepts `event_type`, `latitude`, `longitude`, and `city` query parameters and returns detailed metrics.
* **Schema Extension:** The `ReportResponse` schema includes an optional `coherence` object, enabling immediate client-side visualization on successful creation.

### 4. Interactive Frontend Visualization (`report.html`)
Upon submitting a weather report:
1. The backend triggers the ML classification and performs the real-time coherence calculation.
2. The submission success page expands a glassmorphic **Physical-Social Coherence** panel.
3. Shows the real-time weather metrics (Temperature, Humidity, Rain), the validation status, and the textual justification explaining the engine's decision.
4. Extends the dashboard redirect timer to $8\text{ seconds}$ to allow users to review their validation details.

---

## 📡 Pan-India Doppler Weather Radar (DWR) Mosaic Stitching

The **Pan-India Doppler Mosaic Engine** aggregates and stitches localized polar reflectivity scans ($Z$ in $\text{dBZ}$) from Doppler Weather Radar (DWR) stations across India into a single continuous, real-time map layer over India's spatial bounds ($6.5^\circ\text{N} - 35.5^\circ\text{N}$, $68.0^\circ\text{E} - 97.0^\circ\text{E}$).

### 1. Features & Capabilities
* **Composite Reflectivity Raster Layer**: Combines multi-radar reflectivity scans into a high-resolution map overlay using standard meteorological reflectivity color ramps ($\text{dBZ}$ scale from 15 to 65+).
* **Active DWR Station Network**: Interactive station markers and 500 km radius beam coverage rings across major Indian meteorology hubs:
  - **New Delhi (DEL)** — S-Band DWR (500 km range, 54 dBZ peak)
  - **Mumbai (BOM)** — C-Band DWR (500 km range, 48 dBZ peak)
  - **Kolkata (CCU)** — S-Band DWR (500 km range, 58 dBZ peak)
  - **Chennai (MAA)** — S-Band DWR (500 km range, 42 dBZ peak)
  - **Bengaluru (BLR)** — C-Band DWR (500 km range, 38 dBZ peak)
  - **Hyderabad (HYD)** — C-Band DWR (500 km range, 45 dBZ peak)
  - **Guwahati (GAU)** — C-Band DWR (500 km range, 52 dBZ peak)
  - **Nagpur (NAG)** — S-Band DWR (500 km range, 40 dBZ peak)
* **Interactive Map Controls**:
  - **Layer Toggle Switch**: Instantly show/hide the Pan-India Doppler Mosaic on the live dashboard.
  - **Station Range Rings Toggle**: Toggle 500 km DWR coverage beam rings.
  - **Dynamic Layer Opacity Slider**: Adjust layer transparency from 10% to 100% for underlying map visibility.
  - **Reflectivity Legend Bar**: Real-time reflectivity scale mapping $\text{dBZ}$ intensity (Cyan: Light Rain $\rightarrow$ Green: Moderate Rain $\rightarrow$ Yellow: Heavy Rain $\rightarrow$ Red: Severe Storm $\rightarrow$ Magenta: Extreme / Hailstorm).

### 2. Reflectivity Color Scale ($\text{dBZ}$)
| Reflectivity ($\text{dBZ}$) | Color Code | Precipitation Category |
| :--- | :--- | :--- |
| **15 – 25 dBZ** | `#00e5ff` (Cyan) | Light Rain / Drizzle |
| **25 – 35 dBZ** | `#00e676` (Green) | Moderate Rain |
| **35 – 45 dBZ** | `#ffeb3b` (Yellow) | Heavy Rain |
| **45 – 55 dBZ** | `#ff5722` (Red) | Severe Storm / Thunderstorm |
| **55+ dBZ** | `#d500f9` (Magenta) | Extreme Convection / Hailstorm |

### 3. API Endpoint & Integration
* **API Endpoint**: `GET /weather/radar-mosaic`
* **Response**: Returns composite mosaic spatial bounds, legend standard definitions, and active Doppler station network status metrics.



