# SmartWardrobe AI

**Your wardrobe, reimagined.** SmartWardrobe AI is a full-stack digital closet and outfit-planning application that helps users organise clothing they already own, explore combinations, save outfits, and understand wardrobe usage. It supports **Indian, Western, and Fusion** fashion — treating ethnic wear as a first-class citizen, not an afterthought.

> **Project status:** Working university-project prototype. The frontend and backend are fully implemented for local development. This repository does not claim a production deployment or a trained outfit-recommendation model.

---

## ✨ Features

### Accounts & Privacy
- Registration, login, logout with secure password hashing (PBKDF2-SHA256).
- Password reset flow via email (Resend integration).
- Signed HttpOnly session cookies with configurable security.
- Account-scoped wardrobe data — each user sees only their own items.

### Digital Wardrobe
- Add, browse, search, filter, edit, and remove garments with rich metadata (category, subcategory, style, colour, season, occasions, tags, notes).
- **8 garment categories:** Tops, Bottoms, Dresses, Indian Ethnic, Fusion, Footwear, Accessories, Outerwear — with 50+ subcategories including kurtas, sarees, lehengas, juttis, kolhapuris, and more.
- **Two wardrobe views:** editorial-style *Clothing Rail* and practical *Grid* view.

### AI-Powered Image Processing
- **Background removal** on uploaded garment photos using `rembg` (ONNX-based, runs locally).
- Drag-and-drop image upload with instant clean output.

### Virtual Try-On *(experimental)*
- Upload a human photo and a garment image to preview how clothes look on you, powered by Replicate's IDM-VTON model.

### Outfit Discovery & Recommendations
- Rule-based outfit generation using garment compatibility logic, colour harmony scoring, and season/occasion filtering.
- Recommendations personalised by user preferences and feedback history.
- Supports Indian ethnic pairing logic (e.g. kurta + churidar + matching dupatta).

### Outfit Management
- Save, browse, and delete outfits.
- Mark outfits as favourites.
- Record when you wore an outfit and add notes.
- Like/dislike feedback that influences future recommendations.

### Outfit Planner
- Calendar-based outfit planning — assign saved looks to specific dates.
- Browse and manage planned outfits by month.

### Weather-Aware Suggestions
- Location-based live weather data from Open-Meteo (free, no API key required).
- Automatic season detection from temperature.
- Wardrobe-filtered clothing suggestions matching the current weather.

### AI Lookbook
- Generate fashion-editorial inspiration images from text prompts using Pollinations AI.
- Customise by occasion and style.

### Dashboard & Analytics
- **Overview dashboard** with wardrobe stats, live weather widget, and quick-action links.
- **Wardrobe analytics:** garment counts by category, style, and colour.
- **Activity analytics:** recent wears, feedback history, and favourite trends.

### Style Personalisation
- Set preferred styles, favourite colours, common occasions, seasonal preferences, and preferred categories.
- Preferences feed into the recommendation engine.

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 19, TypeScript 6, Vite 8 |
| **Styling** | Tailwind CSS 4, Lucide React icons |
| **Routing** | React Router 7 |
| **HTTP Client** | Custom fetch-based API client with typed error handling |
| **Drag & Drop** | react-dropzone |
| **Calendar** | react-calendar |
| **Date Utilities** | date-fns |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | SQLite (local prototype) |
| **Auth** | PBKDF2-SHA256 hashing, itsdangerous signed sessions |
| **Rate Limiting** | slowapi |
| **Image Processing** | rembg (background removal), Pillow |
| **Virtual Try-On** | Replicate API (IDM-VTON model) |
| **Email** | Resend (password reset emails) |
| **Weather** | Open-Meteo API (free, no key required) |
| **Lookbook** | Pollinations AI (image generation) |
| **Linting** | oxlint |
| **Backend Tests** | Pytest + httpx |

## 📁 Project Structure

```
smartwardrobe-ai/
├── frontend/               # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/                # UI components, pages, hooks, services
│   ├── public/             # Static assets & icons
│   ├── package.json        # Frontend dependencies & build scripts
│   ├── vite.config.ts      # Vite configuration
│   └── vercel.json         # Vercel deployment configuration
├── backend/                # FastAPI + SQLite + Python service
│   ├── main.py             # FastAPI app, API routes, SQLite models
│   ├── requirements.txt    # Python dependencies
│   └── tests/              # Backend pytest regression tests
├── docs/                   # Milestone notes & architecture specifications
├── vercel.json             # Root Vercel deployment configuration
├── package.json            # Monorepo convenience scripts (npm run dev/build)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** and **npm** (compatible with Vite 8)
- **Python 3.10+** with `venv` support

### 1. Clone and install the frontend

```bash
git clone https://github.com/Regal-Rose/smartwardrobe-ai.git
cd smartwardrobe-ai/frontend
npm install
```

Create the frontend environment file:

**PowerShell:**
```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux:**
```bash
cp .env.example .env.local
```

