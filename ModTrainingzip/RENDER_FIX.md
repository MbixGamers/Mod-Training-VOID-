# 🔧 RENDER.COM CONFIGURATION FIX

## ❌ Current Issue

The deployment is failing because of incorrect Root Directory configuration in Render.com settings.

**Error in logs:**
```
bash: line 1: cd: backend: No such file or directory
```

## ✅ Solution

### **Option 1: Fix Root Directory Setting (RECOMMENDED)**

Update your Render.com Backend service settings:

1. Go to Render Dashboard → Your Backend Service → Settings
2. Find **"Root Directory"** setting
3. **Change it to:** `ModTrainingzip/backend`
4. Scroll down and click **"Save Changes"**

Then update the Build & Start commands:

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
chmod +x start.sh && ./start.sh
```

**Why this works:** When Root Directory is `ModTrainingzip/backend`, Render runs commands from that directory, so we don't need `cd backend` anymore.

---

### **Option 2: Keep Root Directory Empty**

If you prefer to keep Root Directory empty, use these commands:

**Build Command:**
```bash
cd ModTrainingzip/backend && pip install -r requirements.txt
```

**Start Command:**
```bash
cd ModTrainingzip/backend && chmod +x start.sh && ./start.sh
```

---

## 📋 Complete Configuration (Option 1 - RECOMMENDED)

### Backend Web Service Settings:

**Basic Settings:**
- **Name:** `Mod-Training-VOID-Backend`
- **Region:** Oregon (US West) or closest to you
- **Branch:** `main`
- **Root Directory:** `ModTrainingzip/backend` ← **CRITICAL FIX**
- **Runtime:** `Python 3`

**Build & Deploy Settings:**
```bash
# Build Command
pip install -r requirements.txt

# Start Command  
chmod +x start.sh && ./start.sh
```

**Environment Variables:**
```env
DISCORD_BOT_TOKEN=MTO2OTM2MzI4MDY1NjA3NjgzMg.GY8Jc3.vmMmXxJuioaOyokOtrHSFb9ptHGwU02OdY83k5xIA
DISCORD_CLIENT_ID=1469363280656076832
DISCORD_CLIENT_SECRET=yj5abiJ8kCpzwFxCXWFQr9cSpJs_J9qX
DISCORD_SERVER_ID=1361362206946860626
DISCORD_REDIRECT_URI=https://rblunjowxpjqjqlslpfw.supabase.co/auth/v1/callback
PORT=10000
FRONTEND_URL=https://mod-training-void.onrender.com
DISCORD_BOT_URL=http://localhost:8003
```

---

## 🧪 Testing After Fix

### 1. Check Deployment Logs

After saving changes, Render will trigger a new deployment. Look for:

```
==> Cloning from https://github.com/MbixGamers/Mod-Training-VOID-...
==> Checking out commit abc123 in branch main
==> Using Python version 3.x
==> Running build command 'pip install -r requirements.txt'...
    Collecting Flask
    Collecting fastapi
    Collecting discord.py
    ...
    Successfully installed all dependencies
==> Build successful 🎉
==> Starting service with 'chmod +x start.sh && ./start.sh'...
    🚀 Starting VOID Mod Training Backend Services...
    📋 Loading environment variables from .env
    🤖 Starting Discord bot on port 8003...
    Bot started with PID: 12345
    🌐 Starting API server on port 10000...
    INFO:     Started server process [12346]
    INFO:     Waiting for application startup.
    INFO:     Application startup complete.
    INFO:     Uvicorn running on http://0.0.0.0:10000
```

And within seconds:
```
INFO:discord.client: logging in using static token
INFO:discord.gateway: Shard ID None has connected to Gateway
VoidModBot#1234 has connected to Discord!
Bot is in 1 guilds
Web server started on port 8003
```

### 2. Test Health Endpoint

Visit: `https://your-backend-url.onrender.com/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-08T12:34:56.789Z"
}
```

### 3. Test Root Endpoint

Visit: `https://your-backend-url.onrender.com/`

Expected response:
```json
{
  "message": "VOID Mod Training API",
  "status": "operational"
}
```

---

## 🎯 Frontend Configuration

Make sure your frontend also has the correct backend URL:

**Frontend Environment Variables on Render:**
```env
REACT_APP_SUPABASE_URL=https://rblunjowxpjqjqlslpfw.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibHVuam93eHBqcWpxbHNscGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MTU3NDYsImV4cCI6MjA1NDA5MTc0Nn0.Kb1EvvwDphx2DKcKGkPLG-kQxHW6T_Ps_HYe3uu9Dhw
REACT_APP_BACKEND_URL=https://your-actual-backend-url.onrender.com
```

**⚠️ Replace** `https://your-actual-backend-url.onrender.com` with your actual backend URL from Render!

**Frontend Build Command:**
```bash
cd ModTrainingzip/frontend && npm install && npm run build
```

**Frontend Publish Directory:**
```
ModTrainingzip/frontend/build
```

---

## 🔄 Quick Fix Summary

1. **Update Backend Root Directory** to `ModTrainingzip/backend`
2. **Update Build Command** to `pip install -r requirements.txt`
3. **Update Start Command** to `chmod +x start.sh && ./start.sh`
4. **Save Changes** - Render will auto-deploy
5. **Wait 2-3 minutes** for deployment to complete
6. **Check logs** - Should see bot and API starting
7. **Test health endpoint** - Should return 200 OK
8. **Update frontend** with correct backend URL if needed

---

## ✅ Success Indicators

- ✅ Backend deploys without "No such file or directory" error
- ✅ Logs show both Discord bot and API server starting
- ✅ Discord bot appears online in your Discord server
- ✅ Health endpoint returns 200 OK
- ✅ Root endpoint returns API info
- ✅ Frontend can connect to backend

---

## 🆘 Still Having Issues?

If problems persist:

1. **Check Build Logs** - Look for any Python package installation errors
2. **Check Runtime Logs** - Look for Discord bot connection errors
3. **Verify Environment Variables** - Ensure all variables are set correctly
4. **Test Discord Token** - Make sure bot token is valid
5. **Check Bot Permissions** - Bot needs "Manage Roles" permission in Discord
6. **Verify Bot Invite** - Make sure bot has been invited to your Discord server

---

**Status:** 🔧 Configuration fix required  
**Priority:** 🔴 Critical - Prevents backend deployment  
**Estimated Fix Time:** 2 minutes  
**Last Updated:** 2024-02-08
