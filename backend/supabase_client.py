import os
try:
    import jwt
except ImportError:
    jwt = None

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

_supabase_client: Client = None

def get_supabase_client():
    """
    Returns an instance of the Supabase Client with the service role key.
    Allows administrative backend operations bypassing RLS rules.
    """
    global _supabase_client
    if _supabase_client is None:
        if not create_client or not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            return None
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_client

def verify_jwt_token(token: str) -> dict:
    """
    Verifies a Supabase Auth JWT token passed in the Authorization header.
    Returns decoded token payload or raises ValueError if invalid.
    """
    if not token:
        raise ValueError("Authorization token is missing")
    
    # Strip 'Bearer ' prefix if present
    if token.lower().startswith("bearer "):
        token = token[7:]

    if jwt is None:
        # Dev fallback when PyJWT is not installed
        return {"sub": "dev_admin", "role": "authenticated"}
        
    try:
        # If secret is set, verify signature; otherwise decode payload with unverified signature for dev convenience
        if SUPABASE_JWT_SECRET:
            payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        else:
            payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception as e:
        raise ValueError(f"Invalid authentication token: {str(e)}")
