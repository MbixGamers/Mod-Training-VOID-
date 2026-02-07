# Authentication Flow Fix

## Issues Fixed

### 1. Callback Handler (Callback.js)
**Problem**: The callback page was waiting for `SIGNED_IN` event from `onAuthStateChange`, but Supabase's PKCE flow might already have the session established from URL parameters. This caused the page to hang on "Processing login..."

**Solution**:
- Added direct session checking with `getSession()` instead of only listening for events
- Handle both hash parameters (access_token) and query parameters (code)
- Added error handling and fallback retry logic
- Clean URL after successful authentication
- Show proper error messages if authentication fails

### 2. Admin Portal (Admin.js)
**Problem**: 
- Fetching from relative `/api/submissions` URL instead of backend URL
- Not properly checking Discord user ID from session metadata
- No loading state UI

**Solution**:
- Use `REACT_APP_BACKEND_URL` environment variable with fallback to production backend
- Check `session.user.user_metadata.provider_id` for Discord user ID
- Added proper loading UI with spinner
- Use axios for consistent HTTP client
- Added better error handling and user feedback

### 3. Test Page (Test.js)
**Problem**: Submission endpoint was relative path, causing 404 errors

**Solution**:
- Updated to use `BACKEND_URL` with fallback value
- Fixed axios call to use full backend URL

### 4. Backend APIs
**Problem**: 
- Incomplete API endpoints
- Missing CORS configuration for frontend domains
- No proper data models

**Solution**:

#### Flask Backend (app.py)
- Added proper CORS configuration for frontend domains
- Implemented GET `/api/submissions` endpoint
- Implemented POST `/api/submissions` endpoint with validation
- Implemented POST `/api/admin/action` endpoint
- Added in-memory database (replace with real DB in production)
- Proper error handling and response formats

#### FastAPI Backend (server.py)
- Added comprehensive Pydantic models
- Proper CORS middleware with allowed origins
- Full CRUD endpoints for submissions
- Admin action handling
- Better error responses

## Environment Configuration

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
REACT_APP_BACKEND_URL=https://mod-training-void-backend-cbpz.onrender.com
PORT=5000
```

## Deployment Checklist

### Frontend (Render.com or similar)
1. Set environment variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_PUBLISHABLE_KEY`
   - `REACT_APP_BACKEND_URL`

2. Build command: `cd frontend && yarn install && yarn build`
3. Start command: `cd frontend && yarn start`

### Backend (Render.com or similar)
1. Choose Flask (app.py) or FastAPI (server.py)
2. Build command: `cd backend && pip install -r requirements.txt`
3. Start command (Flask): `cd backend && gunicorn app:app`
4. Start command (FastAPI): `cd backend && python server.py`

### Supabase Configuration
1. Go to Authentication > URL Configuration
2. Set Redirect URLs:
   - `https://mod-training-void.onrender.com/callback`
   - `http://localhost:5000/callback` (for local development)

3. Enable Discord OAuth provider
4. Add Discord Application credentials

## Testing the Fix

1. Navigate to `https://mod-training-void.onrender.com/`
2. Click "Login" button
3. Authenticate with Discord
4. After Discord authorization, you should be redirected to `/callback`
5. The callback page should process the auth and redirect to `/test`
6. For admin users (with IDs in ADMIN_USER_IDS), navigate to `/admin`

## Troubleshooting

### Still stuck on "Processing login..."
- Check browser console for errors
- Verify Supabase redirect URL is configured correctly
- Ensure environment variables are set in production

### Admin page shows "Unauthorized"
- Check that your Discord user ID matches one in `ADMIN_USER_IDS` array
- User ID is found in `session.user.user_metadata.provider_id`

### Backend API errors
- Verify CORS is configured with your frontend domain
- Check backend logs for error details
- Ensure backend is deployed and accessible

## Admin User IDs

Currently configured admin IDs in both frontend and backend:
- `394600108846350346`
- `928635423465537579`

To add more admins, update the `ADMIN_USER_IDS` array in:
- `frontend/src/pages/Admin.js`
- `backend/server.py` (if using FastAPI)
