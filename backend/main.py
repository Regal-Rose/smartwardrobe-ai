"""SmartWardrobe AI authentication API. Local-first SQLite backend."""
import urllib.request
import urllib.parse
from datetime import datetime
import hashlib, hmac, os, secrets, sqlite3, json, uuid
from contextlib import closing
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from pydantic import BaseModel, EmailStr, Field
from itsdangerous import BadSignature, URLSafeTimedSerializer
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("SMARTWARDROBE_DB", str(ROOT / "smartwardrobe.db")))
SECRET_KEY = os.getenv("SMARTWARDROBE_SECRET", "DEV-ONLY-change-this-secret-before-deploying-2026")
FRONTEND_ORIGINS = [x.strip() for x in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()]

ENVIRONMENT = os.getenv("ENVIRONMENT", "development") 

# In production, cookies MUST be secure. Locally, they can be false for testing.
COOKIE_SECURE = True if ENVIRONMENT == "production" else os.getenv("COOKIE_SECURE", "false").lower() == "true"
COOKIE_NAME = "sw_session"
SESSION_MAX_AGE = 60 * 60 * 24 * 7
serializer = URLSafeTimedSerializer(SECRET_KEY, salt="smartwardrobe-session-v1")

app = FastAPI(title="SmartWardrobe AI API", version="0.1.0")

# Force HTTPS in production
if ENVIRONMENT == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

app.add_middleware(CORSMiddleware, allow_origins=FRONTEND_ORIGINS, allow_credentials=True, allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], allow_headers=["Content-Type"])

# --- START SECURITY MIDDLEWARE ---
# 1. Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. Payload Size Limiter (Max 10MB to prevent DoS)
@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    if request.headers.get("content-length"):
        content_length = int(request.headers.get("content-length"))
        if content_length > 100 * 1024 * 1024:  # 10 MB limit (adjusted for images)
            return Response("Request entity too large", status_code=413)
    response = await call_next(request)
    return response
# --- END SECURITY MIDDLEWARE ---

class RegisterPayload(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with closing(connect()) as db:
        db.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)")
        db.execute("CREATE TABLE IF NOT EXISTS garments (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)")
        db.execute("CREATE TABLE IF NOT EXISTS outfits (id TEXT NOT NULL, user_id INTEGER NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id,user_id), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)")
        db.execute("CREATE TABLE IF NOT EXISTS preferences (user_id INTEGER PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)")
        db.commit()

def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"pbkdf2_sha256$310000${salt.hex()}${digest.hex()}"

def verify_password(password: str, encoded: str) -> bool:
    try:
        scheme, rounds, salt_hex, digest_hex = encoded.split("$")
        if scheme != "pbkdf2_sha256": return False
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(rounds)).hex()
        return hmac.compare_digest(digest, digest_hex)
    except (ValueError, TypeError): return False

def user_from_request(request: Request):
    token = request.cookies.get(COOKIE_NAME)
    if not token: return None
    try: uid = serializer.loads(token, max_age=SESSION_MAX_AGE)
    except BadSignature: return None
    with closing(connect()) as db:
        row = db.execute("SELECT id, name, email, created_at FROM users WHERE id=?", (uid,)).fetchone()
        return dict(row) if row else None

def set_session(response: Response, user_id: int):
    response.set_cookie(COOKIE_NAME, serializer.dumps(user_id), max_age=SESSION_MAX_AGE, httponly=True, secure=COOKIE_SECURE, samesite="strict", path="/")

@app.on_event("startup")
def startup(): init_db()

@app.get("/api/health")
def health(): return {"status": "ok", "service": "smartwardrobe-api"}

@app.post("/api/v1/auth/register", status_code=201)
def register(payload: RegisterPayload, response: Response):
    name = payload.name.strip(); email = str(payload.email).strip().lower()
    if len(name) < 2: raise HTTPException(422, "Please enter a name with at least 2 characters.")
    with closing(connect()) as db:
        try:
            cur = db.execute("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)", (name, email, hash_password(payload.password)))
            db.commit(); uid = cur.lastrowid
        except sqlite3.IntegrityError: raise HTTPException(409, "An account with this email already exists. Please log in.")
    set_session(response, uid)
    return {"id": uid, "name": name, "email": email}

