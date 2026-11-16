# Atlas: Business Workflow Portal

Atlas is a private workspace for case managers who handle employment-based visa cases (H-2A, H-2B and EB-3) for businesses and individuals. It keeps clients, their visa programs, contacts, projects, tasks, follow-ups and documents in one place, so nothing about a case lives in scattered spreadsheets and email threads.

This repository is the **Sprint 1 MVP**: secure sign-in, plus a client list backed by a real PostgreSQL database where each client can be in several visa programs.

| | |
|---|---|
| **Live app** | https://atlas-pearl-five-58.vercel.app |
| **API** | https://atlas-api-4303.onrender.com/api/health |
| **Demo login** | `demo@atlas.test` / `AtlasDemo2026!` |
| **Jira board** | https://ivangopei.atlassian.net/jira/software/projects/ATL/boards/4 |

> The API runs on Render's free plan, which sleeps after 15 minutes without traffic. The **first** sign-in after a quiet period can take up to about a minute while the server wakes up. After that it is fast.

---

## Sprint 1 scope

| Story | What it means | Status |
|---|---|---|
| **ATL-1 Sign in** | Correct email + password opens the dashboard; wrong ones show an error. Every page and API route requires a login (API returns **401** without one). | Done |
| **ATL-2 Add and manage clients** | The Add Client form saves to the database and the new client appears in the list right away. Name and type are required; industry only applies to businesses. | Done |
| **ATL-3 Put a client in programs** | A client can be in H-2A, H-2B and EB-3 at the same time. The list shows each client's programs as tags and can be filtered by program. | Done |

