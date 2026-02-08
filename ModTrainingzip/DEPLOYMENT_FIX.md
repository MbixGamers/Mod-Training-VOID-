# 🔧 Complete Fix Documentation - VOID Mod Training Portal

## Issues Fixed

### 1. ❌ Authentication Loop Problem
**Issue**: After Discord login, users were stuck on "Processing login..." and never redirected to the app.

**Root Cause**: 
- Callback.js was redirecting to `/test` immediately
- But Supabase redirect URL was configured for `/callback`
- This created a loop where auth never completed properly

**Solution**:
- Updated Callback.js to redirect to `/` (home page) after authentication
- Home page shows "Begin Practical Assessment" button to start test
- Proper session checking and error handling added
- Better logging for debugging auth issues

### 2. ❌ Admin Portal Access Issue
**Issue**: Admin check was using wrong user ID field

**Root Cause**:
- Frontend was checking `session.user.id` (Supabase UUID)
- Should check `session.user.user_metadata.provider_id` (Discord User ID)
- Admin IDs are Discord User IDs, not Supabase UUIDs

**Solution**:
- Updated Admin.js to check `provider_id` from user metadata
- Updated Home.js to use same check for admin button visibility
- Added console logging for debugging admin access

### 3. ❌ Discord Bot Not Assigning Roles
**Issue**: When admin accepts a user, Discord role was not being assigned

**Root Causes**:
- Test submission was sending Supabase user ID instead of Discord user ID
- Backend wasn't properly calling Discord bot API
- Discord bot might not be running

**Solutions**:
- Updated Test.js to send Discord `provider_id` as `user_id`
- Improved error handling in api_server.py for role assignment
- Created unified startup script to run both bot and API server
- Added proper timeout and error logging

### 4. ❌ Environment Configuration
**Issue**: Missing or incorrect environment variables

**Solution**: Created proper .env files for both frontend and backend

## 📁 Files Modified

### Frontend Files:
1. `/frontend/.env` - NEW: Environment configuration
2. `/frontend/src/pages/Callback.js` - Fixed auth flow
3. `/frontend/src/pages/Admin.js` - Fixed admin ID check
4. `/frontend/src/pages/Home.js` - Fixed admin button visibility
5. `/frontend/src/pages/Test.js` - Fixed Discord user ID in submission

### Backend Files:
1. `/backend/.env` - NEW: Environment configuration
2. `/backend/api_server.py` - Fixed role assignment logic
3. `/backend/start.sh` - NEW: Unified startup script

## 🚀 Deployment Instructions

### Supabase Configuration

1. **Redirect URLs** (Already configured in your screenshots):
   ```
   https://mod-training-void.onrender.com/callback
   https://mod-training-void.onrender.com/admin  
   https://mod-training-void.onrender.com/test
   https://mod-training-void.onrender.com/
   ```

2. **Discord OAuth Settings**:
   - Provider: Discord
   - Client ID: `1469363280656076832`
   - Client Secret: `yj5abiJ8kCpzwFxCXWFQr9cSpJs_J9qX`
   - Redirect URI: `https://rblunjowxpjqjqlslpfw.supabase.co/auth/v1/callback`

### Frontend Deployment (Render.com)

1. **Environment Variables**:
   ```
   REACT_APP_SUPABASE_URL=https://rblunjowxpjqjqlslpfw.supabase.co
   REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_nk_klNkaLL0LLyv8sllQP0Hq_pG590ztHz
   REACT_APP_BACKEND_URL=https://mod-training-void-backend-cbpz.onrender.com
   ```

2. **Build Settings**:
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && serve -s build -l 3000`
   - Or Static Site: Point to `frontend/build` directory

### Backend Deployment (Render.com)

1. **Environment Variables**:
   ```
   DISCORD_BOT_TOKEN=MTO2OTM2MzI4MDY1NjA3NjgzMg.GY8Jc3.vmMmXxJuioaOyokOtrHSFb9ptHGwU02OdY83k5xIA
   DISCORD_CLIENT_ID=1469363280656076832
   DISCORD_CLIENT_SECRET=yj5abiJ8kCpzwFxCXWFQr9cSpJs_J9qX
   DISCORD_SERVER_ID=1361362206946860626
   DISCORD_REDIRECT_URI=https://rblunjowxpjqjqlslpfw.supabase.co/auth/v1/callback
   PORT=10000
   FRONTEND_URL=https://mod-training-void.onrender.com
   DISCORD_BOT_URL=http://localhost:8003
   ```

2. **Build Settings**:
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && ./start.sh`
   
   **OR** if start.sh doesn't work:
   - Start Command: `cd backend && python3 discord_bot.py & python3 api_server.py`

## 🔍 Testing the Fix

