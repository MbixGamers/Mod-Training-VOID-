# 🚀 COMPLETE FIX & DEPLOYMENT GUIDE

## 🎯 Problems Fixed

### 1. ✅ Discord Bot Token Issue
- **Problem**: Bot was using an old/invalid token causing 401 Unauthorized errors
- **Fix**: Updated `backend/.env` with correct bot token from Discord Developer Portal

### 2. ✅ Authentication Callback Loop
- **Problem**: After Discord OAuth login, users were redirected to home page instead of test page
- **Fix**: Modified `Callback.js` to redirect to `/test` instead of `/` after successful authentication

### 3. ✅ Discord Webhook Integration
- **Problem**: No webhook notifications when users submit tests
- **Fix**: Created `unified_server.py` that sends Discord embeds with approve/deny buttons

### 4. ✅ Admin Approval → Role Assignment
- **Problem**: No connection between admin approval and Discord role assignment
- **Fix**: Integrated automatic role assignment when admin approves submission

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  User Browser   │
│  (React App)    │
└────────┬────────┘
         │
         │ Discord OAuth
         ▼
┌─────────────────┐
│    Supabase     │
│  (Auth Provider)│
└────────┬────────┘
         │
         │ Session Token
         ▼
┌─────────────────┐       ┌──────────────────┐
│  FastAPI Server │◄──────┤  Discord Bot     │
│  (unified)      │       │  (Role Manager)  │
└────────┬────────┘       └──────────────────┘
         │
         │ Webhook
         ▼
┌─────────────────┐
│  Discord Server │
│  (Notifications)│
└─────────────────┘
```

---

## 📋 Complete Workflow

1. **User Logs In** → Discord OAuth via Supabase
2. **Takes Test** → Answers submitted to FastAPI backend
3. **Submission Created** → Webhook sent to Discord with buttons
4. **Admin Reviews** → Can approve/deny from:
   - Discord buttons (webhook interaction)
   - Admin web panel
5. **If Approved** → Bot assigns "Verified Staff" role automatically
6. **User Notified** → DM from bot confirming role assignment

---

## 🔧 Backend Changes

### New Files Created:

1. **`backend/unified_server.py`** - Main API server with:
   - Test submission endpoint
   - Admin action endpoint
   - Webhook action endpoint
   - Automatic Discord notifications
   - Role assignment integration

2. **`backend/discord_interactions.py`** - Handles Discord button clicks (optional, for advanced setup)

3. **`backend/start_all.sh`** - Startup script that runs both bot and API

### Modified Files:

1. **`backend/.env`** - Added webhook URL and corrected token
2. **`backend/Procfile`** - Updated to use new startup script

---

## 🎨 Frontend Changes

### Modified Files:

1. **`frontend/src/pages/Callback.js`**
   - Changed redirect from `/` to `/test` after authentication
   - Changed failed auth redirect from `/` to `/login`

---

## 🚀 Render Deployment Steps

### Step 1: Update Environment Variables

Go to your Render backend service → Environment tab and set:

```bash
# Copy these values from your local backend/.env file
# DO NOT use these exact placeholders - use your actual values
DISCORD_BOT_TOKEN=<from_your_backend_env_file>
DISCORD_CLIENT_ID=<from_your_backend_env_file>
DISCORD_CLIENT_SECRET=<from_your_backend_env_file>
DISCORD_SERVER_ID=<from_your_backend_env_file>

# Discord OAuth Redirect
DISCORD_REDIRECT_URI=<from_your_backend_env_file>

# Webhook for notifications
DISCORD_WEBHOOK_URL=<from_your_backend_env_file>

# URLs
PORT=10000
FRONTEND_URL=https://mod-training-void.onrender.com
DISCORD_BOT_URL=http://localhost:8003
```

**Important**: The actual values are already configured in your local `backend/.env` file.
Copy them from there when setting up Render environment variables.

### Step 2: Update Build & Start Commands

**Backend Service:**
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && bash start_all.sh`
- **Root Directory**: Leave blank or set to root

**Frontend Service:**
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npx serve -s build -l 3000`
- **Root Directory**: Leave blank or set to root

### Step 3: Deploy

1. Push changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Fix: Complete authentication, webhook, and role assignment integration"
   git push origin main
   ```

2. Render will automatically detect changes and redeploy

3. Wait for both services to deploy (5-10 minutes)

### Step 4: Verify Deployment

1. **Check Backend Health**:
   - Visit: `https://mod-training-void-backend-cbpz.onrender.com/health`
   - Should return: `{"status": "healthy", ...}`

2. **Check Bot Connection**:
   - Check Render logs for: `Bot has connected to Discord!`
   - Verify bot is online in Discord server

3. **Test Frontend**:
   - Visit: `https://mod-training-void.onrender.com`
   - Click "Login with Discord"
   - Should redirect to test page after auth

---

## 🧪 Testing the Complete Flow

### Test 1: User Submission
1. Navigate to frontend URL
2. Click "Login with Discord"
3. Authorize application
4. **Should land on test page** (not home page)
5. Complete test
6. Submit answers

