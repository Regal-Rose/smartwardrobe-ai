# SmartWardrobe AI

**Digitise your wardrobe. Discover what you can wear.**

SmartWardrobe AI is a full-stack web application for organising the clothes you already own, generating outfit combinations from them, and planning what to wear. It treats **Indian, Western and Fusion** clothing as equals: kurtas, kurtis, sarees, lehengas, dupattas, salwars and juttis sit alongside shirts, jeans and dresses.

| | |
|---|---|
| **Live app (frontend)** | https://smartwardrobe-ai-r9cg.vercel.app/ |
| **API (backend)** | https://smartwardrobe-ai-1.onrender.com/ (interactive docs at `/docs`) |
| **Repository** | https://github.com/Regal-Rose/smartwardrobe-ai |
| **Team** | Faeza Zafar (25LBCS3098), Priyanshu Kumar (25LBCS3053) |
| **Institution** | Chandigarh University, B.Tech CSE (AI & ML), Integrated Full-Stack Project |

---

## Features

| Area | What it does | Needs |
|---|---|---|
| **Accounts** | Register, log in, log out, password reset by email. Every user sees only their own data. | `RESEND_API_KEY` for reset emails |
| **Wardrobe** | Add, search, filter, edit and delete garments (category, subcategory, style, colour, season, occasions, tags, notes, photo). Grid and "clothing rail" views. | none |
| **Categories** | Tops, Bottoms, Dresses, Indian Ethnic, Fusion, Footwear, Accessories, Outerwear | none |
| **Discover** | Generates outfit combinations from your wardrobe using a transparent **rule-based scoring engine**: garment compatibility, colour harmony, occasion, season, your saved preferences, and dupatta pairing for Indian wear. | none |
| **Saved outfits** | Save and delete outfits | none |
| **Planner** | Calendar view; assign saved outfits to dates | none |
| **Weather** | Uses your location and live Open-Meteo data to detect the season and filter your wardrobe | browser location permission |
| **Virtual Try-On** | Upload a photo of yourself and a garment; the image is sent to Replicate's IDM-VTON model | `REPLICATE_API_TOKEN` |
| **AI Lookbook** | Text prompt to fashion-editorial image via Pollinations | internet access |
| **Background removal** | Removes the background from a garment photo using `rembg` | `pip install rembg` (not in `requirements.txt`) |
| **Preferences** | Preferred styles, favourite colours, occasions, seasons; used by Discover | none |
| **Dashboard** | Wardrobe totals and live weather | none |

### How AI is used (and how it is not)

- **Outfit recommendations are rule-based, not a trained model.** Scoring is deterministic: compatibility matrix, colour-harmony pairs, occasion/season matches and preference weighting. There is no model training and no LLM call in the recommendation path.
- **Third-party AI models are used for three features:** virtual try-on (Replicate, `cuuupid/idm-vton`), image generation (Pollinations), and background removal (`rembg`, run locally).
- The project does not train, fine-tune or host its own machine-learning model.

---

## Architecture

```
Browser (React SPA, Vercel)
   │  HTTPS, JSON, cookies (credentials: include)
   ▼
FastAPI backend (Render)  ──►  SQLite file
   │
   ├──► Open-Meteo        (weather)
   ├──► Replicate         (virtual try-on)
   ├──► Resend            (password-reset email)
   └──► rembg (local)     (background removal)

Browser ──► Nominatim (reverse geocoding)
Browser ──► Pollinations (lookbook image URL built by the backend)
```

- The frontend never touches the database; all data goes through the REST API.
- Authentication uses a **signed, HttpOnly session cookie** (not JWT).
- Frontend data access uses a **repository pattern** (`GarmentRepository`, `OutfitRepository`, `PreferencesRepository`) with HTTP and mock implementations, selected by `VITE_DATA_MODE`.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS 4, axios, react-dropzone, react-calendar, date-fns, lucide-react |
| Backend | Python, FastAPI, Uvicorn, Pydantic v2 |
| Database | SQLite (`sqlite3` standard library, no ORM) |
| Auth and security | PBKDF2-HMAC-SHA256 (310,000 iterations), itsdangerous signed cookies, slowapi rate limiting, CORS, HTTPS redirect in production |
| Integrations | Replicate, Resend, Open-Meteo, Pollinations, Nominatim, rembg |
| Tests | pytest + httpx (backend) |
| Hosting | Vercel (frontend), Render (backend) |

---

## Project structure

```
smartwardrobe-ai/
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  routes + ProtectedArea (session check)
│   │   ├── auth/                    login, register, forgot/reset password
│   │   ├── pages/                   Dashboard, Wardrobe, Discover, Planner, Try-On,
│   │   │                            Weather, Lookbook, Saved, Preferences, Settings
│   │   ├── components/              layout, ui primitives, wardrobe components
│   │   ├── hooks/                   useWardrobe, useTheme
│   │   ├── services/api/            client.ts (fetch wrapper), endpoints.ts
│   │   ├── services/repositories/   Http* and Mock* repositories
│   │   └── types/index.ts           shared types and display constants
│   └── vercel.json
├── backend/
│   ├── main.py                      FastAPI app, all routes, SQLite schema
│   ├── requirements.txt
│   ├── .env.example
│   └── tests/                       account isolation + extended feature tests
├── docs/                            milestone notes
├── vercel.json
└── package.json
```

---

## API overview

35 endpoints. Full request/response schemas: `/docs` (Swagger UI).