@app.post("/api/v1/auth/login")
@limiter.limit("10/minute")
def login(payload: LoginPayload, response: Response, request: Request):
    email = str(payload.email).strip().lower()
    with closing(connect()) as db: row = db.execute("SELECT id,name,email,password_hash FROM users WHERE email=?", (email,)).fetchone()
    if not row or not verify_password(payload.password, row["password_hash"]): raise HTTPException(401, "Email or password is incorrect.")
    set_session(response, row["id"])
    return {"id": row["id"], "name": row["name"], "email": row["email"]}

@app.get("/api/v1/auth/me")
def me(request: Request):
    user = user_from_request(request)
    if not user: raise HTTPException(401, "Please log in to continue.")
    return user

@app.post("/api/v1/auth/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/", httponly=True, secure=COOKIE_SECURE, samesite="lax")
    return {"status": "logged_out"}

class ForgotPasswordPayload(BaseModel):
    email: EmailStr

class ResetPasswordPayload(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

@app.post("/api/v1/auth/forgot-password")
@limiter.limit("3/hour") 
def forgot_password(payload: ForgotPasswordPayload, request: Request):
    email = str(payload.email).strip().lower()
    with closing(connect()) as db:
        row = db.execute("SELECT id, name FROM users WHERE email=?", (email,)).fetchone()
    if row:
        reset_token = serializer.dumps(email, salt="password-reset-salt")
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        print(f"\n{'='*50}\n[EMAIL SIMULATION]")
        print(f"To: {email}\nSubject: Reset Your SmartWardrobe Password")
        print(f"Hi {row['name']},\nClick here to reset your password:\n{reset_link}")
        print(f"{'='*50}\n")
    return {"message": "If that email is registered, a password reset link has been sent."}

@app.post("/api/v1/auth/reset-password")
@limiter.limit("5/minute")
def reset_password(payload: ResetPasswordPayload, request: Request):
    try:
        email = serializer.loads(payload.token, salt="password-reset-salt", max_age=900)
    except BadSignature:
        raise HTTPException(400, "The password reset link is invalid or has expired. Please request a new one.")
    new_hash = hash_password(payload.new_password)
    with closing(connect()) as db:
        cur = db.execute("UPDATE users SET password_hash=? WHERE email=?", (new_hash, email))
        db.commit()
        if cur.rowcount == 0:
            raise HTTPException(404, "User no longer exists.")
    return {"message": "Your password has been successfully reset. You can now log in."}

def require_user(request: Request):
    user = user_from_request(request)
    if not user: raise HTTPException(401, "Please log in to continue.")
    return user

class GarmentPayload(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str
    subcategory: str
    style: str
    color: str
    season: str
    occasions: list[str] = []
    tags: list[str] = []
    notes: str = ""
    imageData: str = ""

class GarmentUpdatePayload(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    category: Optional[str] = None
    subcategory: Optional[str] = None
    style: Optional[str] = None
    color: Optional[str] = None
    season: Optional[str] = None
    occasions: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    notes: Optional[str] = None
    imageData: Optional[str] = None

@app.get("/api/v1/garments")
def list_garments(request: Request, search: Optional[str] = None, category: Optional[str] = None, style: Optional[str] = None, color: Optional[str] = None, season: Optional[str] = None, sort: Optional[str] = "recently-added"):
    user = require_user(request)
    with closing(connect()) as db:
        rows = db.execute("SELECT payload FROM garments WHERE user_id=?", (user["id"],)).fetchall()
    items = [json.loads(row["payload"]) for row in rows]
    if search:
        q = search.strip().lower()
        def matches_search(g):
            searchable = [
                g.get("name", ""), g.get("category", ""), g.get("subcategory", ""),
                g.get("style", ""), g.get("color", ""), g.get("season", ""),
                g.get("notes", ""), *g.get("tags", []), *g.get("occasions", []),
            ]
            return any(q in str(value).replace("-", " ").lower() for value in searchable)
        items = [g for g in items if matches_search(g)]
    for key, value in (("category", category), ("style", style), ("color", color)):
        if value and value != "all": items = [g for g in items if g.get(key) == value]
    if season and season != "all": items = [g for g in items if g.get("season") in (season, "all-season")]
    if sort == "alphabetical": items.sort(key=lambda g: g.get("name", "").lower())
    elif sort == "category": items.sort(key=lambda g: g.get("category", ""))
    else: items.sort(key=lambda g: g.get("dateAdded", ""), reverse=True)
    return items

@app.post("/api/v1/garments", status_code=201)
def create_garment(payload: GarmentPayload, request: Request):
    user = require_user(request)
    data = payload.model_dump(by_alias=True)
    data["id"] = "g-" + uuid.uuid4().hex[:16]
    data["dateAdded"] = __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat()
    with closing(connect()) as db:
        db.execute("INSERT INTO garments(id,user_id,payload) VALUES(?,?,?)", (data["id"], user["id"], json.dumps(data)))
        db.commit()
    return data

@app.get("/api/v1/garments/{garment_id}")
def get_garment(garment_id: str, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM garments WHERE id=? AND user_id=?", (garment_id, user["id"])).fetchone()
    if not row: raise HTTPException(404, "Garment not found.")
    return json.loads(row["payload"])

@app.patch("/api/v1/garments/{garment_id}")
def update_garment(garment_id: str, payload: GarmentUpdatePayload, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM garments WHERE id=? AND user_id=?", (garment_id, user["id"])).fetchone()
        if not row: raise HTTPException(404, "Garment not found.")
        data = json.loads(row["payload"])
        data.update({k:v for k,v in payload.model_dump(by_alias=True, exclude_unset=True).items() if v is not None})
        db.execute("UPDATE garments SET payload=? WHERE id=? AND user_id=?", (json.dumps(data), garment_id, user["id"]))
        db.commit()
    return data

@app.delete("/api/v1/garments/{garment_id}", status_code=204)
def delete_garment(garment_id: str, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        cur = db.execute("DELETE FROM garments WHERE id=? AND user_id=?", (garment_id, user["id"]))
        if cur.rowcount:
            rows = db.execute("SELECT id, payload FROM outfits WHERE user_id=?", (user["id"],)).fetchall()
            for row in rows:
                outfit = json.loads(row["payload"])
                items = outfit.get("items", [])
                filtered = [item for item in items if not (isinstance(item, dict) and item.get("garmentId") == garment_id)]
                if len(filtered) != len(items):
                    if filtered:
                        outfit["items"] = filtered
                        db.execute("UPDATE outfits SET payload=? WHERE id=? AND user_id=?", (json.dumps(outfit), row["id"], user["id"]))
                    else:
                        db.execute("DELETE FROM outfits WHERE id=? AND user_id=?", (row["id"], user["id"]))
        db.commit()
    if cur.rowcount == 0: raise HTTPException(404, "Garment not found.")
    return Response(status_code=204)

class OutfitPayload(BaseModel):
    id: str
    name: str
    items: list[dict] = []
    occasion: str = "everyday"
    season: str = "all-season"
    style: str = "western"
    dateCreated: str = ""
    isSaved: bool = True

@app.get("/api/v1/outfits")
def list_saved_outfits(request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        rows = db.execute("SELECT payload FROM outfits WHERE user_id=? ORDER BY created_at DESC", (user["id"],)).fetchall()
    return [json.loads(row["payload"]) for row in rows]

@app.post("/api/v1/outfits", status_code=201)
def save_outfit(payload: OutfitPayload, request: Request):
    user = require_user(request)
    data = payload.model_dump()
    garment_ids = {item.get("garmentId") for item in data.get("items", []) if isinstance(item, dict) and item.get("garmentId")}
    if garment_ids:
        placeholders = ",".join("?" for _ in garment_ids)
        with closing(connect()) as db:
            rows = db.execute(f"SELECT id FROM garments WHERE user_id=? AND id IN ({placeholders})", (user["id"], *sorted(garment_ids))).fetchall()
        owned_ids = {row["id"] for row in rows}
        missing_ids = garment_ids - owned_ids
        if missing_ids: raise HTTPException(422, "This outfit contains garments that are unavailable in your wardrobe.")
    data["isSaved"] = True
    with closing(connect()) as db:
        db.execute("INSERT INTO outfits(id,user_id,payload) VALUES(?,?,?) ON CONFLICT(id,user_id) DO UPDATE SET payload=excluded.payload", (data["id"], user["id"], json.dumps(data)))
        db.commit()
    return data

@app.get("/api/v1/outfits/{outfit_id}")
def get_saved_outfit(outfit_id: str, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM outfits WHERE id=? AND user_id=?", (outfit_id, user["id"])).fetchone()
    if not row: raise HTTPException(404, "Saved outfit not found.")
    return json.loads(row["payload"])

@app.delete("/api/v1/outfits/{outfit_id}", status_code=204)
def delete_saved_outfit(outfit_id: str, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        cur = db.execute("DELETE FROM outfits WHERE id=? AND user_id=?", (outfit_id, user["id"]))
        db.commit()
    if cur.rowcount == 0: raise HTTPException(404, "Saved outfit not found.")
    return Response(status_code=204)

DEFAULT_PREFERENCES = {
    "preferredStyles": ["western", "indian"],
    "favoriteColors": ["black", "white", "navy", "beige"],
    "commonOccasions": ["casual", "work", "everyday"],
    "seasonalPreferences": ["all-season"],
    "preferredCategories": ["tops", "bottoms", "indian-ethnic"],
    "displayName": "",
}

@app.get("/api/v1/preferences")
def get_preferences(request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM preferences WHERE user_id=?", (user["id"],)).fetchone()
        if row: return json.loads(row["payload"])
        prefs = {**DEFAULT_PREFERENCES, "displayName": user["name"]}
        db.execute("INSERT INTO preferences(user_id,payload) VALUES(?,?)", (user["id"], json.dumps(prefs)))
        db.commit()
        return prefs

@app.put("/api/v1/preferences")
def update_preferences(payload: dict, request: Request):
    user = require_user(request)
    allowed = set(DEFAULT_PREFERENCES.keys())
    clean = {k: v for k, v in payload.items() if k in allowed}
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM preferences WHERE user_id=?", (user["id"],)).fetchone()
        current = json.loads(row["payload"]) if row else {**DEFAULT_PREFERENCES, "displayName": user["name"]}
        current.update(clean)
        db.execute("INSERT INTO preferences(user_id,payload) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload, updated_at=CURRENT_TIMESTAMP", (user["id"], json.dumps(current)))
        db.commit()
    return current

def _ensure_extended_tables(db):
    db.execute("""CREATE TABLE IF NOT EXISTS outfit_favourites (
        user_id INTEGER NOT NULL, outfit_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(user_id, outfit_id), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)""")
    db.execute("""CREATE TABLE IF NOT EXISTS outfit_wear_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, outfit_id TEXT NOT NULL,
        worn_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, notes TEXT NOT NULL DEFAULT '',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)""")
    db.execute("""CREATE TABLE IF NOT EXISTS outfit_feedback (
        user_id INTEGER NOT NULL, outfit_id TEXT NOT NULL, feedback TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(user_id, outfit_id), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)""")
    db.execute("CREATE INDEX IF NOT EXISTS idx_wear_user_date ON outfit_wear_events(user_id, worn_at)")
    db.commit()

@app.on_event("startup")
def startup_extended_tables():
    init_db()
    with closing(connect()) as db:
        _ensure_extended_tables(db)

class WearPayload(BaseModel):
    wornAt: Optional[str] = None
    notes: str = Field(default="", max_length=500)

class FeedbackPayload(BaseModel):
    feedback: str = Field(pattern="^(like|dislike)$")

class RecommendationPayload(BaseModel):
    occasion: str = "everyday"
    season: str = "all-season"
    style: str = "any"
    limit: int = Field(default=10, ge=1, le=50)

def _owned_outfit(request: Request, outfit_id: str):
    user = require_user(request)
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM outfits WHERE id=? AND user_id=?", (outfit_id, user["id"])).fetchone()
    if not row: raise HTTPException(404, "Saved outfit not found.")
    return user, json.loads(row["payload"])

@app.get("/api/v1/favorites")
def list_favorites(request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        rows = db.execute("""SELECT o.payload, f.created_at FROM outfit_favourites f
            JOIN outfits o ON o.id=f.outfit_id AND o.user_id=f.user_id
            WHERE f.user_id=? ORDER BY f.created_at DESC""", (user["id"],)).fetchall()
    return [json.loads(r["payload"]) for r in rows]

@app.put("/api/v1/favorites/{outfit_id}")
def add_favorite(outfit_id: str, request: Request):
    user, outfit = _owned_outfit(request, outfit_id)
    with closing(connect()) as db:
        db.execute("INSERT OR IGNORE INTO outfit_favourites(user_id,outfit_id) VALUES(?,?)", (user["id"], outfit_id))
        db.commit()
    return {"outfitId": outfit_id, "isFavorite": True}

@app.delete("/api/v1/favorites/{outfit_id}", status_code=204)
def remove_favorite(outfit_id: str, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        cur = db.execute("DELETE FROM outfit_favourites WHERE user_id=? AND outfit_id=?", (user["id"], outfit_id))
        db.commit()
    if cur.rowcount == 0: raise HTTPException(404, "Favourite outfit not found.")
    return Response(status_code=204)

@app.post("/api/v1/outfits/{outfit_id}/wear", status_code=201)
def record_wear(outfit_id: str, payload: WearPayload, request: Request):
    user, _ = _owned_outfit(request, outfit_id)
    worn_at = payload.wornAt or __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat()
    with closing(connect()) as db:
        db.execute("INSERT INTO outfit_wear_events(user_id,outfit_id,worn_at,notes) VALUES(?,?,?,?)", (user["id"], outfit_id, worn_at, payload.notes))
        db.commit()
        event_id = db.execute("SELECT last_insert_rowid()").fetchone()[0]
    return {"id": event_id, "outfitId": outfit_id, "wornAt": worn_at, "notes": payload.notes}

@app.get("/api/v1/wear-history")
def list_wear_history(request: Request, limit: int = 100, offset: int = 0):
    user = require_user(request)
    limit = max(1, min(limit, 200)); offset = max(0, offset)
    with closing(connect()) as db:
        rows = db.execute("""SELECT id,outfit_id,worn_at,notes FROM outfit_wear_events
            WHERE user_id=? ORDER BY worn_at DESC LIMIT ? OFFSET ?""", (user["id"], limit, offset)).fetchall()
    return [{"id":r["id"], "outfitId":r["outfit_id"], "wornAt":r["worn_at"], "notes":r["notes"]} for r in rows]

@app.post("/api/v1/outfits/{outfit_id}/feedback")
def save_outfit_feedback(outfit_id: str, payload: FeedbackPayload, request: Request):
    user, _ = _owned_outfit(request, outfit_id)
    with closing(connect()) as db:
        db.execute("""INSERT INTO outfit_feedback(user_id,outfit_id,feedback) VALUES(?,?,?)
            ON CONFLICT(user_id,outfit_id) DO UPDATE SET feedback=excluded.feedback,updated_at=CURRENT_TIMESTAMP""", (user["id"], outfit_id, payload.feedback))
        db.commit()
    return {"outfitId": outfit_id, "feedback": payload.feedback}

@app.get("/api/v1/outfits/{outfit_id}/feedback")
def get_outfit_feedback(outfit_id: str, request: Request):
    user, _ = _owned_outfit(request, outfit_id)
    with closing(connect()) as db:
        row = db.execute("SELECT feedback,updated_at FROM outfit_feedback WHERE user_id=? AND outfit_id=?", (user["id"], outfit_id)).fetchone()
    return {"outfitId": outfit_id, "feedback": row["feedback"] if row else None, "updatedAt": row["updated_at"] if row else None}

def _colour_score(a, b):
    neutrals = {"black", "white", "navy", "beige", "cream", "grey", "charcoal", "brown", "tan"}
    if not a or not b: return 0
    if a == b: return 2
    if a in neutrals or b in neutrals: return 2
    pairs = {frozenset(("blue","orange")), frozenset(("navy","mustard")), frozenset(("green","pink")), frozenset(("maroon","cream")), frozenset(("purple","yellow")), frozenset(("red","pink"))}
    return 2 if frozenset((a,b)) in pairs else 0

def _compatible_garments(a, b):
    sa, sb = str(a.get("subcategory", "")).lower(), str(b.get("subcategory", "")).lower()
    ca, cb = str(a.get("category", "")).lower(), str(b.get("category", "")).lower()
    role_pairs = [({"tops","indian-ethnic","fusion","outerwear"}, {"bottoms"}), ({"bottoms"}, {"tops","indian-ethnic","fusion"}), ({"dresses"}, {"footwear","accessories","outerwear"}), ({"indian-ethnic","fusion"}, {"indian-ethnic","bottoms","fusion","accessories","footwear"})]
    if sa == "dupatta": return cb in {"indian-ethnic","fusion"} or sb in {"kurta","kurti","saree","lehenga"}
    if sb == "dupatta": return ca in {"indian-ethnic","fusion"} or sa in {"kurta","kurti","saree","lehenga"}
    return any(ca in left and cb in right for left,right in role_pairs) or any(ca in right and cb in left for left,right in role_pairs)

def _get_role(g):
    c, s = str(g.get("category", "")).lower(), str(g.get("subcategory", "")).lower()
    if c == "tops" or c == "fusion" or s in {"kurta", "kurti"}: return "top"
    if c == "bottoms" or s in {"salwar", "churidar", "leggings", "palazzos"}: return "bottom"
    if c == "dresses" or s in {"saree", "lehenga", "sherwani"}: return "dress"
    if c == "footwear": return "footwear"
    if c == "outerwear": return "layer"
    if s == "dupatta" or c == "indian-ethnic": return "ethnic-complement"
    return "accessory"

@app.post("/api/v1/recommendations")
def generate_recommendations(payload: RecommendationPayload, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        garments = [json.loads(r["payload"]) for r in db.execute("SELECT payload FROM garments WHERE user_id=?", (user["id"],)).fetchall()]
        pref_row = db.execute("SELECT payload FROM preferences WHERE user_id=?", (user["id"],)).fetchone()
        prefs = json.loads(pref_row["payload"]) if pref_row else {**DEFAULT_PREFERENCES}
        feedback_rows = db.execute("SELECT outfit_id,feedback FROM outfit_feedback WHERE user_id=?", (user["id"],)).fetchall()
        feedback = {r["outfit_id"]: r["feedback"] for r in feedback_rows}
        
    candidates = []
    for i, a in enumerate(garments):
        for b in garments[i+1:]:
            if not _compatible_garments(a,b): continue
            items = [{"garmentId": a["id"], "role": _get_role(a)}, {"garmentId": b["id"], "role": _get_role(b)}]
            chosen = [a,b]
            base = next((g for g in chosen if str(g.get("subcategory", "")).lower() in {"kurta","kurti","saree","lehenga"}), None)
            if base:
                dupattas = [g for g in garments if str(g.get("subcategory", "")).lower() == "dupatta" and g["id"] not in {a["id"],b["id"]}]
                if dupattas:
                    dupatta = max(dupattas, key=lambda g: _colour_score(g.get("color"),base.get("color")))
                    chosen.append(dupatta); items.append({"garmentId":dupatta["id"],"role":"accessory"})
            styles = {str(g.get("style","western")).lower() for g in chosen}
            style = "fusion" if len(styles)>1 else next(iter(styles))
            if payload.style and payload.style != "any" and style != payload.style and style != "fusion": continue
            score = sum(_colour_score(x.get("color"),y.get("color")) for ix,x in enumerate(chosen) for y in chosen[ix+1:])
            reasons = ["Compatible wardrobe pieces"]
            if score: reasons.append("Colour harmony")
            if any(str(g.get("subcategory", "")).lower() == "dupatta" for g in chosen): reasons.append("Matching dupatta option")
            occ_set = set(sum([[str(o).lower() for o in g.get("occasions",[])] for g in chosen], []))
            if str(payload.occasion).lower() in occ_set: score += 2; reasons.append("Matches occasion")
            season_set = {str(g.get("season", "")).lower() for g in chosen}
            if str(payload.season).lower() in season_set or "all-season" in season_set: score += 1; reasons.append("Season suitable")
            if style in [s.lower() for s in prefs.get("preferredStyles", [])]: score += 1; reasons.append("Matches your preferred style")
            if any(str(g.get("color", "")).lower() in [c.lower() for c in prefs.get("favoriteColors",[])] for g in chosen): score += 1; reasons.append("Uses a favourite colour")
            candidates.append({"items":items,"occasion":payload.occasion,"season":payload.season,"style":style,"recommendationScore":score,"recommendationReasons":reasons})

    with closing(connect()) as db: saved = db.execute("SELECT payload FROM outfits WHERE user_id=?", (user["id"],)).fetchall()
    feedback_sets = []
    for row in saved:
        outfit = json.loads(row["payload"]); fb = feedback.get(outfit.get("id"))
        ids = {x.get("garmentId") for x in outfit.get("items",[]) if isinstance(x,dict)}
        if fb and ids: feedback_sets.append((ids,fb))
    for candidate in candidates:
        ids = {x["garmentId"] for x in candidate["items"]}
        for seen,fb in feedback_sets:
            if ids == seen:
                candidate["recommendationScore"] += 3 if fb=="like" else -5
                candidate["recommendationReasons"].append("Adjusted using your previous feedback")
    candidates.sort(key=lambda c:c["recommendationScore"], reverse=True)
    return candidates[:payload.limit]

@app.get("/api/v1/analytics/wardrobe")
def wardrobe_analytics(request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        garments = [json.loads(r["payload"]) for r in db.execute("SELECT payload FROM garments WHERE user_id=?", (user["id"],)).fetchall()]
        outfits = [json.loads(r["payload"]) for r in db.execute("SELECT payload FROM outfits WHERE user_id=?", (user["id"],)).fetchall()]
        fav_count = db.execute("SELECT COUNT(*) FROM outfit_favourites WHERE user_id=?", (user["id"],)).fetchone()[0]
        wear_count = db.execute("SELECT COUNT(*) FROM outfit_wear_events WHERE user_id=?", (user["id"],)).fetchone()[0]
        feedback_count = db.execute("SELECT COUNT(*) FROM outfit_feedback WHERE user_id=?", (user["id"],)).fetchone()[0]
    def counts(key):
        result={}
        for g in garments:
            value=g.get(key) or "unknown"; result[value]=result.get(value,0)+1
        return result
    return {"totalGarments":len(garments),"byCategory":counts("category"),"byStyle":counts("style"),"byColor":counts("color"),"savedOutfits":len(outfits),"favourites":fav_count,"wearEvents":wear_count,"feedbackEntries":feedback_count}

@app.get("/api/v1/analytics/activity")
def activity_analytics(request: Request, limit: int = 30):
    user = require_user(request); limit=max(1,min(limit,100))
    with closing(connect()) as db:
        wears = db.execute("SELECT id,outfit_id,worn_at,notes FROM outfit_wear_events WHERE user_id=? ORDER BY worn_at DESC LIMIT ?", (user["id"],limit)).fetchall()
        feedback = db.execute("SELECT outfit_id,feedback,updated_at FROM outfit_feedback WHERE user_id=? ORDER BY updated_at DESC LIMIT ?", (user["id"],limit)).fetchall()
        favorites = db.execute("SELECT outfit_id,created_at FROM outfit_favourites WHERE user_id=? ORDER BY created_at DESC LIMIT ?", (user["id"],limit)).fetchall()
    return {"recentWears":[{"id":r["id"],"outfitId":r["outfit_id"],"wornAt":r["worn_at"],"notes":r["notes"]} for r in wears],"recentFeedback":[{"outfitId":r["outfit_id"],"feedback":r["feedback"],"updatedAt":r["updated_at"]} for r in feedback],"recentFavourites":[{"outfitId":r["outfit_id"],"createdAt":r["created_at"]} for r in favorites]}

# ==========================================
# NEW: GET /api/v1/weather
# Connects perfectly to your frontend WeatherSuggestionsPage.tsx
# ==========================================
@app.get("/api/v1/weather")
@limiter.limit("10/minute") 
def get_weather_suggestions(lat: float, lon: float, request: Request):
    user_id = require_user(request)["id"]
    
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code"
        req = urllib.request.Request(url, headers={'User-Agent': 'SmartWardrobe/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            temp = data.get("current", {}).get("temperature_2m", 25)
            wcode = data.get("current", {}).get("weather_code", 0)
    except Exception as e:
        print(f"Weather API Error: {e}")
        temp = 25.0
        wcode = 0

    condition = "clear"
    if wcode in [1, 2, 3]: condition = "partly cloudy"
    elif wcode in [45, 48]: condition = "fog"
    elif wcode in [51, 53, 55, 61, 63, 65, 80, 81, 82]: condition = "rain"
    elif wcode in [71, 73, 75, 85, 86]: condition = "snow"
    elif wcode in [95, 96, 99]: condition = "thunderstorm"

    if temp >= 25: season = "summer"
    elif temp >= 15: season = "spring"
    elif temp >= 5: season = "autumn"
    else: season = "winter"
        
    with closing(connect()) as db:
        # Fetch the entire wardrobe for the user, then filter in Python
        rows = db.execute("SELECT id, payload FROM garments WHERE user_id=?", (user_id,)).fetchall()
        wardrobe = [json.loads(row["payload"]) for row in rows]
        
        # Filter logic strictly by season
        def filter_items(cats):
            res = []
            for item in wardrobe:
                cat = item.get("category", "").lower()
                s = item.get("season", "").lower()
                if cat in cats and s in [season, "all", "all-season", ""]:
                    res.append({
                        "id": item.get("id"),
                        "name": item.get("name"),
                        "category": cat,
                        "subcategory": item.get("subcategory", ""),
                        "color": item.get("color", ""),
                        "image_url": item.get("imageData", "") 
                    })
            return res[:10]

        recommendations = {
            "tops": filter_items(["tops", "indian-ethnic"]),
            "bottoms": filter_items(["bottoms"]),
            "outerwear": filter_items(["outerwear"]),
            "footwear": filter_items(["footwear"])
        }
        
    return {
        "temperature": temp,
        "condition": condition,
        "season_detected": season,
        "recommendations": recommendations
    }

class LookbookPayload(BaseModel):
    prompt: str
    occasion: str = "casual"
    style: str = "western"

@app.post("/api/v1/lookbook")
@limiter.limit("30/hour") 
def generate_lookbook(payload: LookbookPayload, request: Request):
    require_user(request)
    safe_prompt = urllib.parse.quote(f"{payload.prompt} {payload.occasion} {payload.style} fashion editorial photography high quality 8k")
    image_url = f"https://image.pollinations.ai/prompt/{safe_prompt}?nologo=true"
    return {
        "status": "success",
        "imageUrl": image_url,
        "disclaimer": "AI-generated lookbook imagery is for inspiration only."
    }