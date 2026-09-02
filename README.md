# National Weather Big Data Analytics Platform (RITARA)

A full-stack web application designed to collect, verify, categorize, and visualize real-time weather-related reports across India (rainfall, flooding, thunderstorms, heatwaves, fog, dust storms, strong winds) sourced from social media (Reddit), public Kaggle datasets, IMD government feeds, and citizen crowd-reports.

---

## 🏗️ Architecture Overview

```
                      +-----------------------------------+
                      |      Frontend (React 18 + Vite)   |
                      |  - /         (Live Dashboard)     |
                      |  - /report   (Citizen Form)       |
                      |  - /admin    (Admin Control)      |
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

- **Frontend:** React 18, Vite 5, React Router v6, React-Leaflet, Chart.js & `react-chartjs-2`, Vanilla CSS (Custom Dark Glassmorphic Design System).
- **Backend:** Python 3.10+ & FastAPI.
- **Database:** Supabase (Hosted PostgreSQL) using `supabase-py` client.
- **File Storage:** Supabase Storage (`weather-media` public bucket).
- **Auth:** Supabase Auth (Email/Password login for Admin Panel with local session fallback).
- **Live Updates:** Open-Meteo API & Supabase Realtime (Websocket subscription on `postgres_changes` for `reports` table).
- **Maps & GIS:** Leaflet.js / React-Leaflet + OpenStreetMap / CartoDB Dark Tiles + Pan-India Doppler Weather Radar (DWR) Mosaic Engine.
- **Charts & Visualizations:** Chart.js & `react-chartjs-2`.
- **Machine Learning & NLP Pipelines:**
  - **Scikit-Learn NLP Classifier:** `TfidfVectorizer` (N-grams 1-2) + `LogisticRegression` pipeline trained on 1,400+ labeled weather report text samples (`Flood`, `Heatwave`, `Thunderstorm`, `Fog`, `DustStorm`, `StrongWind`, `Other`) with confidence probability output.
  - **Semantic Deduplication Engine:** TF-IDF Cosine Similarity vectorizer + `difflib.SequenceMatcher` (>0.85 threshold on recent reports from the same city within 24 hours).
  - **Dynamic ML Trust Score Evaluator (0–100):** Weighted scoring engine (Photo/Video +20, IMD/Government source +40, Detailed text > 20 chars +10, GPS location +15, ML Confidence boost +15, Duplicate penalty -50). Auto-verifies score ≥ 70, pending for 40–69, rejects < 40.
  - **Physical-Social Coherence Engine:** Real-time ML cross-referencing between social hazard reports and Open-Meteo physical observations (precipitation, wind speed, relative humidity, temperature).

---

## 🚀 Team Quick Start & Local Setup Guide

Follow these steps to set up, install dependencies, and run the project locally.

### 📋 Prerequisites
Make sure you have installed on your computer:
- **Node.js 18+** & **npm** ([Download Node.js](https://nodejs.org/))
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

---

### Step 5: Database Setup (Supabase SQL Schema)

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Go to the **SQL Editor** tab.
3. Open `backend/schema.sql` from your local repository, copy all contents, paste into the Supabase SQL Editor, and click **Run**.

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

### Step 8: Start the React Frontend Application

Open a **new terminal window**, navigate to the `frontend/` directory, install node packages, and launch the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will launch at: `http://localhost:3000`

- 📊 **Live Dashboard & Map:** `http://localhost:3000/`
- 📝 **Citizen Incident Report Form:** `http://localhost:3000/report`
- 🔒 **Admin Verification Portal:** `http://localhost:3000/admin`

#### Production Build:
To build the production bundle:
```bash
npm run build
```

---

## 🧪 Local Testing & Verification Checklist

To test all major features end-to-end:

1. **Verify Map & Data Visualizations (`/`):**
   - Open `http://localhost:3000/`.
   - Verify weather station badges and report markers are visible across India on the React-Leaflet map.
   - Toggle map layers between **All Layers**, **Live Weather**, and **Disaster Indications**.
   - Test event category filter (e.g. *Flood*, *Heatwave*, *Thunderstorm*) and location search.
   - Verify Chart.js bar and doughnut charts update dynamically.

2. **Test ML Incident Categorization & Trust Score (`/report`):**
   - Open `http://localhost:3000/report`.
   - Click **📍 Pin Location on Map** or **📍 Capture Current GPS Location** to capture coordinates.
   - Attach a photo/video evidence file (tests upload to Supabase Storage `weather-media`).
   - Enter an incident description (e.g. *"Extreme waterlogging and flood on Ring Road"*).
   - Submit and review the **Physical-Social Coherence** validation feedback panel.

3. **Test Admin Verification Queue & CAP Dispatch (`/admin`):**
   - Open `http://localhost:3000/admin`.
   - Sign in with credentials or click **🚨 Launch CAP Emergency Dispatch**.
   - Review pending reports in the queue and test 1-click **✓ Verify** and **✕ Reject** buttons.
   - Test broadcasting an OASIS CAP v1.2 XML emergency alert via SMS & Email.

