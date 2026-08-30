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

@router.get("/reports", response_model=List[ReportResponse])
def get_admin_reports(
    status: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    """
    Returns reports filtered by status ('pending', 'verified', 'rejected', or 'all').
    Requires admin JWT authentication.
    """
    check_admin_auth(authorization)
    supabase = get_supabase_client()
    
    if supabase:
        try:
            query = supabase.table("reports").select("*")
            if status and status.lower() != "all":
                query = query.eq("verification_status", status.lower())
            res = query.order("posted_at", desc=True).execute()
            return res.data or []
        except Exception as e:
            print(f"[ERROR] Database error fetching admin reports: {e}")
            
    # Memory fallback
    filtered = _in_memory_reports
    if status and status.lower() != "all":
        filtered = [r for r in filtered if r.get("verification_status") == status.lower()]
    return sorted(filtered, key=lambda x: x.get("posted_at", ""), reverse=True)


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


# ============================================================
# CAP EMERGENCY DISPATCH (SMS & EMAIL BROADCAST)
# ============================================================

from pydantic import BaseModel, Field
from services.cap import dispatch_cap_alert

class CAPAlertRequest(BaseModel):
    event: str = Field("Flash Flood Warning", description="Weather hazard event")
    severity: str = Field("EXTREME", description="EXTREME, SEVERE, or MODERATE")
    urgency: str = Field("Immediate", description="Immediate, Expected, or Future")
    certainty: str = Field("Observed", description="Observed or Likely")
    region: str = Field("All India", description="Target geographical region/state")
    headline: str = Field(..., description="Short urgent headline")
    description: str = Field(..., description="Detailed emergency description and advice")
    instruction: Optional[str] = Field("Follow local authority guidance.", description="Protective action instructions")
    channels: List[str] = Field(default_factory=lambda: ["sms", "email"], description="Active broadcast channels: sms, email")

@router.post("/dispatch-alert")
def trigger_cap_dispatch(
    payload: CAPAlertRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Trigger CAP Emergency Broadcast across SMS (Twilio Mock) and Email (SMTP/SendGrid Mock).
    Returns OASIS CAP v1.2 XML payload and multi-channel dispatch receipt.
    """
    # Verify Auth Token if provided
    if authorization:
        check_admin_auth(authorization)

    try:
        receipt = dispatch_cap_alert(payload.dict())
        return receipt
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to execute CAP emergency dispatch: {str(e)}"
        )

