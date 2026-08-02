# Traversal — Technical Documentation

> Last updated: 2026-06-21
> Status: Phase 1 — In Development

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Architecture](#4-architecture)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [Phase 1 — What's Done](#7-phase-1--whats-done)
8. [Phase 1 — In Progress](#8-phase-1--in-progress)
9. [Future Phases](#9-future-phases)

---

## 1. Product Overview

**Traversal** is a map-based note-taking app. Users drop pins anywhere in the world, attach rich-text notes to them, and those pins persist across sessions — always visible on the map when they return.

Target persona: travellers, explorers, and anyone who wants to remember a place with context.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Angular 15 | Existing project |
| UI Components | Angular Material (MDC) | `MaterialModule` re-exports all components |
| Rich Text Editor | ngx-editor | Used in pin notes dialog |
| Maps | HERE Maps JS API | Raster tiles, geocoding, reverse geocoding |
| Backend | ASP.NET Core 8 Web API | `traversal-api/` sibling directory |
| ORM | Entity Framework Core 8 | Code-first, migrations |
| Database | PostgreSQL | Via Npgsql EF provider |
| Auth | JWT Bearer tokens | 30-day expiry, HS256 |
| OTP (Phase 1) | Mock — logged to console | Phase 2: Twilio / Firebase |
| Hosting (planned) | Azure App Service (API) + Azure Static Web Apps (Angular) + Azure Database for PostgreSQL | |

---

## 3. Repository Structure

### 3a. Frontend — `traversal/`

```
traversal/
├── src/
│   ├── app/
│   │   ├── app.component.*          # Root shell component
│   │   ├── app.module.ts            # Root module — registers all modules, interceptor
│   │   ├── app-routing.module.ts    # Top-level routes with AuthGuard
│   │   ├── material.module.ts       # Re-exports all Angular Material modules
│   │   │
│   │   ├── auth/                    # Auth feature module
│   │   │   ├── auth.module.ts
│   │   │   └── login/
│   │   │       ├── login.component.ts    # Phone → OTP two-step login
│   │   │       ├── login.component.html
│   │   │       └── login.component.scss
│   │   │
│   │   ├── core/                    # Singleton services, guards, interceptors
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts  # sendOtp, verifyOtp, logout, getToken, isLoggedIn
│   │   │   │   └── pin.service.ts   # getAll, create, update, delete — typed Pin interface
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts    # Redirects to /login if no JWT
│   │   │   └── interceptors/
│   │   │       └── auth.interceptor.ts  # Attaches Bearer token to every request
│   │   │
│   │   ├── dashboard/               # Main app screen (post-login)
│   │   │   ├── dashboard.component.*    # Toolbar, search, pin list overlay
│   │   │   ├── dashboard.module.ts
│   │   │   └── pin-dialog/
│   │   │       ├── pin-dialog.component.*   # ngx-editor note editor; emits save/delete
│   │   │       └── ...
│   │   │
│   │   ├── map/
│   │   │   ├── map.component.ts     # HERE Maps init, tap→pin, API load/save/delete
│   │   │   ├── map.component.html
│   │   │   └── map.component.scss
│   │   │
│   │   └── general/
│   │       ├── general.module.ts
│   │       └── confirm-dialog/      # Generic "no results" dialog on failed reverse geocode
│   │
│   ├── assets/
│   │   ├── background.jpg           # Login page background
│   │   └── location-pin.png         # Custom map marker icon
│   │
│   └── environments/
│       ├── environment.ts           # apiUrl → http://localhost:5000/api
│       └── environment.prod.ts      # apiUrl → Azure URL (to be filled on deploy)
│
├── angular.json
├── package.json
├── tsconfig.json
└── TECH_DOC.md                      # ← this file
```

### 3b. Backend — `traversal-api/`

```
traversal-api/
├── Controllers/
│   ├── AuthController.cs    # POST /api/auth/send-otp, /api/auth/verify-otp
│   └── PinsController.cs    # GET/POST/PUT/DELETE /api/pins (JWT-protected)
│
├── Models/
│   ├── User.cs              # Id (Guid), Phone, CreatedAt
│   └── Pin.cs               # Id, UserId (FK), Lat, Lng, Title, Note, Address, timestamps
│
├── Data/
│   └── AppDbContext.cs      # EF Core context; unique index on User.Phone
│
├── DTOs/
│   ├── AuthDtos.cs          # SendOtpRequest, VerifyOtpRequest, AuthResponse records
│   └── PinDtos.cs           # CreatePinRequest, UpdatePinRequest, PinResponse records
│
├── Services/
│   ├── OtpService.cs        # Generate + verify OTP via IMemoryCache (5 min TTL)
│   └── TokenService.cs      # JWT generation (HS256, 30-day expiry)
│
├── Migrations/
│   └── 20260621115907_InitialCreate.*   # Users + Pins tables
│
├── Program.cs               # DI wiring, JWT auth, CORS, auto-migrate on startup
├── appsettings.json         # ConnectionString, Jwt config (Key/Issuer/Audience)
└── traversal-api.csproj
```

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser / App                        │
│                                                          │
│   ┌──────────┐    ┌───────────────────────────────┐     │
│   │  /login  │    │        /dashboard              │     │
│   │          │    │                                │     │
│   │ Phone    │    │  Toolbar + Search              │     │
│   │  ↓ OTP   │    │  ┌──────────────────────────┐ │     │
│   │  ↓ JWT   │    │  │     MapComponent          │ │     │
│   └──────────┘    │  │  - HERE Maps canvas       │ │     │
│                   │  │  - Tap → reverse geocode  │ │     │
│                   │  │  - POST /api/pins         │ │     │
│                   │  │  - Marker tap → dialog    │ │     │
│                   │  │    - Edit note            │ │     │
│                   │  │    - PUT /api/pins/:id    │ │     │
│                   │  │    - DELETE /api/pins/:id │ │     │
│                   │  └──────────────────────────┘ │     │
│                   └───────────────────────────────┘     │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP + Bearer JWT
                             ▼
┌─────────────────────────────────────────────────────────┐
│              ASP.NET Core 8 Web API                      │
│                                                          │
│   AuthController          PinsController                 │
│   - send-otp              - GET    /api/pins             │
│   - verify-otp            - POST   /api/pins             │
│                           - PUT    /api/pins/:id         │
│   OtpService              - DELETE /api/pins/:id         │
│   TokenService                                           │
└────────────────────────────┬────────────────────────────┘
                             │ EF Core + Npgsql
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │                 │
                    │  users          │
                    │  pins           │
                    └─────────────────┘
```

### Auth flow

```
User enters phone
      │
      ▼
POST /api/auth/send-otp  →  OtpService generates 6-digit code
                             stores in IMemoryCache (5 min TTL)
                             [Phase 1] logs to API console
      │
      ▼
User enters OTP
      │
      ▼
POST /api/auth/verify-otp  →  OtpService.Verify()
                               if new user → INSERT into users
                               TokenService.Generate() → JWT (30 days)
      │
      ▼
Angular stores JWT in localStorage
AuthInterceptor attaches it as Bearer on every request
AuthGuard protects /dashboard route
```

---

## 5. Database Schema

### `users`
| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| phone | varchar(15) | NOT NULL, UNIQUE |
| created_at | timestamptz | NOT NULL |

### `pins`
| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id ON DELETE CASCADE |
| lat | double precision | NOT NULL |
| lng | double precision | NOT NULL |
| title | varchar(200) | NOT NULL |
| note | text | |
| address | text | |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

---

## 6. API Reference

**Base URL (dev):** `http://localhost:5000/api`
**Base URL (prod):** `https://<azure-app>.azurewebsites.net/api`

All `/pins` endpoints require `Authorization: Bearer <token>` header.

### Auth

#### `POST /api/auth/send-otp`
```json
// Request
{ "phone": "+919876543210" }

// Response 200
{ "message": "OTP sent." }
```

#### `POST /api/auth/verify-otp`
```json
// Request
{ "phone": "+919876543210", "otp": "482910" }

// Response 200
{ "token": "<jwt>", "userId": "<guid>" }

// Response 401
{ "message": "Invalid or expired OTP." }
```

### Pins

#### `GET /api/pins`
Returns all pins for the authenticated user, newest first.
```json
[
  {
    "id": "uuid",
    "lat": 28.6139,
    "lng": 77.2090,
    "title": "India Gate, New Delhi, India",
    "note": "<rich text content>",
    "address": "India Gate, New Delhi, India",
    "createdAt": "2026-06-21T12:00:00Z",
    "updatedAt": "2026-06-21T12:00:00Z"
  }
]
```

#### `POST /api/pins`
```json
// Request
{ "lat": 28.6139, "lng": 77.2090, "title": "India Gate", "note": "", "address": "India Gate, New Delhi" }

// Response 201 — same PinResponse shape as above
```

#### `PUT /api/pins/:id`
```json
// Request
{ "title": "India Gate", "note": "<updated rich text>" }

// Response 200 — updated PinResponse
```

#### `DELETE /api/pins/:id`
```
Response 204 No Content
```

---

## 7. Phase 1 — What's Done

### ✅ Authentication
- [x] Mobile number input with validation (E.164 format)
- [x] Mock OTP generation (6-digit, 5-min TTL, logged to API console)
- [x] OTP verification → auto-creates user on first login
- [x] JWT issuance (30-day Bearer token)
- [x] JWT stored in `localStorage`, attached to all requests via `AuthInterceptor`
- [x] `AuthGuard` protects `/dashboard` — unauthenticated users → `/login`
- [x] Logout clears token and redirects

### ✅ Map & Pins
- [x] HERE Maps renders on dashboard (raster tiles, India default center)
- [x] Tap anywhere on map → reverse geocode → `POST /api/pins` → pin drops
- [x] All user pins load from API on map init (persisted across sessions)
- [x] Custom pin icon (`location-pin.png`)
- [x] Tap existing pin → `PinDialogComponent` opens
- [x] Rich-text note editor (ngx-editor) in dialog
- [x] Save note → `PUT /api/pins/:id`
- [x] Delete pin → `DELETE /api/pins/:id` + removes marker from map
- [x] Location search (geocode) in toolbar
- [x] Pins panel overlay (lists all pins, click to open dialog)

### ✅ Backend (ASP.NET Core 8)
- [x] Project scaffolded with EF Core 8, Npgsql, JWT Bearer
- [x] `Users` + `Pins` tables via EF migrations
- [x] Auto-migrate on startup (`dbContext.Database.Migrate()`)
- [x] CORS configured for `localhost:4200`
- [x] `environments/` set up with dev/prod `apiUrl`

---

## 8. Phase 1 — In Progress / Remaining

### 🔧 To complete before Phase 1 is shippable

| Item | Notes |
|---|---|
| Login page UI polish | Background image, brand styling done; test on mobile viewports |
| `appsettings.json` secrets | Replace placeholder JWT key with a real secret; move to Azure Key Vault or env vars before any deploy |
| `environment.prod.ts` | Fill in real Azure API URL once deployed |
| `traversal-api` pushed to GitHub | Backend repo not yet on remote — needs its own GitHub repo |
| Angular `.gitignore` | `dist/`, `.angular/`, `node_modules/` not yet in `.gitignore` |
| End-to-end test run | Full flow: phone → OTP → dashboard → drop pin → reload → pin persists |
| Error handling in Angular | API errors (network down, 401) should show user-friendly messages, not silent failures |

---

## 9. Future Phases

### Phase 2 — Real SMS OTP + UX polish
- Integrate Twilio (or Firebase Phone Auth) to send real OTPs via SMS
- Phone number formatting / country code picker on login screen
- Loading states and toast notifications throughout the app
- Pin title editable from dialog (currently auto-set from reverse geocode)
- Offline-first: queue pin creates when network is unavailable

### Phase 3 — Rich Media & Collections
- Attach photos to pins (Azure Blob Storage)
- Organize pins into named **trips** or **collections**
- Trip view: timeline of pins in a trip
- Share a trip / collection via public link

### Phase 4 — Social & Collaboration
- Follow other users, see their public pins
- Collaborate on a shared trip (real-time with SignalR)
- Comments on pins
- Like / save other users' pins

### Phase 5 — Mobile App
- React Native or Flutter wrapper around the same API
- Push notifications (e.g., "You visited this place 1 year ago")
- GPS auto-drop: offer to pin current location

### Phase 6 — AI Features
- "Summarize my trip to Rajasthan" — AI reads pin notes and generates a travel diary
- Auto-suggest tags and categories for pins
- Smart search: "find my pins near beaches"

---

## Running Locally

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- PostgreSQL running locally (default: `localhost:5432`, user `postgres`, password `postgres`)

### Start the API
```bash
cd traversal-api
# Edit appsettings.json if your PostgreSQL creds differ
dotnet run
# API: http://localhost:5000
# Watch the terminal for: === MOCK OTP for <phone>: <code> ===
```

### Start the Angular app
```bash
cd traversal
npm install
npm start
# Open http://localhost:4200
```

### Login flow (dev)
1. Enter any phone number (e.g. `+919876543210`)
2. Click **Send OTP**
3. Check the API terminal output for the OTP code
4. Enter it in the app → lands on dashboard

---

## Key Decisions & Trade-offs

| Decision | Rationale |
|---|---|
| Mock OTP in Phase 1 | Zero cost, no external dependency while building; easy to swap to Twilio in Phase 2 |
| JWT over sessions | Stateless; works well for future mobile app without cookie complexity |
| 30-day token expiry | Reduces friction for a personal-use app; can tighten with refresh tokens in Phase 2 |
| Auto-migrate on startup | Simpler for a solo dev / small team; switch to explicit migration step before production scale |
| HERE Maps (not Google) | Already integrated; competitive geocoding; `politicalview: "IND"` needed for India compliance |
| PostgreSQL over SQL Server | Free/open source, Azure-hosted option available, no licensing cost |