4. **Test 72-Hour Agri-Advisory & Soil Health Engine (`/`):**
   - Scroll to the **🌾 Agricultural Weather & Soil Moisture Advisory** section at the bottom of the dashboard.
   - Search for any Indian agricultural city (e.g. `Ludhiana`, `Pune`, `Bhopal`, `Bengaluru`, `Nashik`).
   - Click **Get Forecast**.
   - View topsoil moisture, soil temperature, relative humidity, and 72-hour rain accumulation.
   - Inspect rule-generated agronomic crop advisory cards (`INFO`, `WARNING`, `ALERT`).
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
| `POST` | `/reports` | Public | Ingest new report. Runs ML NLP classification, TF-IDF deduplication, trust score computation, and physical-social coherence check. |
| `GET` | `/reports` | Public / Admin | Filter & list weather reports. Public sees `verified` reports only; Admin sees all. |
| `POST` | `/reports/upload` | Public | Upload photo/video evidence to Supabase Storage `weather-media` bucket. |
| `GET` | `/admin/pending` | Admin JWT | List reports flagged as `pending` review. |
| `POST` | `/admin/verify/{id}` | Admin JWT | Approves report and sets status to `verified`. |
| `POST` | `/admin/reject/{id}` | Admin JWT | Rejects report and sets status to `rejected`. |
| `POST` | `/admin/dispatch-alert` | Admin / Demo | Trigger multi-channel CAP emergency broadcast (SMS & Email) with OASIS CAP v1.2 XML receipt. |
| `GET` | `/weather/live` | Public | Fetch live weather for configured Indian locations using Open-Meteo API. |
| `GET` | `/weather/city` | Public | Dynamic weather search by city name via Open-Meteo Geocoding. |
| `GET` | `/weather/agri-advisory` | Public | Fetch 72-hour soil moisture/temp & humidity forecast with automated agronomic crop advisories. |
| `GET` | `/coherence/check` | Public | Check physical-social coherence for an event type at given latitude/longitude. |

---

## 📁 Directory Structure

```
.
├── .gitignore                    (Excludes .env, node_modules, dist, and temporary files)
├── README.md                     (Project documentation & setup guide)
├── backend/
│   ├── main.py                   (FastAPI application entrypoint & CORS config)
│   ├── supabase_client.py        (Supabase client initialization & JWT validation)
│   ├── schemas.py                (Pydantic request/response models)
│   ├── schema.sql                (Postgres database & storage initialization script)
│   ├── routes/
│   │   ├── reports.py            (Report ingestion, filtering & upload endpoints)
│   │   ├── admin.py              (Protected admin verification & CAP dispatch endpoints)
│   │   └── weather.py            (Live weather, city search & Agri-advisory endpoints)
│   ├── services/
│   │   ├── agri_advisory.py      (72-hour soil/humidity engine & rule-based advisories)
│   │   ├── coherence_engine.py   (Physical-Social Coherence engine)
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
    ├── index.html                (Vite HTML entrypoint)
    ├── package.json              (React dependencies & scripts)
    ├── vite.config.js            (Vite configuration)
    └── src/
        ├── main.jsx              (React DOM mounting root)
        ├── App.jsx               (React Router main routing setup)
        ├── pages/
        │   ├── Dashboard.jsx     (Live Dashboard page)
        │   ├── ReportIncident.jsx(Incident report submission page)
        │   └── AdminPortal.jsx   (Admin queue & CAP alert portal)
        ├── components/
        │   ├── common/           (Navbar, GlassCard, LoadingIndicator)
        │   ├── dashboard/        (WeatherMap, WeatherStats, WeatherSearch, IncidentCharts, AgriAdvisory, etc.)
        │   ├── report/           (ReportForm, LocationPickerMap, CoherencePanel)
        │   └── admin/            (AdminLogin, ReportsQueue, CapDispatchModal)
        ├── services/
        │   └── api.js            (Centralized API service client)
        ├── styles/
        │   ├── global.css        (Glassmorphic design system & layout)
        │   └── map.css           (Leaflet map, custom pins, & popup dark theme)
        └── utils/
            └── weatherUtils.js   (Weather icons, event colors, & SVG marker generators)
```

---

## 🌾 72-Hour Soil & Humidity Agri-Advisory Feature

The platform includes an automated **Agronomic Crop Advisory Engine** designed to assist farmers, agricultural planners, and regional managers:

### 1. Soil & Weather Forecast Parameters (Open-Meteo API)
- **Topsoil Moisture ($0\text{--}7\text{ cm}$):** Measured in $\text{m}^3/\text{m}^3$ volumetric index.
- **Soil Temperature ($0\text{--}7\text{ cm}$):** Measured in $^\circ\text{C}$.
- **Relative Humidity ($2\text{ m}$):** Hourly atmospheric moisture levels (%).
- **Precipitation:** 72-hour accumulated rainfall forecast ($\text{mm}$).

### 2. Automated Agronomic Rule Engine
- **Irrigation Management:** Evaluates topsoil moisture levels. Recommends delaying irrigation when $>12\text{ mm}$ of rain is expected to avoid overwatering and save energy, or flags urgent irrigation when moisture drops below threshold ($<0.18\text{ m}^3/\text{m}^3$).
- **Disease & Pest Threat Warning:** Evaluates temperature and humidity combinations. High relative humidity ($>78\%$) and warm temperatures ($>22^\circ\text{C}$) trigger warnings for fungal spore germination (e.g. blight, mildew).
- **Soil Aeration & Saturation:** Monitors soil waterlogging risk ($>0.42\text{ m}^3/\text{m}^3$) to protect root respiration.
- **Foliar Spray & Fertilizer Window:** Detects dry periods with low wind speed ($<18\text{ km/h}$) ideal for agrochemical application.

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
- **📱 SMS Gateway (Twilio Mock):** Simulates targeted SMS broadcast to registered mobile subscribers in the selected region.
- **📧 Email Bulletin (SMTP / SendGrid Mock):** Simulates high-priority emergency bulletin emails to registered subscribers and authorities.

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