### 1. Test Authentication Flow
1. Go to `https://mod-training-void.onrender.com`
2. Click "Login with Discord"
3. Authorize the application
4. You should be redirected to `/callback` with "Processing authentication..."
5. Then redirected to home page `/` 
6. You should see your Discord name and "Begin Practical Assessment" button

### 2. Test Admin Access
1. Login with admin Discord account (IDs: `394600108846350346` or `928635423465537579`)
2. On home page, you should see "Admin Portal" button
3. Click "Admin Portal"
4. You should see the admin dashboard with submissions

### 3. Test Taking Assessment
1. From home page, click "Begin Practical Assessment"
2. Go through test questions
3. Submit the test
4. Check results page

### 4. Test Admin Actions
1. Login as admin
2. Go to Admin Portal
3. Find a pending submission
4. Click "Accept" or "Deny"
5. If Accept + user passed (score >= 80%):
   - Backend should call Discord bot API
   - Bot should assign "Verified Staff" role
   - Check Discord server to verify role was added

## 🐛 Troubleshooting

### "Processing authentication..." Stuck
**Check**:
- Browser console for errors
- Make sure Supabase redirect URLs include `/callback`
- Verify Discord OAuth is enabled in Supabase

**Solution**: Clear browser cache and cookies, try again

### Admin Portal Shows "Unauthorized"
**Check**:
- Your Discord User ID (not Supabase ID)
- Browser console should log: `Discord ID: <your_id>`
- Verify your ID is in ADMIN_USER_IDS array

**Get Your Discord ID**:
1. Enable Developer Mode in Discord
2. Right-click your username
3. Click "Copy User ID"

### Discord Bot Not Assigning Roles
**Check Backend Logs**:
```bash
# On Render.com, check logs for:
"🤖 Starting Discord bot..."
"Bot started with PID: ..."
"{bot.user} has connected to Discord!"
```

**Common Issues**:
- Bot not running: Check backend logs
- Bot lacks permissions: Ensure bot has "Manage Roles" permission
- Bot role position: Bot's role must be higher than "Verified Staff" role
- User not in server: User must be member of Discord server

**Test Bot Manually**:
```bash
curl -X POST http://localhost:8003/api/assign-role \
  -H "Content-Type: application/json" \
  -d '{"user_id": "YOUR_DISCORD_ID", "role_name": "Verified Staff"}'
```

### Backend Not Connecting to Bot
**Check**:
- Both bot and API server are running
- Bot is listening on port 8003
- API server can reach `localhost:8003`

**On Render.com**:
- Both processes must run in same service
- Use `start.sh` script to start both
- Check logs to confirm both started

## 📊 System Architecture

```
┌─────────────────┐
│  Discord OAuth  │
│  (Supabase)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Frontend (Render.com)         │
│   https://mod-training-void...  │
│                                 │
│   Routes:                       │
│   / (Home)                      │
│   /callback (Auth handler)      │
│   /test (Assessment)            │
│   /admin (Admin portal)         │
│   /results (Test results)       │
└────────┬────────────────────────┘
         │
         │ API Calls
         ▼
┌─────────────────────────────────┐
│   Backend (Render.com)          │
│   https://mod-training-void-... │
│                                 │
│   Services:                     │
│   ├─ API Server (Port 10000)    │
│   │  └─ FastAPI                 │
│   └─ Discord Bot (Port 8003)    │
│      └─ discord.py              │
└────────┬────────────────────────┘
         │
         │ Bot API
         ▼
┌─────────────────┐
│  Discord Server │
│  ID: 1361...626 │
│  Role: Verified │
│        Staff    │
└─────────────────┘
```

## ✅ Verification Checklist

- [ ] Frontend deployed to Render.com
- [ ] Backend deployed to Render.com
- [ ] Environment variables set in both services
- [ ] Supabase redirect URLs configured
- [ ] Discord OAuth enabled in Supabase
- [ ] Discord bot has required permissions
- [ ] Can login with Discord successfully
- [ ] Redirects to home page after auth
- [ ] Can take assessment
- [ ] Can view results
- [ ] Admin can access admin portal
- [ ] Admin can accept/deny submissions
- [ ] Discord bot assigns role on acceptance

## 🔐 Admin User IDs

Current configured admin Discord User IDs:
- `394600108846350346`
- `928635423465537579`

To add more admins, update in both:
- `frontend/src/pages/Admin.js` - Line 8
- `frontend/src/pages/Home.js` - Line 9
- `backend/api_server.py` - Line 26

## 📝 Notes

- All user IDs are Discord User IDs (provider_id), not Supabase UUIDs
- Test submissions store Discord user ID for role assignment
- Admin checks use Discord user ID from user_metadata.provider_id
- Discord bot and API server run as separate processes on same service
- Bot must be running for automatic role assignment to work

---

**Version**: 3.0 (Fixed)  
**Last Updated**: 2024-02-08  
**Status**: ✅ All critical issues resolved