| Group | Endpoints | Auth |
|---|---|---|
| Health | `GET /api/health` | no |
| Auth | `POST /api/v1/auth/register`, `login`, `logout`, `forgot-password`, `reset-password`; `GET /api/v1/auth/me` | login/register/reset: no |
| Garments | `GET, POST /api/v1/garments`; `GET, PATCH, DELETE /api/v1/garments/{id}` | yes |
| Outfits | `GET, POST /api/v1/outfits`; `GET, DELETE /api/v1/outfits/{id}` | yes |
| Preferences | `GET, PUT /api/v1/preferences` | yes |
| Planner | `POST /api/planner`; `GET /api/planner/{YYYY-MM}`; `DELETE /api/planner/{id}` | yes |
| Weather | `GET /api/v1/weather?lat=&lon=` | yes |
| Lookbook | `POST /api/v1/lookbook` | yes |
| Analytics | `GET /api/v1/analytics/wardrobe`, `/activity` | yes |
| Recommendations | `POST /api/v1/recommendations` (rule-based, server-side) | yes |
| Favourites | `GET /api/v1/favorites`; `PUT, DELETE /api/v1/favorites/{id}` | yes |
| Wear tracking | `POST /api/v1/outfits/{id}/wear`; `GET /api/v1/wear-history` | yes |
| Feedback | `POST, GET /api/v1/outfits/{id}/feedback` | yes |
| Image tools | `POST /api/upload-clothing`, `POST /api/try-on` | no (see Known limitations) |

---

## Database

SQLite, created automatically at startup. Eight tables, all linked to `users`:

`users`, `garments`, `outfits`, `preferences`, `outfit_favourites`, `outfit_wear_events`, `outfit_feedback`, `planned_outfits`.

`garments`, `outfits` and `preferences` store their attributes as a JSON `payload` column. The other tables use ordinary columns. Explicit indexes: `idx_wear_user_date`, `idx_planned_user_date`.

---

## Getting started

**Prerequisites:** Node.js (compatible with Vite 8) and Python 3.10+.

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env              # then edit .env
uvicorn main:app --reload --port 8000
```

Health check: http://localhost:8000/api/health, API docs: http://localhost:8000/docs

Optional features:

```bash
pip install rembg onnxruntime     # background removal
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:5173.

### Environment variables

**Backend (`backend/.env`)**

| Variable | Purpose | Default |
|---|---|---|
| `SMARTWARDROBE_SECRET` | Signs session cookies and reset tokens. **Set a long random value.** | insecure dev fallback |
| `SMARTWARDROBE_DB` | SQLite file path | `backend/smartwardrobe.db` |
| `FRONTEND_ORIGINS` | Comma-separated allowed CORS origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `FRONTEND_URL` | Base URL used in reset-email links | first origin |
| `ENVIRONMENT` | `production` forces secure cookies and HTTPS redirect | `development` |
| `COOKIE_SECURE` | `true` behind HTTPS | `false` |
| `RESEND_API_KEY` | Password-reset emails | unset (emails skipped) |
| `REPLICATE_API_TOKEN` | Virtual try-on | unset |
| `PORT` | Port when started with `python main.py` | `8000` |

**Frontend (`frontend/.env.local`)**

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend URL, e.g. `https://smartwardrobe-ai-1.onrender.com` |
| `VITE_DATA_MODE` | `http` (real backend) or `mock` (local demo data) |

---

## Deployment

**Frontend (Vercel):** import the repo, framework Vite, set `VITE_API_BASE_URL` and `VITE_DATA_MODE=http`. `vercel.json` rewrites all routes to `index.html` for client-side routing.

**Backend (Render):** web service from the `backend/` directory. Install: `pip install -r requirements.txt`. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT` (or `python main.py`). Set `ENVIRONMENT=production`, a strong `SMARTWARDROBE_SECRET`, `FRONTEND_ORIGINS` (your Vercel URL), and any optional API keys.

> **Data persistence:** SQLite is stored in a local file. On hosting plans without a persistent disk, the file can be lost on redeploy or restart. Attach a persistent disk or move to a managed database for real use.

---

## Testing

```bash
cd backend
pip install pytest httpx
python -m pytest tests -q
```

7 backend tests cover registration, per-account isolation of garments, outfits and preferences, search, garment-deletion cleanup, favourites, wear history, feedback, analytics, recommendations, and planner isolation. The frontend has no automated tests yet; lint with `npm run lint`.

---

## Security

- Passwords: PBKDF2-HMAC-SHA256, 310,000 iterations, per-user random salt, constant-time comparison.
- Sessions: signed, time-limited, HttpOnly cookie. `Secure` and `SameSite=None` in production (cross-site Vercel to Render); `SameSite=Lax` locally.
- All user data queries are parameterised and filtered by `user_id`.
- Rate limits: login 10/min, forgot-password 3/hour, reset-password 5/min, weather 10/min, lookbook 30/hour.
- Request body size cap: 100 MB. CORS restricted to configured origins plus `*.vercel.app`.

---

## Known limitations

- Recommendations are rule-based; there is no learned model.
- `/api/upload-clothing` and `/api/try-on` do not require login; the background-removal output is written to disk but not served back by the API.
- `rembg` is not in `requirements.txt`; background removal needs a manual install.
- SQLite is single-file and not suited to heavy concurrent use; images are stored as base64 inside JSON.
- The CORS rule allows any `*.vercel.app` origin; tighten to your exact domain for production.
- SQLite foreign-key enforcement (`PRAGMA foreign_keys`) is not enabled.
- No frontend tests, CSRF tokens or structured logging.

---

## Roadmap

Move images to object storage; replace SQLite with a managed database; wire the server-side recommendation, favourites, wear-tracking and feedback endpoints into the UI; add authentication to the image endpoints; add CI and frontend tests.

---

*SmartWardrobe AI: organise what you own, discover what you can wear.*
