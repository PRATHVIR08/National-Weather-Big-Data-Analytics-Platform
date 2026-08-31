import os
import math
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Header
)

from supabase_client import (
    get_supabase_client,
    verify_jwt_token
)

from schemas import (
    ReportCreate,
    ReportResponse
)

from ml.classify import (
    classify_event,
    classify_event_with_confidence
)

from ml.dedupe import (
    check_duplicate
)

from ml.trust_score import (
    calculate_trust_score
)

from ml.coherence import (
    calculate_physical_social_coherence
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ============================================================
# FALLBACK IN-MEMORY STORAGE
# ============================================================

_in_memory_reports: List[dict] = []


# ============================================================
# CREATE WEATHER REPORT
# ============================================================

@router.post(
    "",
    response_model=ReportResponse,
    status_code=201
)
def create_report(report_data: ReportCreate):

    """
    Creates a new citizen weather report.

    Processing pipeline:

    1. ML event classification
    2. Duplicate detection
    3. Physical-Social Coherence verification
    4. Base trust score calculation
    5. Weather coherence trust boost
    6. Verification status update
    7. Database insertion
    """

    supabase = get_supabase_client()


    # ========================================================
    # 1. ML CLASSIFICATION
    # ========================================================

    event_type, ml_confidence = (
        classify_event_with_confidence(
            report_data.text_content
        )
    )

    print(
        f"[ML] Event: {event_type} | "
        f"Confidence: {ml_confidence}"
    )


    # ========================================================
    # 2. DUPLICATE DETECTION
    # ========================================================

    cutoff_time = (
        datetime.now(timezone.utc)
        - timedelta(hours=24)
    ).isoformat()

    recent_reports = []


    if supabase:

        try:

            res = (
                supabase
                .table("reports")
                .select(
                    "text_content, city, posted_at"
                )
                .eq(
                    "city",
                    report_data.city
                )
                .gte(
                    "posted_at",
                    cutoff_time
                )
                .execute()
            )

            recent_reports = res.data or []

        except Exception as e:

            print(
                f"[WARN] Error fetching "
                f"recent reports: {e}"
            )

    else:

        recent_reports = [
            r
            for r in _in_memory_reports
            if r.get("city") == report_data.city
        ]


    is_dup = check_duplicate(
        report_data.text_content,
        report_data.city,
        recent_reports
    )


    print(
        f"[DEDUP] Duplicate: {is_dup}"
    )


    # ========================================================
    # 3. PHYSICAL–SOCIAL COHERENCE
    # ========================================================

    """
    Compare the citizen's reported weather event
    with official/current weather observations.

    Example:

    Citizen:
        "Heavy rain and waterlogging"

    Weather API:
        Rainfall detected

    Result:
        STRONG_COHERENCE
        -> trust score increased

    If the citizen reports heavy rain but weather
    data shows dry conditions:

        LOW_COHERENCE
        -> trust score is not boosted
    """

    try:

        coherence_result = (
            calculate_physical_social_coherence(
                event_type=event_type,
                latitude=report_data.latitude,
                longitude=report_data.longitude,
                city=report_data.city
            )
        )

    except Exception as e:

        print(
            f"[WARN] Coherence engine error: {e}"
        )

        coherence_result = {
            "status": "UNKNOWN",
            "trust_boost": 0,
            "reason": "Weather verification unavailable"
        }


    print(
        "[COHERENCE]",
        coherence_result
    )


    # ========================================================
    # 4. MEDIA CHECK
    # ========================================================

    has_photo = bool(
        report_data.photo_url
        and report_data.photo_url.strip()
    )

    has_video = bool(
        report_data.video_url
        and report_data.video_url.strip()
    )


    # ========================================================
    # 5. BASE TRUST SCORE
    # ========================================================

    trust_score, verification_status = (
        calculate_trust_score(

            source=report_data.source,

            text_content=report_data.text_content,

            has_photo=has_photo,

            has_video=has_video,

            latitude=report_data.latitude,

            longitude=report_data.longitude,

            is_duplicate=is_dup,

            ml_confidence=ml_confidence
        )
    )


    print(
        f"[TRUST] Base Score: {trust_score}"
    )


    # ========================================================
    # 6. APPLY COHERENCE TRUST BOOST
    # ========================================================

    trust_boost = coherence_result.get(
        "trust_boost",
        0
    )


    try:

        trust_boost = float(
            trust_boost
        )

    except (
        ValueError,
        TypeError
    ):

        trust_boost = 0


    trust_score = min(
        100,
        trust_score + trust_boost
    )


    print(
        f"[TRUST] Weather Boost: +{trust_boost}"
    )

    print(
        f"[TRUST] Final Score: {trust_score}"
    )


    # ========================================================
    # 7. UPDATE VERIFICATION STATUS
    # ========================================================

    if (
        coherence_result.get("status")
        == "STRONG_COHERENCE"
        and trust_score >= 70
    ):

        verification_status = "verified"


    elif (
        coherence_result.get("status")
        == "LOW_COHERENCE"
        and trust_score < 50
    ):

        verification_status = "pending"


    # ========================================================
    # 8. TIMESTAMP
    # ========================================================

    posted_at_iso = (
        report_data.posted_at
        or datetime.now(
            timezone.utc
        ).isoformat()
    )


    # ========================================================
    # 9. CREATE REPORT OBJECT
    # ========================================================

    new_report = {

        "source":
            report_data.source,

        "text_content":
            report_data.text_content,

        "event_type":
            event_type,

        "city":
            report_data.city,

        "state":
            report_data.state,

        "latitude":
            report_data.latitude,

        "longitude":
            report_data.longitude,

        "photo_url":
            report_data.photo_url,

        "video_url":
            report_data.video_url,

        "posted_at":
            posted_at_iso,

        "verification_status":
            verification_status,

        "trust_score":
            trust_score,

        "is_duplicate":
            is_dup,

        "created_at":
            datetime.now(
                timezone.utc
            ).isoformat()
    }


    # ========================================================
    # 10. INSERT INTO SUPABASE
    # ========================================================

    if supabase:

        try:

            res = (
                supabase
                .table("reports")
                .insert(new_report)
                .execute()
            )

            if (
                res.data
                and len(res.data) > 0
            ):

                report_dict = res.data[0]
                report_dict["coherence"] = coherence_result
                return report_dict

        except Exception as e:

            print(
                f"[ERROR] Database insertion "
                f"error: {e}"
            )


    # ========================================================
    # 11. FALLBACK STORAGE
    # ========================================================

    new_report["id"] = (
        len(_in_memory_reports) + 1
    )

    _in_memory_reports.append(
        new_report
    )

    report_dict = dict(new_report)
    report_dict["coherence"] = coherence_result
    return report_dict


# ============================================================
# HAVERSINE DISTANCE
# ============================================================

def haversine_distance_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
) -> float:

    """
    Calculates great-circle distance
    between two geographic coordinates.
    """

    R = 6371.0

    dlat = math.radians(
        lat2 - lat1
    )

    dlon = math.radians(
        lon2 - lon1
    )

    a = (
        math.sin(dlat / 2.0) ** 2
        +
        math.cos(
            math.radians(lat1)
        )
        *
        math.cos(
            math.radians(lat2)
        )
        *
        math.sin(dlon / 2.0) ** 2
    )

    c = (
        2
        *
        math.atan2(
            math.sqrt(a),
            math.sqrt(1.0 - a)
        )
    )

    return R * c


