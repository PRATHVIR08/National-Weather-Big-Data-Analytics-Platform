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
- **Maps & GIS:** Leaflet.js + OpenStreetMap / CartoDB Dark Tiles.
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
│   │   └── admin.py              (Protected admin verification endpoints)
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