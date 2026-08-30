import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.reports import router as reports_router
from routes.admin import router as admin_router
from supabase_client import get_supabase_client
from routes.weather import router as weather_router

app = FastAPI(
    title="National Weather Big Data Analytics Platform",
    description="Real-time ingestion, ML verification, deduplication, and analytics for weather events across India.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory for local fallback storage
upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include routers
app.include_router(reports_router)
app.include_router(admin_router)
app.include_router(weather_router)

@app.get("/", tags=["Health Check"])
def root():
    supabase_connected = get_supabase_client() is not None
    return {
        "app": "National Weather Big Data Analytics Platform Backend",
        "status": "online",
        "supabase_connected": supabase_connected,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
