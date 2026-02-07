# Void Training Portal

## Overview

This is the **Void Training Portal** (also referred to as "VOID | Mod Training Suite"), a web application for an esports organization called Void. It serves as a moderator training and assessment platform where prospective moderators take scenario-based tests, submit their answers for review, and admins can approve or deny submissions. The app features Discord OAuth authentication, a dark esports-themed UI, and a backend API for managing test submissions.

The project is split into a **React frontend** (Create React App with CRACO) and a **Python backend** (FastAPI + Flask), with Supabase for authentication and potential data storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 19 bootstrapped with Create React App, extended via CRACO for custom webpack/babel configuration
- **Routing**: React Router DOM v6 with pages for Home, Login, Callback (OAuth), Test, Admin, and Results
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant). Dark mode esports aesthetic with glassmorphism, neon accents, and custom fonts (Rajdhani for headings, Manrope for body, JetBrains Mono for code)
- **UI Components**: Extensive use of Radix UI primitives via shadcn/ui (dialogs, tabs, tooltips, accordions, etc.)
- **Animation**: Framer Motion for page transitions and UI animations
- **Path Aliases**: `@/` maps to `src/` directory (configured in jsconfig.json and craco.config.js)
- **State Management**: React hooks (useState, useEffect) — no external state library
- **Design System**: Defined in `design_guidelines.json` with specific color palette, typography scale, and role-based colors (Pro, Semi-Pro, Academy, Creative, etc.)

### Backend
- **Primary API**: FastAPI (`backend/server.py`) with an `/api` prefix router. Handles test submissions and admin actions
- **Secondary Server**: Flask (`backend/app.py`) with basic health check, submissions, and admin endpoints
- **Discord Bot**: `backend/discord_bot.py` — a discord.py bot that can assign roles to Discord server members via an HTTP API endpoint (used for granting "Verified Staff" roles after passing tests)
- **Data Storage**: In-memory storage (Python lists) for submissions as the default. The architecture supports MongoDB but currently falls back to in-memory when no database URL is configured
- **Data Models**: Pydantic models for TestSubmission, TestAnswer, and AdminAction

### Authentication
- **Provider**: Supabase Auth with Discord OAuth
- **Flow**: User clicks "Login with Discord" → redirected to Discord OAuth → callback to `/callback` route → Supabase processes the token → user redirected to `/test`
- **Protected Routes**: `ProtectedRoute` component wraps authenticated pages, checks Supabase session
- **Admin Access**: Hardcoded admin user IDs (Discord IDs) checked against session — currently `['394600108846350346']`
- **Environment Variables**: `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_PUBLISHABLE_KEY` for Supabase client initialization

### Test/Assessment System
- **Questions**: Defined in `frontend/src/lib/testQuestions.js` — scenario-based questions about moderator procedures for an esports roster system
- **Answer Checking**: Keyword-based matching system (`checkAnswer` function) — answers are evaluated against required keywords and avoid-patterns
- **Passing Threshold**: 80% score required to pass
- **Submission Flow**: User takes test → answers graded client-side → results submitted to backend API → admin reviews and accepts/denies

### Key Pages
- `/` — Home page with roster categories and requirements
- `/login` — Discord OAuth login
- `/callback` — OAuth callback handler
- `/test` — Multi-question assessment with navigation
- `/admin` — Admin dashboard to review/approve/deny submissions

### Development Tooling
- Custom CRACO plugins in `frontend/plugins/`:
  - **visual-edits**: Babel metadata plugin and dev server setup for visual editing capabilities (dev-only)
  - **health-check**: Webpack health monitoring plugin with `/health` endpoint (optional, enabled via `ENABLE_HEALTH_CHECK` env var)

## External Dependencies

### Services
- **Supabase**: Authentication (Discord OAuth provider), initialized via `@supabase/supabase-js`. Requires `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_PUBLISHABLE_KEY` environment variables
- **Discord**: OAuth login provider (configured through Supabase), plus a standalone Discord bot for role management requiring `DISCORD_BOT_TOKEN` and `DISCORD_SERVER_ID` environment variables
- **Render**: Target deployment platform for both frontend and backend (per README)

### Key NPM Packages
- `react-router-dom` — Client-side routing
- `@supabase/supabase-js` — Supabase client
- `axios` — HTTP client for backend API calls
- `framer-motion` — Animations
- `lucide-react` — Icon library
- `sonner` — Toast notifications
- `tailwindcss` — Utility CSS framework
- `shadcn/ui` components (via Radix UI primitives, class-variance-authority, clsx, tailwind-merge)
- `@craco/craco` — CRA configuration override

### Key Python Packages
- `fastapi` — Primary API framework
- `flask` + `flask-cors` — Secondary/legacy API
- `supabase` — Supabase Python client
- `discord.py` — Discord bot framework
- `python-dotenv` — Environment variable loading
- `gunicorn` — Production WSGI server
- `pydantic` — Data validation for API models

### Environment Variables Required
- `REACT_APP_SUPABASE_URL` — Supabase project URL
- `REACT_APP_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key
- `REACT_APP_BACKEND_URL` — Backend API URL
- `DISCORD_BOT_TOKEN` — Discord bot token
- `DISCORD_SERVER_ID` — Target Discord server ID