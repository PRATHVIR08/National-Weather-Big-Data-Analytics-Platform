from typing import List, Optional
from fastapi import APIRouter, HTTPException, Header, Query
from supabase_client import get_supabase_client, verify_jwt_token
from schemas import ReportResponse, AdminActionResponse
from routes.reports import _in_memory_reports

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

def check_admin_auth(authorization: Optional[str]):
    """
    Dependency helper to validate JWT token for protected admin endpoints.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    try:
        payload = verify_jwt_token(authorization)
        return payload
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/pending", response_model=List[ReportResponse])
def get_pending_reports(authorization: Optional[str] = Header(None)):
    """
    Returns all reports awaiting verification ('pending').
    Requires admin JWT authentication.
    """
    check_admin_auth(authorization)
    supabase = get_supabase_client()
    
    if supabase:
        try:
            res = supabase.table("reports") \
                .select("*") \
                .eq("verification_status", "pending") \
                .order("posted_at", desc=True) \
                .execute()
            return res.data or []
        except Exception as e:
            print(f"[ERROR] Database error fetching pending: {e}")
            
    # Memory fallback
    pending = [r for r in _in_memory_reports if r.get("verification_status") == "pending"]
    return sorted(pending, key=lambda x: x.get("posted_at", ""), reverse=True)

@router.post("/verify/{report_id}", response_model=AdminActionResponse)
def verify_report(report_id: int, authorization: Optional[str] = Header(None)):
    """
    Approves a report by updating its verification_status to 'verified'.
    """
    check_admin_auth(authorization)
    supabase = get_supabase_client()
    
    if supabase:
        try:
            res = supabase.table("reports") \
                .update({"verification_status": "verified"}) \
                .eq("id", report_id) \
                .execute()
            if res.data:
                return AdminActionResponse(
                    success=True,
                    message="Report successfully verified",
                    report_id=report_id,
                    new_status="verified"
                )
        except Exception as e:
            print(f"[ERROR] Verify update failed in DB: {e}")

    # Fallback in-memory update
    for r in _in_memory_reports:
        if r.get("id") == report_id:
            r["verification_status"] = "verified"
            return AdminActionResponse(
                success=True,
                message="Report successfully verified (in-memory)",
                report_id=report_id,
                new_status="verified"
            )
            
    raise HTTPException(status_code=404, detail="Report ID not found")

@router.post("/reject/{report_id}", response_model=AdminActionResponse)
def reject_report(report_id: int, authorization: Optional[str] = Header(None)):
    """
    Rejects a report by updating its verification_status to 'rejected'.
    """
    check_admin_auth(authorization)
    supabase = get_supabase_client()
    
    if supabase:
        try:
            res = supabase.table("reports") \
                .update({"verification_status": "rejected"}) \
                .eq("id", report_id) \
                .execute()
            if res.data:
                return AdminActionResponse(
                    success=True,
                    message="Report rejected",
                    report_id=report_id,
                    new_status="rejected"
                )
        except Exception as e:
            print(f"[ERROR] Reject update failed in DB: {e}")

    # Fallback in-memory update
    for r in _in_memory_reports:
        if r.get("id") == report_id:
            r["verification_status"] = "rejected"
            return AdminActionResponse(
                success=True,
                message="Report rejected (in-memory)",
                report_id=report_id,
                new_status="rejected"
            )
            
    raise HTTPException(status_code=404, detail="Report ID not found")