**Expected Result**:
- Submission appears in admin panel
- Discord webhook message appears in channel with approve/deny buttons

### Test 2: Admin Approval (Web)
1. Navigate to `/admin` as authorized admin
2. Click "Accept" on a submission

**Expected Result**:
- Submission status changes to "accepted"
- User receives "Verified Staff" role in Discord
- User receives DM from bot

### Test 3: Admin Approval (Discord)
1. Click "✅ Approve" button in Discord webhook message

**Expected Result**:
- Same as Test 2
- Button shows "✅ Approved submission for [username]"

---

## 🐛 Troubleshooting

### Issue: Bot Not Connecting

**Check**:
1. Bot token is correct in Render environment variables
2. Bot has proper intents enabled in Discord Developer Portal:
   - Server Members Intent ✅
   - Message Content Intent ✅
3. Check Render logs for connection errors

**Fix**:
```bash
# In Render dashboard → Logs, look for:
# "Bot has connected to Discord!"
# If not present, check token and intents
```

### Issue: Webhook Not Sending

**Check**:
1. Webhook URL is correct in environment variables
2. Backend can reach Discord (network issues)
3. Webhook hasn't been deleted in Discord

**Fix**:
1. Test webhook manually:
   ```bash
   curl -X POST \
     "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}'
   ```
   Replace YOUR_WEBHOOK_ID and YOUR_WEBHOOK_TOKEN with values from your backend/.env file

### Issue: Role Not Assigning

**Check**:
1. Bot has "Manage Roles" permission
2. Bot's role is HIGHER than "Verified Staff" role in Discord
3. User is actually in the server

**Fix**:
1. Move bot's role above "Verified Staff" in Discord server settings
2. Ensure bot has "Manage Roles" permission

### Issue: Authentication Loop

**Check**:
1. Supabase redirect URI is configured correctly
2. Frontend callback handler is working
3. Session is being stored properly

**Fix**:
1. Check Supabase dashboard → Authentication → URL Configuration
2. Ensure redirect URL matches: `https://mod-training-void.onrender.com/callback`

---

## 📊 API Endpoints Reference

### Backend API (`/api/*`)

#### `GET /health`
Returns server health status

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T12:00:00",
  "discord_webhook_configured": true,
  "discord_bot_url": "http://localhost:8003"
}
```

#### `GET /api/submissions`
Get all test submissions

**Response**:
```json
[
  {
    "id": "uuid",
    "user_id": "discord_user_id",
    "username": "Username",
    "score": 85.0,
    "passed": true,
    "status": "pending",
    "created_at": "2026-02-08T12:00:00"
  }
]
```

#### `POST /api/submissions`
Submit a test

**Body**:
```json
{
  "user_id": "discord_user_id",
  "user_email": "email@example.com",
  "username": "Username",
  "answers": [...],
  "score": 85.0,
  "passed": true
}
```

#### `POST /api/admin/action`
Admin approval/denial (from web panel)

**Body**:
```json
{
  "submission_id": "uuid",
  "action": "accepted" // or "denied"
}
```

#### `POST /api/webhook/action`
Webhook button interaction (from Discord)

**Body**:
```json
{
  "submission_id": "uuid",
  "action": "approve", // or "deny"
  "admin_user_id": "discord_admin_id"
}
```

### Bot API (`/api/*` on port 8003)

#### `POST /api/assign-role`
Assign role to Discord user

**Body**:
```json
{
  "user_id": "discord_user_id",
  "role_name": "Verified Staff"
}
```

---

## 🔐 Security Notes

1. **Environment Variables**: Never commit `.env` files
2. **Admin IDs**: Hardcoded in `unified_server.py` - update as needed
3. **CORS**: Currently allows all origins for development - restrict in production
4. **Webhook URL**: Keep secret, can be regenerated if compromised
5. **Bot Token**: Rotate periodically for security

---

## 📝 Next Steps

### Optional Enhancements:

1. **Database Integration**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Email Notifications**: Send email when submission is approved/denied
3. **Advanced Analytics**: Track submission patterns and pass rates
4. **Custom Roles**: Allow admins to assign different roles based on score
5. **Rate Limiting**: Prevent spam submissions

### Maintenance:

1. **Monitor Logs**: Check Render logs regularly for errors
2. **Update Dependencies**: Keep packages up to date
3. **Backup Data**: Implement database backups when using persistent storage
4. **Bot Token Rotation**: Change bot token every 6 months

---

## 🎉 Success Indicators

When everything is working correctly, you should see:

✅ Bot shows as online in Discord server
✅ Users can log in and are redirected to test page
✅ Test submissions appear in admin panel
✅ Discord webhook messages appear with buttons
✅ Clicking approve assigns role automatically
✅ Users receive DM confirmation
✅ Admin panel shows updated status

---

## 📞 Support

If issues persist:
1. Check Render logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test each component individually (bot, API, frontend)
4. Ensure Discord bot has proper permissions

---

**Last Updated**: 2026-02-08
**Version**: 2.0.0
**Status**: Ready for Production