# ============================================================
# SPATIAL INDEXING INFORMATION
# ============================================================

@router.get(
    "/spatial/info"
)
def spatial_indexing_info():

    return {

        "strategy":
            "Plain Lat/Lng Composite Spatial Indexing",

        "h3_status":
            "Not required - Plain Lat/Lng columns with spatial indexing provide hyper-fast queries at this scale.",

        "indexed_columns":
            [
                "latitude",
                "longitude"
            ],

        "supported_spatial_filters":
            [
                "radius_km",
                "bounding_box "
                "(min_lat, max_lat, "
                "min_lng, max_lng)"
            ]
    }


# ============================================================
# LIST REPORTS
# ============================================================

@router.get(
    "",
    response_model=List[ReportResponse]
)
def list_reports(

    date_from: Optional[str] = None,

    date_to: Optional[str] = None,

    event_type: Optional[str] = None,

    city: Optional[str] = None,

    state: Optional[str] = None,

    verification_status:
        Optional[str] = None,

    min_lat:
        Optional[float] = None,

    max_lat:
        Optional[float] = None,

    min_lng:
        Optional[float] = None,

    max_lng:
        Optional[float] = None,

    lat:
        Optional[float] = None,

    lng:
        Optional[float] = None,

    radius_km:
        Optional[float] = None,

    authorization:
        Optional[str] = Header(None)
):

    """
    List reports using normal filters
    and geographic spatial filters.
    """

    # ========================================================
    # ADMIN AUTHENTICATION
    # ========================================================

    is_admin = False

    if authorization:

        try:

            payload = verify_jwt_token(
                authorization
            )

            if payload:

                is_admin = True

        except Exception:

            is_admin = False


    supabase = get_supabase_client()


    # ========================================================
    # SUPABASE
    # ========================================================

    if supabase:

        try:

            query = (
                supabase
                .table("reports")
                .select("*")
            )


            # Public users see verified reports
            if not is_admin:

                query = query.eq(
                    "verification_status",
                    verification_status
                    or "verified"
                )

            elif verification_status:

                query = query.eq(
                    "verification_status",
                    verification_status
                )


            # Event filter
            if event_type:

                query = query.eq(
                    "event_type",
                    event_type
                )


            # City filter
            if city:

                query = query.ilike(
                    "city",
                    f"%{city}%"
                )


            # State filter
            if state:

                query = query.ilike(
                    "state",
                    f"%{state}%"
                )


            # Date filters
            if date_from:

                query = query.gte(
                    "posted_at",
                    date_from
                )


            if date_to:

                query = query.lte(
                    "posted_at",
                    date_to
                )


            # =================================================
            # BOUNDING BOX
            # =================================================

            if (
                min_lat is not None
                and max_lat is not None
                and min_lng is not None
                and max_lng is not None
            ):

                query = (
                    query
                    .gte(
                        "latitude",
                        min_lat
                    )
                    .lte(
                        "latitude",
                        max_lat
                    )
                    .gte(
                        "longitude",
                        min_lng
                    )
                    .lte(
                        "longitude",
                        max_lng
                    )
                )


            # =================================================
            # RADIUS PRE-FILTER
            # =================================================

            elif (
                lat is not None
                and lng is not None
                and radius_km is not None
            ):

                lat_delta = (
                    radius_km / 111.0
                )

                cos_lat = max(
                    0.1,
                    math.cos(
                        math.radians(lat)
                    )
                )

                lng_delta = (
                    radius_km
                    /
                    (111.0 * cos_lat)
                )


                query = (
                    query
                    .gte(
                        "latitude",
                        lat - lat_delta
                    )
                    .lte(
                        "latitude",
                        lat + lat_delta
                    )
                    .gte(
                        "longitude",
                        lng - lng_delta
                    )
                    .lte(
                        "longitude",
                        lng + lng_delta
                    )
                )


            # =================================================
            # LIMIT
            # =================================================

            query = (
                query
                .order(
                    "posted_at",
                    desc=True
                )
                .limit(500)
            )


            res = query.execute()

            reports = (
                res.data or []
            )


            # =================================================
            # EXACT RADIUS FILTER
            # =================================================

            if (
                lat is not None
                and lng is not None
                and radius_km is not None
            ):

                spatial_results = []


                for r in reports:

                    try:

                        r_lat = float(
                            r.get(
                                "latitude",
                                0
                            )
                        )

                        r_lng = float(
                            r.get(
                                "longitude",
                                0
                            )
                        )


                        dist = (
                            haversine_distance_km(
                                lat,
                                lng,
                                r_lat,
                                r_lng
                            )
                        )


                        if dist <= radius_km:

                            r_copy = dict(r)

                            r_copy[
                                "distance_km"
                            ] = round(
                                dist,
                                2
                            )

                            spatial_results.append(
                                r_copy
                            )

                    except (
                        ValueError,
                        TypeError
                    ):

                        continue


                return sorted(
                    spatial_results,
                    key=lambda x:
                        x["distance_km"]
                )


            return reports


        except Exception as e:

            print(
                f"[WARN] Supabase fetch "
                f"error: {e}"
            )


    # ========================================================
    # IN-MEMORY FALLBACK
    # ========================================================

    filtered = (
        _in_memory_reports
    )


    # Public restriction
    if not is_admin:

        status_target = (
            verification_status
            or "verified"
        )

        filtered = [
            r
            for r in filtered
            if r.get(
                "verification_status"
            ) == status_target
        ]

    elif verification_status:

        filtered = [
            r
            for r in filtered
            if r.get(
                "verification_status"
            ) == verification_status
        ]


    # Event filter
    if event_type:

        filtered = [
            r
            for r in filtered
            if r.get(
                "event_type"
            ) == event_type
        ]


    # City filter
    if city:

        filtered = [
            r
            for r in filtered
            if city.lower()
            in r.get(
                "city",
                ""
            ).lower()
        ]


    # State filter
    if state:

        filtered = [
            r
            for r in filtered
            if state.lower()
            in r.get(
                "state",
                ""
            ).lower()
        ]


    # ========================================================
    # BOUNDING BOX
    # ========================================================

    if (
        min_lat is not None
        and max_lat is not None
        and min_lng is not None
        and max_lng is not None
    ):

        filtered = [

            r

            for r in filtered

            if (
                min_lat
                <= float(
                    r.get(
                        "latitude",
                        0
                    )
                )
                <= max_lat
            )

            and (

                min_lng
                <= float(
                    r.get(
                        "longitude",
                        0
                    )
                )
                <= max_lng
            )
        ]


    # ========================================================
    # RADIUS
    # ========================================================

    if (
        lat is not None
        and lng is not None
        and radius_km is not None
    ):

        spatial_results = []


        for r in filtered:

            try:

                r_lat = float(
                    r.get(
                        "latitude",
                        0
                    )
                )

                r_lng = float(
                    r.get(
                        "longitude",
                        0
                    )
                )


                dist = (
                    haversine_distance_km(
                        lat,
                        lng,
                        r_lat,
                        r_lng
                    )
                )


                if dist <= radius_km:

                    r_copy = dict(r)

                    r_copy[
                        "distance_km"
                    ] = round(
                        dist,
                        2
                    )

                    spatial_results.append(
                        r_copy
                    )

            except (
                ValueError,
                TypeError
            ):

                continue


        return sorted(
            spatial_results,
            key=lambda x:
                x["distance_km"]
        )


    return sorted(
        filtered,
        key=lambda x:
            x.get(
                "posted_at",
                ""
            ),
        reverse=True
    )


