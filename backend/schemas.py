from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    source: str = Field(default="citizen", description="Source of report: citizen, reddit, kaggle_seed, imd")
    text_content: str = Field(..., description="Report description text")
    city: str = Field(..., description="City name")
    state: str = Field(..., description="State name")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    photo_url: Optional[str] = Field(default=None, description="URL of attached photo")
    video_url: Optional[str] = Field(default=None, description="URL of attached video")
    posted_at: Optional[str] = Field(default=None, description="ISO timestamp of report posting")

class ReportResponse(BaseModel):
    id: Optional[int] = None
    source: str
    text_content: str
    event_type: str
    city: str
    state: str
    latitude: float
    longitude: float
    photo_url: Optional[str] = None
    video_url: Optional[str] = None
    posted_at: str
    verification_status: str
    trust_score: float
    is_duplicate: bool
    created_at: Optional[str] = None

class AdminActionResponse(BaseModel):
    success: bool
    message: str
    report_id: int
    new_status: str
