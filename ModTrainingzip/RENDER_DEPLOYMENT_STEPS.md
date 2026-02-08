# 🚀 RENDER DEPLOYMENT - EXACT STEPS

## Prerequisites
- Git repository connected to Render
- Discord bot created with proper intents
- Supabase project configured

---

## 🔥 BACKEND SERVICE SETUP

### 1. Create New Web Service on Render

1. Go to Render Dashboard: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:

**Basic Settings:**
```
Name: mod-training-void-backend
Region: Oregon (US West)
Branch: main
Runtime: Python 3
```

**Build Settings:**
```
Root Directory: (leave blank)
Build Command: cd backend && pip install -r requirements.txt
Start Command: cd backend && bash start_all.sh
```

### 2. Environment Variables (CRITICAL!)

Click "Advanced" → Add Environment Variables:

```bash
DISCORD_BOT_TOKEN=<get_from_backend_env_file>
DISCORD_CLIENT_ID=<get_from_backend_env_file>
DISCORD_CLIENT_SECRET=<get_from_backend_env_file>
DISCORD_SERVER_ID=<get_from_backend_env_file>
DISCORD_REDIRECT_URI=<get_from_backend_env_file>
DISCORD_WEBHOOK_URL=<get_from_backend_env_file>
PORT=10000
FRONTEND_URL=https://mod-training-void.onrender.com
DISCORD_BOT_URL=http://localhost:8003
```

**⚠️ IMPORTANT**: Copy the actual values from your `backend/.env` file!
The file already contains the correct configured values.
DO NOT use placeholders - use real values from your .env file.

### 3. Advanced Settings

```
Health Check Path: /health
```

### 4. Click "Create Web Service"

Wait 5-10 minutes for deployment. Monitor logs for:
```
🤖 Starting Discord bot...
Discord bot started with PID: XXXX
[BOT] Bot has connected to Discord!
🌐 Starting FastAPI server...
Application startup complete.
```

---

## 🎨 FRONTEND SERVICE SETUP

### 1. Create New Static Site on Render

1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:

**Basic Settings:**
```
Name: mod-training-void-frontend
Region: Oregon (US West)
Branch: main
```

**Build Settings:**
```
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: build
```

### 2. Environment Variables

```bash
REACT_APP_SUPABASE_URL=https://rblunjowxpjqjqlslpfw.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_nk_klNkaLL0LLyv0HlJPONg_pG590ztHz
REACT_APP_BACKEND_URL=https://mod-training-void-backend-cbpz.onrender.com
```

### 3. Redirects/Rewrites (IMPORTANT!)

Add this redirect rule for React Router:

```
Source: /*
Destination: /index.html
Action: Rewrite
```

### 4. Click "Create Static Site"

---

## ✅ VERIFICATION CHECKLIST

After both services deploy:

### Backend Verification:
```bash
# Test 1: Health check
curl https://your-backend-url.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "discord_webhook_configured": true
}

# Test 2: Check logs
# Should see: "Bot has connected to Discord!"
```

### Frontend Verification:
1. Visit: https://your-frontend-url.onrender.com
2. Should see home page with "Login with Discord" button
3. Click login → Should redirect to Discord OAuth
4. After auth → Should redirect to TEST page (not home!)

### Discord Bot Verification:
1. Check Discord server member list
2. Bot should show as ONLINE (green dot)
3. If offline, check backend logs for errors

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Bot Shows Offline
**Symptoms**: Bot not in online status
**Fix**:
1. Check DISCORD_BOT_TOKEN in Render env vars
2. Verify intents enabled in Discord Developer Portal:
   - Go to: https://discord.com/developers/applications
   - Select your bot
   - Bot → Privileged Gateway Intents
   - Enable: SERVER MEMBERS INTENT ✅
   - Enable: MESSAGE CONTENT INTENT ✅
3. Redeploy backend service

### Issue 2: Authentication Redirects to Home Instead of Test
**Symptoms**: After Discord login, lands on home page
**Fix**:
1. Check that you've pulled latest changes with fixed `Callback.js`
2. Clear browser cache and cookies
3. Try incognito mode

### Issue 3: Webhook Not Sending
**Symptoms**: No Discord messages when user submits test
**Fix**:
1. Verify DISCORD_WEBHOOK_URL in env vars
2. Test webhook manually:
   ```bash
   curl -X POST \
     "https://discord.com/api/webhooks/1469965044178747464/tsd8g35ohlBhmaQci6lou-ieZ9EoXZhqSuh-aZ8yyu-j2mfsQymdvPUzV84_bQu9KYBG" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test from curl"}'
   ```
3. Check backend logs for webhook errors

### Issue 4: Role Not Assigning
**Symptoms**: Approval works but role not added
**Fix**:
1. In Discord server settings → Roles
2. Drag bot's role ABOVE "Verified Staff" role
3. Ensure bot has "Manage Roles" permission
4. Verify user is actually in the server

### Issue 5: Build Fails
**Backend Build Error**:
```bash
# Fix: Check requirements.txt exists
cd backend
cat requirements.txt
# Should list: fastapi, uvicorn, discord.py, etc.
```

**Frontend Build Error**:
```bash
# Fix: Check package.json exists
cd frontend
cat package.json
# Ensure all dependencies are listed
```

---

## 🔄 UPDATING AFTER DEPLOYMENT

When you make code changes:

```bash
# 1. Commit changes
git add .
git commit -m "Description of changes"
git push origin main

# 2. Render auto-deploys on push
# Check Render dashboard for deployment status

# 3. Monitor logs during deployment
# Backend: Look for "Bot has connected" and "Application startup complete"
# Frontend: Look for "Build succeeded"
```

---

## 🎯 FINAL VERIFICATION

Complete this test flow to confirm everything works:

1. **User Journey**:
   ```
   ✅ Visit frontend URL
   ✅ Click "Login with Discord"
   ✅ Authorize on Discord
   ✅ Redirected to TEST page
   ✅ Complete test
   ✅ Submit answers
   ✅ See success message
   ```

2. **Admin Journey (Discord)**:
   ```
   ✅ Webhook message appears in Discord
   ✅ Shows username, score, status
   ✅ Has approve/deny buttons
   ✅ Click approve
   ✅ Gets "✅ Approved" confirmation
   ```

3. **Admin Journey (Web)**:
   ```
   ✅ Navigate to /admin
   ✅ See list of submissions
   ✅ Click "Accept" or "Deny"
   ✅ Status updates
   ```

4. **Role Assignment**:
   ```
   ✅ User receives "Verified Staff" role
   ✅ User gets DM from bot
   ✅ Role visible in member list
   ```

---

## 📋 RENDER SERVICE URLS

After deployment, save these URLs:

```
Backend: https://mod-training-void-backend-cbpz.onrender.com
Frontend: https://mod-training-void.onrender.com
Health Check: https://mod-training-void-backend-cbpz.onrender.com/health
Admin Panel: https://mod-training-void.onrender.com/admin
```

---

## 🆘 EMERGENCY ROLLBACK

If deployment breaks:

1. Go to Render Dashboard
2. Select the broken service
3. Click "Deploys" tab
4. Find last working deployment
5. Click "⋮" → "Redeploy"

---

## ✨ SUCCESS!

When you see all these:
- ✅ Backend shows "healthy" status
- ✅ Bot shows online in Discord
- ✅ Frontend loads correctly
- ✅ Authentication works
- ✅ Test submissions appear
- ✅ Webhooks send to Discord
- ✅ Roles assign automatically

**You're done! 🎉**

---

**Need Help?**
Check backend logs in Render dashboard for detailed error messages.
All logs show timestamps and error traces.
