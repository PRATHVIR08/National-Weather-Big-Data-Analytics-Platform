import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

REGION_RECIPIENTS = {
    "All India": {"sms": 485000, "email": 92000},
    "Punjab": {"sms": 68500, "email": 14200},
    "Maharashtra": {"sms": 115000, "email": 28400},
    "Karnataka": {"sms": 82000, "email": 19500},
    "Delhi NCR": {"sms": 142000, "email": 35000},
    "Assam": {"sms": 41000, "email": 8600},
    "West Bengal": {"sms": 76000, "email": 16800},
    "Tamil Nadu": {"sms": 89000, "email": 21000},
    "Gujarat": {"sms": 73000, "email": 17400},
}

def generate_cap_xml(alert_id: str, sent_time: str, data: Dict[str, Any]) -> str:
    """Generate standard OASIS Common Alerting Protocol (CAP v1.2) XML string."""
    event = data.get("event", "Severe Weather Warning")
    urgency = data.get("urgency", "Immediate")
    severity = data.get("severity", "EXTREME")
    certainty = data.get("certainty", "Observed")
    headline = data.get("headline", "Emergency Alert")
    description = data.get("description", "Take immediate protective measures.")
    instruction = data.get("instruction", "Follow local authority guidelines.")
    region = data.get("region", "All India")
    sender = data.get("sender", "ndma-disaster-response@gov.in")

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>{alert_id}</identifier>
  <sender>{sender}</sender>
  <sent>{sent_time}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>{event}</event>
    <urgency>{urgency}</urgency>
    <severity>{severity}</severity>
    <certainty>{certainty}</certainty>
    <headline>{headline}</headline>
    <description>{description}</description>
    <instruction>{instruction}</instruction>
    <area>
      <areaDesc>{region}</areaDesc>
    </area>
  </info>
</alert>"""

def dispatch_cap_alert(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process CAP Emergency Dispatch.
    Simulates multi-channel broadcast (SMS via Twilio Mock & Email via SendGrid Mock).
    """
    alert_id = f"CAP-IN-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    sent_time = datetime.now(timezone.utc).isoformat()
    
    region = data.get("region", "All India")
    channels = data.get("channels", ["sms", "email"])
    
    # Calculate recipient estimates based on target region
    recipients_info = REGION_RECIPIENTS.get(region, {"sms": 50000, "email": 12000})
    
    sms_count = recipients_info["sms"] if "sms" in channels else 0
    email_count = recipients_info["email"] if "email" in channels else 0
    
    # Mock Gateway Message IDs
    sms_batch_sid = f"SM{uuid.uuid4().hex}" if "sms" in channels else None
    email_batch_id = f"sg.msg.{uuid.uuid4().hex[:16]}" if "email" in channels else None
    
    # Generate OASIS CAP v1.2 XML
    cap_xml = generate_cap_xml(alert_id, sent_time, data)
    
    return {
        "success": True,
        "dispatch_receipt": {
            "alert_identifier": alert_id,
            "timestamp": sent_time,
            "status": "DISPATCHED",
            "region": region,
            "event": data.get("event", "Emergency Warning"),
            "severity": data.get("severity", "EXTREME"),
            "channels_active": channels,
            "sms_metrics": {
                "enabled": "sms" in channels,
                "recipients_reached": sms_count,
                "gateway": "Twilio Programmable SMS (Mock)",
                "batch_sid": sms_batch_sid,
                "delivery_rate": "99.8%"
            },
            "email_metrics": {
                "enabled": "email" in channels,
                "recipients_reached": email_count,
                "gateway": "SendGrid / SMTP Emergency Relay (Mock)",
                "batch_id": email_batch_id,
                "delivery_rate": "100.0%"
            },
            "total_population_notified": sms_count + email_count,
            "cap_xml": cap_xml
        }
    }