Other pages (Dashboard, Projects, Contacts, Follow-ups, Documents, Activity, News) are still interface prototypes using sample data in the browser. They are planned for Sprints 2 and 3 (see [Roadmap](#known-limitations-and-roadmap)). The Tasks page also got a validation and filtering pass in this sprint.

## Screenshots

| Sign-in with wrong password (ATL-1) | Client list loaded from PostgreSQL (ATL-2, ATL-3) |
|---|---|
| ![Login error](docs/screenshots/01-login-error.png) | ![Clients](docs/screenshots/03-clients-from-database.png) |

| Validation on the Add Client form | New client saved in three programs |
|---|---|
| ![Validation](docs/screenshots/04-add-client-validation.png) | ![Saved](docs/screenshots/06-client-saved-with-programs.png) |

More in [`docs/screenshots`](docs/screenshots).

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Python 3.13, FastAPI, Pydantic |
| Database | PostgreSQL (psycopg 3) |
| Auth | bcrypt password hashes, JWT bearer tokens (PyJWT) |
| Tests | Vitest (frontend), pytest (backend), GitHub Actions CI |
| Hosting | Vercel (frontend), Render (API + PostgreSQL) |

## Architecture

```
Browser (React app on Vercel)
   |  /api/*  (Vercel forwards these to Render, so the browser sees one origin)
   v
FastAPI on Render  ── routes ──> schemas (validation) ──> repositories (SQL) ──> PostgreSQL on Render
                        ^
                        └── get_current_user: checks the JWT on every protected route
```

### Separation of concerns

**Frontend (`src/`)**

| Folder | Layer | Responsibility |
|---|---|---|
| `pages/` | UI | React components: render data, collect form input, show errors |
| `services/` | Business logic | Pure functions: validation, mapping API data, filtering (`clientService.ts`, `taskService.ts`) |
| `api/` | Data access | `apiClient.ts`: the only code that calls `fetch`; adds the token and turns errors into messages |
| `auth/` | App state | `AuthContext.tsx`: who is signed in |
| `data/` | Sample data | In-browser data for pages not yet on the API |

**Backend (`server/app/`)**

| File | Layer | Responsibility |
|---|---|---|
| `routes/*.py` | HTTP | URLs, status codes, JSON in and out |
| `schemas.py` | Validation | Pydantic models with the rules for incoming data (e.g. `ClientCreate`) |
| `security.py` | Auth | Password hashing, token creation and checking, the `get_current_user` guard |
| `repositories.py` | Data access | All SQL for users and clients |
| `db.py` | Infrastructure | Opens connections from `DATABASE_URL` |
| `init_db.py` | Setup | Creates tables and seed data on an empty database |
| `db/schema.sql`, `db/seed.sql` | Database | Tables, constraints, and dummy data |

### Design patterns

- **Layered architecture.** Each layer only talks to the layer below it: pages call services, services call the API client. On the server, routes call repositories. This is why the business rules can be unit tested without a browser or a database.
- **Repository pattern** (`server/app/repositories.py`). SQL is hidden behind functions like `create_client(conn, client)`. Routes don't know how the data is stored, and tests replace the repository with a fake.
- **Dependency injection** (FastAPI `Depends`). The sign-in guard `get_current_user` is attached to every protected router in one line in `main.py`. Tests swap it out with `app.dependency_overrides`.
- **Observer pattern** (React Context in `src/auth/AuthContext.tsx`). Components subscribe with `useAuth()` and re-render automatically when the user signs in, signs out, or their token expires.
- **Facade** (`src/api/apiClient.ts`). One small interface hides `fetch`, headers, tokens and error parsing from the rest of the app.

### Technical decisions

- **FastAPI + PostgreSQL** instead of a Node backend: Pydantic gives strong validation with little code, and PostgreSQL `CHECK` constraints enforce the same rules a second time at the database level.
- **JWT bearer tokens** instead of server sessions: the API stays stateless, which suits Render's free plan, where the server can restart at any time. Tokens expire after 8 hours.
- **bcrypt** for passwords: only hashes are stored. Login returns the same message for an unknown email and a wrong password, so the form can't be used to discover accounts.
- **A `client_programs` join table** for ATL-3, so a client can be in any combination of programs, with a primary key that prevents duplicates.
- **Vercel rewrites `/api/*` to Render**, so the browser only ever talks to one origin. This avoids CORS configuration and keeps the frontend code environment-independent.
- **Validation runs on both sides.** The frontend gives instant feedback; the server is the source of truth and rejects bad data with a 422, even if someone bypasses the UI.
- **Database errors become a 503 with a safe message** instead of a 500 with a stack trace, and the real error is logged on the server.

## API

All routes except `/api/health*` and `/api/auth/login` require `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | API is up |
| `GET` | `/api/health/db` | Database is reachable (503 if not) |
| `POST` | `/api/auth/login` | `{email, password}` → `{access_token, user}`; 401 on bad credentials |
| `GET` | `/api/auth/me` | The signed-in user |
| `GET` | `/api/clients` | All clients with programs, primary contact and open task count |
| `GET` | `/api/clients/{id}` | One client (404 if missing) |
| `POST` | `/api/clients` | Create a client with programs (201; 422 on invalid input) |
| `GET` | `/api/tasks`, `/api/projects`, `/api/contacts`, `/api/followups`, `/api/documents` | Read-only lists (pages get wired to these in Sprint 2) |

Interactive API docs are generated automatically at `/docs` when the API runs locally.

---

## Running it locally

### Prerequisites

- Node.js 20+ and npm
- Python 3.12+
- PostgreSQL 15+ running locally

### 1. Clone

```bash
git clone https://github.com/Ivangopei/Business-Workflow-Portal.git
cd Business-Workflow-Portal
```

### 2. Database and API

```bash
# Create an empty database (any name works)
createdb atlas            # or: psql -U postgres -c "CREATE DATABASE atlas;"

cd server
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt

cp .env.example .env               # then edit .env:
#   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/atlas
#   JWT_SECRET=<output of: python -c "import secrets; print(secrets.token_urlsafe(48))">

uvicorn app.main:app --reload      # http://localhost:8000
```

On first start, the API sees the empty database and creates the tables and demo data automatically. To wipe and rebuild it later: `python -m app.init_db --reset`.

### 3. Frontend

In a second terminal, from the repo root:

```bash
npm install
npm run dev                        # http://localhost:5173
```

Vite forwards `/api` requests to `localhost:8000` (see `vite.config.ts`). Sign in with `demo@atlas.test` / `AtlasDemo2026!`.

## Using the app

1. **Sign in** with the demo account. A wrong password shows "Incorrect email or password."
2. Open **Clients**. The list comes from the database. Each client's visa programs show as colored tags.
3. Use the **H-2A / H-2B / EB-3** tabs, the status and type filters, or the search box to narrow the list.
4. Click **+ Add Client**. Choose Business or Individual; the Industry field only appears for businesses. Tick one or more programs and save. The client appears in the list immediately and is stored in PostgreSQL, so it is still there after a refresh.
5. Try saving without a name to see validation errors.
6. **Sign out** from the bottom of the sidebar. Any page now shows the login screen again.

## Testing

```bash
# Frontend (from the repo root): 52 tests
npm test

# Backend (from server/, with the virtualenv active): 39 tests
python -m pytest
```

GitHub Actions (`.github/workflows/tests.yml`) runs lint, both test suites and the production build on every pull request and every push to `main`.

**Approach.** Business rules are written as pure functions or Pydantic models, so they can be tested directly without a browser or database. API tests use FastAPI's `TestClient` and replace the database connection or repository with a fake, so they run in about two seconds with no PostgreSQL. Every feature is tested for both the success path and its common failures.

| Test file | What it covers |
|---|---|
| `server/tests/test_auth.py` | Password hashing; login success, wrong password, unknown email, case-insensitive email; 401 on every protected route; forged and expired tokens |
| `server/tests/test_clients.py` | Client validation rules (required name and type, industry only for businesses, multiple and duplicate programs, unknown programs); `POST /api/clients` 201 / 422 / 401 |
| `server/tests/test_api.py` | Health checks; list routes; database down → 503 without leaking the error; missing `DATABASE_URL` |
| `src/services/clientService.test.ts` | Login and client form validation, API ↔ UI mapping, program/status/type/search filtering |
| `src/api/apiClient.test.ts` | Token header, error message parsing, sign-out on 401 (but not on a wrong password), network failure |
| `src/services/taskService.test.ts` | Task validation, date parsing (including impossible dates), overdue rules, filtering |

Manual end-to-end testing was also done against a real PostgreSQL database and on the deployed site: sign in (good and bad password), add clients of both types with zero to three programs, refresh to confirm they persisted, filters, and sign out.

## Deployment

| Part | Platform | How |
|---|---|---|
| Frontend | **Vercel** | Connected to this repo; every push to `main` builds with `npm run build` and deploys `dist/`. `vercel.json` forwards `/api/*` to Render and sends all other paths to `index.html`, so links like `/clients` work on refresh. |
| API + database | **Render** | A free PostgreSQL database and a free FastAPI web service (root `server/`, `pip install -r requirements.txt`, `uvicorn app.main:app --host 0.0.0.0 --port $PORT`) with `DATABASE_URL` and `JWT_SECRET` set as environment variables, never committed. Tables and demo data are created on the first start. `render.yaml` describes the same setup as a Render Blueprint, so it can be recreated in one step. |

## Troubleshooting

| Problem | Fix |
|---|---|
| `DATABASE_URL is not set` or `/api/health/db` returns 503 "Database is not configured" | Create `server/.env` from `.env.example` and run `uvicorn` from inside `server/`. |
| 503 "Database is unavailable" | PostgreSQL isn't running, or the password/port in `DATABASE_URL` is wrong. Test with `psql "<your DATABASE_URL>"`. |
| `JWT_SECRET is not set` when signing in | Add `JWT_SECRET` to `server/.env` and restart the API. |
| Login always says "Incorrect email or password" locally | The database was created before the `users` table existed. Run `python -m app.init_db --reset` (this deletes local data). |
| Frontend shows "Could not reach the server" | The API isn't running on port 8000. Start it with `uvicorn app.main:app --reload`. |
| First sign-in on the live site is slow | The free Render server is waking up; wait up to a minute and try again. |
| `ModuleNotFoundError: app` when running pytest | Run `python -m pytest` from inside `server/`. |
| Port 5173 or 8000 already in use | `npm run dev -- --port 5174`, or `uvicorn app.main:app --port 8001` (then update `vite.config.ts`). |

## Known limitations and roadmap

**Current limitations**
- One demo account; there is no sign-up or password reset yet. New users are added in the database.
- Clients can be added but not yet edited or deleted.
- Dashboard, Projects, Contacts, Tasks, Follow-ups, Documents and Activity still use in-browser sample data; changes there are lost on refresh.
- Document "upload" only records the file name; files aren't stored.
- The free Render plan sleeps when idle (slow first request), and its free database expires after 30 days unless upgraded.
- The login token is kept in `localStorage`. An httpOnly cookie would be safer against XSS.

**Planned**
- **Sprint 2 (feature development):** client detail page (ATL-4), tasks (ATL-5) and contacts (ATL-6) on the database; edit and delete clients.
- **Sprint 3 (testing and deploy):** follow-ups (ATL-7), real document storage (ATL-8), component and end-to-end tests, a durable database plan, error monitoring.
- **Backlog:** dashboard of what needs attention (ATL-9), global search and activity history (ATL-10), English/Russian language switch.

## Git workflow

Work is done on feature branches and merged into `main` through pull requests with a description of the change. `main` is always deployable: Vercel deploys every push to `main`, and Render deploys the API from `main`.

## License

MIT. See [LICENSE](LICENSE).
