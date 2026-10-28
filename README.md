# SmartWardrobe AI

**Your wardrobe, reimagined.** SmartWardrobe AI is a full-stack digital closet and outfit-planning application that helps users organise clothing they already own, explore combinations, save outfits, and understand wardrobe usage. It supports **Indian, Western, and fusion** fashion rather than treating ethnic wear as an afterthought.

> **Project status:** Working university-project prototype. The frontend and backend are implemented for local development. This repository does not claim a production deployment, a trained outfit-recommendation model, or virtual try-on.

## Features

- **Accounts and privacy:** Registration, login, logout, password-reset endpoints, protected routes, and account-scoped wardrobe data.
- **Digital wardrobe:** Add, browse, search, filter, edit, and remove garments, with image handling and garment metadata.
- **Two wardrobe views:** Editorial-style **clothing rail** and practical **grid** view.
- **Outfit discovery:** Generate wardrobe-based suggestions using compatibility logic and user selections.
- **Outfit management:** Save outfits, mark favourites, and access saved looks.
- **Personalisation:** Store and update style preferences and provide outfit feedback.
- **Wear tracking and analytics:** Record outfit wears, view wear history, and explore wardrobe/activity analytics.
- **Additional experiences:** Outfit builder, outfit planner, weather suggestions, and lookbook screens.

Some features depend on backend configuration, user data, and external service availability. Outfit recommendations are **rule-based**, not a claim of a trained machine-learning model.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS 4, Lucide React |
| Routing | React Router 7 |
| Backend | Python, FastAPI, Uvicorn |
| Database | SQLite for the current local prototype |
| Authentication | Password hashing and signed HttpOnly session cookies |
| API | REST endpoints under `/api/v1` |
| Backend tests | Pytest-based tests in `backend/tests/` |

## Getting started

### Prerequisites

- Node.js and npm compatible with the project's Vite version
- Python 3 with `venv` support

### 1. Clone and install the frontend

```bash
git clone https://github.com/Regal-Rose/smartwardrobe-ai.git
cd smartwardrobe-ai
npm install
```

Create the frontend environment file:

**PowerShell:**
```powershell
Copy-Item .env.example .env.local
```

**macOS/Linux:**
```bash
cp .env.example .env.local
```

Example frontend settings:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_DATA_MODE=http
```

`http` uses the FastAPI service. Set `VITE_DATA_MODE=mock` only when intentionally exploring local demo data; it is not a substitute for authenticated account storage.

### 2. Set up and run the backend

Open a **second terminal**:

```bash
cd backend
python -m venv .venv
```

Activate the environment:

**Windows PowerShell:**
```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env`, then replace `SMARTWARDROBE_SECRET` with a long, unique secret. The example also configures the SQLite database path, frontend origins, and cookie security settings.

Start the API from the `backend` directory:

```bash
python -m uvicorn main:app --reload --port 8000
```

API health check: `http://localhost:8000/api/health`  
Interactive API documentation: `http://localhost:8000/docs`

### 3. Start the frontend

Back in the project root:

```bash
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). Register or log in, then use the wardrobe and outfit features.

## Main application areas

| Area | Purpose |
| --- | --- |
| Overview | Wardrobe snapshot and activity overview |
| My Wardrobe | Rail/grid browsing, garment details and management |
| Discover Outfits | Wardrobe-based outfit suggestions |
| Outfit Builder / Planner | Compose and plan looks |
| Saved Outfits | Manage saved combinations |
| Preferences / Settings | Personalise style and account experience |
| Weather Suggestions | Weather-related outfit guidance |
| Lookbook | Explore a curated presentation of looks |

## API overview

The FastAPI backend exposes the following route groups (see `/docs` for request and response schemas):

| Group | Representative routes |
| --- | --- |
| Health | `GET /api/health` |
| Authentication | `/api/v1/auth/register`, `/login`, `/me`, `/logout`, `/forgot-password`, `/reset-password` |
| Garments | `GET/POST /api/v1/garments`, `GET/PATCH/DELETE /api/v1/garments/{garment_id}` |
| Outfits | `GET/POST /api/v1/outfits`, `GET/DELETE /api/v1/outfits/{outfit_id}` |
| Recommendations | `POST /api/v1/recommendations` |
| Preferences | `GET/PUT /api/v1/preferences` |
| Favourites | `GET /api/v1/favorites`, `PUT/DELETE /api/v1/favorites/{outfit_id}` |
| Wear and feedback | `POST /api/v1/outfits/{outfit_id}/wear`, `GET /api/v1/wear-history`, outfit feedback routes |
| Analytics | `GET /api/v1/analytics/wardrobe`, `GET /api/v1/analytics/activity` |
| Other | `GET /api/v1/weather`, `POST /api/v1/lookbook` |

API endpoints require authentication where applicable. The backend owns access control and data persistence; the frontend does not connect directly to the database.

## Project layout

```text
smartwardrobe-ai/
├── public/                 # Public assets
├── src/
│   ├── app/                # Application setup
│   ├── assets/             # Frontend assets
│   ├── components/         # Reusable interface components
│   ├── hooks/              # React hooks
│   ├── pages/              # Application screens
│   ├── services/           # Data access and integrations
│   ├── types/              # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   ├── main.py             # FastAPI application and endpoints
│   ├── requirements.txt
│   ├── tests/              # Backend tests
│   └── README.md
├── .env.example
├── package.json
└── README.md
```

## Quality checks

Frontend (project root):

```bash
npm run lint
npm run build
```

Backend (with dependencies installed, from `backend/`):

```bash
python -m pip install pytest httpx
python -m pytest tests -v
```

These commands are provided for local verification; this README does not assert a particular test result or coverage percentage.

## Security and limitations

- Passwords are hashed; the backend uses signed HttpOnly session cookies.
- API operations should be accessed only through authorised user sessions.
- Configure a strong `SMARTWARDROBE_SECRET`, appropriate CORS origins, HTTPS, and `COOKIE_SECURE=true` for HTTPS deployment.
- Do not commit `.env` files, secrets, user databases, or personal garment images.
- The local prototype uses **SQLite**. Uploaded garment images may be stored as data URLs in the database; this is not an ideal production media-storage architecture.
- Weather features may require external connectivity and/or permission to access location.
- The application has not been presented here as independently security-audited or production-hardened.
- **Azure deployment, trained AI image classification, and virtual try-on are not claimed as implemented** by this README.

## Academic context

SmartWardrobe AI demonstrates frontend/backend integration, relational data persistence, account-aware data access, wardrobe and outfit management, rule-based recommendations, and analytics. The project is designed to be extensible to cloud storage, more advanced recommendation models, and richer personalisation.

## Repository

[GitHub — SmartWardrobe AI](https://github.com/Regal-Rose/smartwardrobe-ai)

---

*SmartWardrobe AI — organise what you own, discover what you can wear.*
