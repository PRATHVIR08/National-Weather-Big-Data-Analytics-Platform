import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Header
from supabase_client import get_supabase_client, verify_jwt_token
from schemas import ReportCreate, ReportResponse
from ml.classify import classify_event, classify_event_with_confidence
from ml.dedupe import check_duplicate
from ml.trust_score import calculate_trust_score

router = APIRouter(prefix="/reports", tags=["Reports"])

# Fallback in-memory storage if Supabase is not connected
_in_memory_reports: List[dict] = []

@router.post("", response_model=ReportResponse, status_code=201)
def create_report(report_data: ReportCreate):
    """
    Ingests a new weather report:
    1. Runs ML NLP classification with confidence scoring
    2. Checks for duplicates against recent reports in same city using TF-IDF cosine similarity
    3. Calculates dynamic trust score and verification status
    4. Inserts into Supabase (or memory fallback)
    """
    supabase = get_supabase_client()
    
    # 1. ML Classification & Confidence Probability
    event_type, ml_confidence = classify_event_with_confidence(report_data.text_content)
    
    # 2. Deduplication check against recent reports (last 24 hours)
    cutoff_time = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    recent_reports = []
    
    if supabase:
        try:
            res = supabase.table("reports") \
                .select("text_content, city, posted_at") \
                .eq("city", report_data.city) \
                .gte("posted_at", cutoff_time) \
                .execute()
            recent_reports = res.data or []
        except Exception as e:
            print(f"[WARN] Error fetching recent reports for dedupe: {e}")
    else:
        recent_reports = [r for r in _in_memory_reports if r.get('city') == report_data.city]

    is_dup = check_duplicate(report_data.text_content, report_data.city, recent_reports)
    
    # 3. Calculate Trust Score & Verification Status
    has_photo = bool(report_data.photo_url and report_data.photo_url.strip())
    has_video = bool(report_data.video_url and report_data.video_url.strip())
    
    trust_score, verification_status = calculate_trust_score(
        source=report_data.source,
        text_content=report_data.text_content,
        has_photo=has_photo,
        has_video=has_video,
        latitude=report_data.latitude,
        longitude=report_data.longitude,
        is_duplicate=is_dup,
        ml_confidence=ml_confidence
    )
    
    posted_at_iso = report_data.posted_at or datetime.now(timezone.utc).isoformat()
    
    new_report = {
        "source": report_data.source,
        "text_content": report_data.text_content,
        "event_type": event_type,
        "city": report_data.city,
        "state": report_data.state,
        "latitude": report_data.latitude,
        "longitude": report_data.longitude,
        "photo_url": report_data.photo_url,
        "video_url": report_data.video_url,
        "posted_at": posted_at_iso,
        "verification_status": verification_status,
        "trust_score": trust_score,
        "is_duplicate": is_dup,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # 4. Insert into database
    if supabase:
        try:
            res = supabase.table("reports").insert(new_report).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"[ERROR] Database insertion error: {e}")
            
    # Fallback storage assignment
    new_report["id"] = len(_in_memory_reports) + 1
    _in_memory_reports.append(new_report)
    return new_report

@router.get("", response_model=List[ReportResponse])
def list_reports(
    date_from: Optional[str] = Query(None, description="ISO format start date"),
    date_to: Optional[str] = Query(None, description="ISO format end date"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    city: Optional[str] = Query(None, description="Filter by city"),
    state: Optional[str] = Query(None, description="Filter by state"),
    verification_status: Optional[str] = Query(None, description="Filter status (verified, pending, rejected)"),
    authorization: Optional[str] = Header(None)
):
    """
    List reports with filters.
    Public access returns ONLY 'verified' reports unless authenticated admin token is provided.
    """
    is_admin = False
    if authorization:
        try:
            payload = verify_jwt_token(authorization)
            if payload:
                is_admin = True
        except Exception:
            is_admin = False
            
    supabase = get_supabase_client()
    
    if supabase:
        try:
            query = supabase.table("reports").select("*")
            
            # Enforce public restriction to verified reports if not admin
            if not is_admin:
                query = query.eq("verification_status", verification_status or "verified")
            elif verification_status:
                query = query.eq("verification_status", verification_status)
                
            if event_type:
                query = query.eq("event_type", event_type)
            if city:
                query = query.ilike("city", f"%{city}%")
            if state:
                query = query.ilike("state", f"%{state}%")
            if date_from:
                query = query.gte("posted_at", date_from)
            if date_to:
                query = query.lte("posted_at", date_to)
                
            query = query.order("posted_at", desc=True).limit(500)
            res = query.execute()
            return res.data or []
        except Exception as e:
            print(f"[WARN] Supabase fetch error: {e}")
            
    # Fallback filter for in-memory reports
    filtered = _in_memory_reports
    if not is_admin:
        status_target = verification_status or "verified"
        filtered = [r for r in filtered if r.get("verification_status") == status_target]
    elif verification_status:
        filtered = [r for r in filtered if r.get("verification_status") == verification_status]
        
    if event_type:
        filtered = [r for r in filtered if r.get("event_type") == event_type]
    if city:
        filtered = [r for r in filtered if city.lower() in r.get("city", "").lower()]
    if state:
        filtered = [r for r in filtered if state.lower() in r.get("state", "").lower()]
        
    return sorted(filtered, key=lambda x: x.get("posted_at", ""), reverse=True)


@router.post("/upload")
async def upload_media(file: UploadFile = File(...)):
    """
    Uploads a photo or video to Supabase Storage 'weather-media' bucket.
    Falls back to local file storage if Supabase credentials are missing.
    Returns public URL of the uploaded file.
    """
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_bytes = await file.read()
    content_type = file.content_type or "image/jpeg"
    
    supabase = get_supabase_client()
    
    if supabase:
        try:
            res = supabase.storage.from_("weather-media").upload(
                path=filename,
                file=file_bytes,
                file_options={"content-type": content_type}
            )
            # Retrieve public URL
            public_url_res = supabase.storage.from_("weather-media").get_public_url(filename)
            return {"url": public_url_res, "filename": filename}
        except Exception as e:
            print(f"[WARN] Supabase storage upload error: {e}")

    # Fallback: Save to local backend uploads folder
    upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    local_path = os.path.join(upload_dir, filename)
    
    with open(local_path, "wb") as f:
        f.write(file_bytes)
        
    return {
        "url": f"/static/uploads/{filename}",
        "filename": filename,
        "note": "Saved to local storage fallback"
    }