# ============================================================
# MEDIA UPLOAD
# ============================================================

@router.post(
    "/upload"
)
async def upload_media(
    file: UploadFile = File(...)
):

    """
    Upload photo/video proof to Supabase Storage.
    """

    filename = (
        f"{uuid.uuid4().hex}_"
        f"{file.filename}"
    )


    file_bytes = (
        await file.read()
    )


    content_type = (
        file.content_type
        or "image/jpeg"
    )


    supabase = (
        get_supabase_client()
    )


    # ========================================================
    # SUPABASE STORAGE
    # ========================================================

    if supabase:

        try:

            supabase.storage \
                .from_("weather-media") \
                .upload(

                    path=filename,

                    file=file_bytes,

                    file_options={
                        "content-type":
                            content_type
                    }
                )


            public_url_res = (
                supabase
                .storage
                .from_("weather-media")
                .get_public_url(
                    filename
                )
            )


            return {

                "url":
                    public_url_res,

                "filename":
                    filename
            }


        except Exception as e:

            print(
                "[WARN] Supabase storage "
                f"upload error: {e}"
            )


    # ========================================================
    # LOCAL STORAGE FALLBACK
    # ========================================================

    upload_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "uploads"
    )


    os.makedirs(
        upload_dir,
        exist_ok=True
    )


    local_path = os.path.join(
        upload_dir,
        filename
    )


    with open(
        local_path,
        "wb"
    ) as f:

        f.write(
            file_bytes
        )


    return {

        "url":
            f"/static/uploads/{filename}",

        "filename":
            filename,

        "note":
            "Saved to local storage fallback"
    }