Default frontend settings (`.env.local`):

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_DATA_MODE=http
```

> `http` connects to the FastAPI backend. Set `VITE_DATA_MODE=mock` only when intentionally exploring local demo data — it is not a substitute for authenticated account storage.

### 2. Set up and run the backend

Open a **second terminal:**

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Copy the environment file and configure your secrets:

**PowerShell:**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

Edit `backend/.env` — at minimum, replace `SMARTWARDROBE_SECRET` with a long, unique secret:

```dotenv
SMARTWARDROBE_SECRET=replace-with-a-long-random-secret
SMARTWARDROBE_DB=./smartwardrobe.db
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
COOKIE_SECURE=false
```

**Optional keys** (features degrade gracefully without these):

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Password-reset emails via Resend |
| `REPLICATE_API_TOKEN` | Virtual try-on via Replicate |

Start the API:

```bash
uvicorn main:app --reload --port 8000
```

- Health check: http://localhost:8000/api/health
- Interactive API docs: http://localhost:8000/docs

### 3. Start the frontend

Back in the project root:

```bash
npm run dev
```

Open the URL printed by Vite (typically http://localhost:5173). Register or log in to start using the app.

---

## 📱 Application Areas

| Area | Route | Purpose |
| --- | --- | --- |
| **Overview** | `/overview` | Dashboard with wardrobe stats, weather, and quick actions |
| **Wardrobe** | `/wardrobe` | Rail/grid browsing, garment details, add/edit/delete |
| **Discover Outfits** | `/discover` | Rule-based outfit recommendations from your wardrobe |
| **Outfit Builder** | `/builder` | Compose and try on looks (virtual try-on) |
| **Outfit Planner** | `/planner` | Calendar-based outfit planning |
| **Saved Outfits** | `/saved` | Manage saved outfit combinations |
| **Weather** | `/weather` | Live weather-aware clothing suggestions |
| **Lookbook** | `/lookbook` | AI-generated fashion editorial imagery |
| **Upload** | `/upload` | Drag-and-drop garment upload with background removal |
| **Preferences** | `/preferences` | Set style, colour, occasion, and season preferences |
| **Settings** | `/settings` | Account and app settings |

---

## 📡 API Overview

The FastAPI backend exposes these route groups (full schemas at `/docs`):

| Group | Routes |
| --- | --- |
| **Health** | `GET /api/health` |
| **Auth** | `POST /api/v1/auth/register`, `/login`, `/logout`, `/forgot-password`, `/reset-password` · `GET /api/v1/auth/me` |
| **Garments** | `GET/POST /api/v1/garments` · `GET/PATCH/DELETE /api/v1/garments/{id}` |
| **Outfits** | `GET/POST /api/v1/outfits` · `GET/DELETE /api/v1/outfits/{id}` |
| **Recommendations** | `POST /api/v1/recommendations` |
| **Preferences** | `GET/PUT /api/v1/preferences` |
| **Favourites** | `GET /api/v1/favorites` · `PUT/DELETE /api/v1/favorites/{id}` |
| **Wear Tracking** | `POST /api/v1/outfits/{id}/wear` · `GET /api/v1/wear-history` |
| **Feedback** | `POST/GET /api/v1/outfits/{id}/feedback` |
| **Analytics** | `GET /api/v1/analytics/wardrobe` · `GET /api/v1/analytics/activity` |
| **Weather** | `GET /api/v1/weather?lat=…&lon=…` |
| **Lookbook** | `POST /api/v1/lookbook` |
| **Upload** | `POST /api/upload-clothing` |
| **Try-On** | `POST /api/try-on` |
| **Planner** | `POST /api/planner` · `GET /api/planner/{month}` · `DELETE /api/planner/{id}` |

All authenticated endpoints require a valid session cookie. The backend owns access control and data persistence — the frontend never connects directly to the database.

---

## 📂 Project Layout

```text
smartwardrobe-ai/
├── public/                        # Static assets (favicon, icons)
├── src/
│   ├── app/
│   │   └── ServiceProvider.tsx    # DI / repository wiring
│   ├── assets/                    # Images (hero, logos)
│   ├── auth/
│   │   ├── AuthPages.tsx          # Login, register, landing, session check
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Sidebar + header shell
│   │   │   ├── Header.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/                    # Reusable UI primitives (Button, Modal, Badge, etc.)
│   │   ├── wardrobe/              # Garment grid, rail, detail, edit, add modal
│   │   └── UploadClothing.tsx     # Drag-and-drop upload with background removal
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   └── useWardrobe.ts
│   ├── pages/                     # All application screens
│   │   ├── DashboardOverview.tsx
│   │   ├── WardrobePage.tsx
│   │   ├── DiscoverOutfitsPage.tsx
│   │   ├── OutfitBuilderPage.tsx
│   │   ├── OutfitPlannerPage.tsx
│   │   ├── SavedOutfitsPage.tsx
│   │   ├── WeatherSuggestionsPage.tsx
│   │   ├── LookbookPage.tsx
│   │   ├── PreferencesPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts          # Typed fetch wrapper
│   │   │   └── endpoints.ts      # Endpoint constants
│   │   └── repositories/
│   │       ├── interfaces.ts      # Repository contracts
│   │       ├── HttpGarmentRepository.ts
│   │       ├── HttpOutfitRepository.ts
│   │       ├── HttpPreferencesRepository.ts
│   │       └── mock/              # Mock implementations for offline dev
│   ├── types/
│   │   └── index.ts               # All TypeScript types, enums, and display constants
│   ├── App.tsx                    # Route definitions + protected area logic
│   ├── index.css
│   └── main.tsx
├── backend/
│   ├── main.py                    # FastAPI application (all endpoints)
│   ├── requirements.txt
│   ├── .env.example
│   ├── uploaded_clothes/          # Processed garment images
│   ├── tests/
│   │   ├── test_account_isolation.py
│   │   └── test_extended_features.py
│   └── README.md
├── .env.example
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## ✅ Quality Checks

