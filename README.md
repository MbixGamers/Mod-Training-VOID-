# Void Training Portal

## Overview

The **Void Training Portal** (branded as "VOID | Mod Training Suite") is a web application for an esports organization called Void. It provides a moderator training and assessment platform where staff candidates take scenario-based tests about moderator procedures (specifically around Fortnite esports roster management), and admins can review, approve, or deny their submissions. The app integrates Discord OAuth for login and includes a Discord bot for assigning roles to members who pass.

The project lives inside a `ModTrainingzip/` directory and is split into two main parts:
- `frontend/` — A React single-page application (Create React App + CRACO)
- `backend/` — A Python API server (FastAPI as primary, Flask as secondary)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React 19 bootstrapped with Create React App, using CRACO (`craco.config.js`) for custom webpack and Babel configuration without ejecting.
- **Routing**: React Router DOM v6. Key routes:
  - `/` — Home page showing roster categories and requirements
  - `/login` — Discord OAuth login page
  - `/callback` — OAuth callback handler (processes Supabase auth tokens)
  - `/test` — Multi-question assessment (protected, requires login)
  - `/admin` — Admin dashboard to review/approve/deny submissions (protected, requires admin Discord ID)
  - Results are shown via route state (no dedicated `/results` URL in the router, but a `Results.js` page component exists)
- **Styling**: Tailwind CSS with CSS variables for theming. Uses shadcn/ui component library (New York style variant) built on Radix UI primitives. Dark mode esports aesthetic with custom fonts: Rajdhani (headings), Manrope (body), JetBrains Mono (code).
- **Animation**: Framer Motion for page transitions and UI animations.
- **Path Aliases**: `@/` maps to `src/` directory, configured in both `jsconfig.json` and `craco.config.js` webpack alias.
- **State Management**: Plain React hooks (useState, useEffect). No Redux or other state library.
- **Authentication Client**: Supabase JS client (`@supabase/supabase-js`) initialized in `src/lib/supabase.js` using environment variables `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_PUBLISHABLE_KEY`. Uses PKCE flow for Discord OAuth.
- **Protected Routes**: `ProtectedRoute` component checks Supabase session and redirects to `/login` if unauthenticated.
- **Admin Access**: Hardcoded array of Discord user IDs (`ADMIN_USER_IDS`) checked against the session user ID. Currently includes `['394600108846350346', '928635423465537579']`.
- **Test System**: Questions defined in `src/lib/testQuestions.js` with keyword-based answer checking. Answers are graded client-side using a `checkAnswer` function that matches against required keywords and avoid-patterns. 80% score required to pass.
- **HTTP Client**: Axios for API calls to the backend. Backend URL configured via `REACT_APP_BACKEND_URL` environment variable.
- **Dev Plugins**: Custom CRACO plugins in `frontend/plugins/` for visual editing (Babel metadata plugin + dev server setup) and health checks (webpack health plugin + health endpoints). Visual edits only active in development; health checks gated by `ENABLE_HEALTH_CHECK` env var.

### Backend

- **Primary API Server**: FastAPI (`backend/server.py`) with routes under `/api` prefix. Handles test submission creation, listing, and admin actions (accept/deny).
- **Secondary Server**: Flask (`backend/app.py`) with basic `/health`, `/submissions`, and `/admin/action` endpoints. This appears to be an earlier or simpler version.
- **Data Models**: Pydantic models — `TestSubmission`, `TestAnswer`, `TestSubmissionCreate`, `AdminAction`. Submissions have statuses: pending, accepted, denied.
- **Data Storage**: Currently uses **in-memory Python lists** (`submissions_db = []`). The architecture references MongoDB as a potential backend but falls back to in-memory when no database URL is configured. There is no database currently wired up — if adding persistence, consider this the integration point.
- **Discord Bot**: `backend/discord_bot.py` uses discord.py with an aiohttp web server to expose an HTTP endpoint for role assignment. When a user passes the test and is approved, the bot can assign a "Verified Staff" role on the Discord server. Requires `DISCORD_BOT_TOKEN` and `DISCORD_SERVER_ID` environment variables.
- **Python Dependencies** (from `requirements.txt`): Flask, python-dotenv, supabase, requests, gunicorn, flask-cors. Note: FastAPI and its dependencies (uvicorn, pydantic) are used in `server.py` but not listed in requirements.txt — they may need to be added.

### Key Design Decisions

1. **Client-side grading**: Test answers are evaluated on the frontend using keyword matching before being submitted to the backend. This means the grading logic is visible to users in the source code — a known trade-off for simplicity.
2. **Dual backend servers**: Both Flask and FastAPI exist. FastAPI (`server.py`) is the more complete implementation with proper Pydantic models. Flask (`app.py`) has stub endpoints. The frontend makes calls to `/api/` paths which align with the FastAPI router.
3. **No persistent database yet**: All submission data lives in memory and is lost on server restart. This is the most critical architectural gap to address for production use.
4. **Admin authorization is client-side validated**: The admin page checks Discord IDs client-side. The backend should also validate admin identity for security, but this doesn't appear to be implemented yet.

## External Dependencies

### Third-Party Services
- **Supabase**: Authentication provider using Discord OAuth. Configured via `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_PUBLISHABLE_KEY` environment variables. Uses PKCE auth flow.
- **Discord OAuth**: Users authenticate via Discord through Supabase's OAuth integration. The callback URL is `{domain}/callback`.
- **Discord Bot API**: A discord.py bot (`backend/discord_bot.py`) connects to a Discord server to assign roles. Requires `DISCORD_BOT_TOKEN` and `DISCORD_SERVER_ID` environment variables, plus `members` and `guilds` intents enabled.

### Key NPM Packages
- `react`, `react-dom` (v19), `react-router-dom` (v6)
- `@supabase/supabase-js` — Supabase client
- `@radix-ui/*` — Full suite of Radix UI primitives (accordion, dialog, tabs, tooltip, etc.)
- `framer-motion` — Animations
- `axios` — HTTP client
- `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge` — Styling utilities
- `lucide-react` — Icon library
- `sonner` — Toast notifications
- `@craco/craco` — CRA config override

### Key Python Packages
- `fastapi` + `uvicorn` — Primary API server (note: may need to be added to requirements.txt)
- `flask` + `flask-cors` + `gunicorn` — Secondary/legacy API server
- `discord.py` — Discord bot (may need to be added to requirements.txt)
- `supabase` — Supabase Python client
- `python-dotenv` — Environment variable loading
- `pydantic` — Data validation models

### Environment Variables Required
| Variable | Purpose |
|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase project URL |
| `REACT_APP_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `REACT_APP_BACKEND_URL` | Backend API base URL |
| `DISCORD_BOT_TOKEN` | Discord bot authentication token |
| `DISCORD_SERVER_ID` | Target Discord server/guild ID |