**Frontend** (from project root):

```bash
npm run lint     # oxlint
npm run build    # TypeScript + Vite production build
```

**Backend** (from `backend/` with venv activated):

```bash
pip install pytest httpx
pytest tests -v
```

---

## 🔒 Security & Limitations

- Passwords are hashed with PBKDF2-SHA256 (310,000 iterations).
- Session cookies are signed, HttpOnly, SameSite=Strict.
- Rate limiting on login (10/min), password reset (3/hour), weather (10/min), and lookbook (30/hour).
- Payload size capped at 100 MB.
- HTTPS redirect middleware activates automatically in production (`ENVIRONMENT=production`).
- Configure a strong `SMARTWARDROBE_SECRET`, appropriate `FRONTEND_ORIGINS`, and `COOKIE_SECURE=true` for any non-local deployment.
- Do **not** commit `.env` files, secrets, user databases, or personal garment images.
- The local prototype uses **SQLite** — not recommended for production concurrency.
- Virtual try-on requires a Replicate API token and external network access.
- Weather features require location permission in the browser and outbound connectivity to Open-Meteo.
- The application has not been independently security-audited or production-hardened.

---

## 🏗 Architecture Highlights

- **Repository pattern** — `GarmentRepository`, `OutfitRepository`, and `PreferencesRepository` interfaces allow swapping between HTTP and mock data backends.
- **Service provider** — centralised DI via `ServiceProvider.tsx` based on `VITE_DATA_MODE`.
- **Typed API client** — custom fetch wrapper with generic error handling, multipart upload support, and credential forwarding.
- **Comprehensive type system** — 348 lines of TypeScript types covering every garment category, subcategory, colour (27 colours + hex map), occasion (10 types), style, season, and UI display helpers.
- **Rule-based recommendation engine** — garment compatibility matrix, colour harmony scoring, dupatta pairing, preference weighting, and feedback loop.

---

## 🎓 Academic Context

SmartWardrobe AI demonstrates frontend/backend integration, relational data persistence, account-aware data access, wardrobe and outfit management, AI-powered image processing, rule-based recommendations, live API consumption (weather), and analytics. The project is designed to be extensible to cloud storage, advanced recommendation models, and richer personalisation.

---

## 📦 Repository

[GitHub — SmartWardrobe AI](https://github.com/Regal-Rose/smartwardrobe-ai)

---

*SmartWardrobe AI — organise what you own, discover what you can wear.*
