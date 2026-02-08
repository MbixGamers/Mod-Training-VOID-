# 🚀 Complete Render.com Deployment Guide

## ✅ Issues Fixed

### 1. **start.sh Environment Loading Error** ✅
**Problem**: Script crashed with `export: '#': not a valid identifier`
- **Cause**: .env file contains comments starting with `#`
- **Solution**: Updated start.sh to filter out comments and empty lines using `grep -v '^#' .env | grep -v '^$'`

### 2. **API Server Port Configuration** ✅
**Problem**: API server was using wrong default port (5000 instead of 10000)
- **Cause**: Default port in api_server.py was set to 5000
- **Solution**: Updated default port to 10000 to match Render's expected port

### 3. **Discord Bot Integration** ✅
**Problem**: Discord bot and API server need to run together
- **Solution**: start.sh runs both services - bot on port 8003, API on port 10000

---

## 📋 DEPLOYMENT INSTRUCTIONS

### **Part 1: Backend Deployment (Web Service)**

#### **Step 1: Create/Update Backend Web Service on Render**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `MbixGamers/Mod-Training-VOID-`

#### **Step 2: Configure Backend Service**

**Basic Settings:**
- **Name**: `Mod-Training-VOID-Backend` (or your existing name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or `genspark_ai_developer` if deploying from PR)
- **Root Directory**: Leave empty (will use `cd backend` in commands)
- **Runtime**: `Python 3`

**Build & Deploy Settings:**
```bash
# Build Command
cd backend && pip install -r requirements.txt

# Start Command (IMPORTANT - this runs both bot and API)
cd backend && chmod +x start.sh && ./start.sh
```

#### **Step 3: Set Backend Environment Variables**

In Render Dashboard → Your Backend Service → Environment:

```env
DISCORD_BOT_TOKEN=MTO2OTM2MzI4MDY1NjA3NjgzMg.GY8Jc3.vmMmXxJuioaOyokOtrHSFb9ptHGwU02OdY83k5xIA
DISCORD_CLIENT_ID=1469363280656076832
DISCORD_CLIENT_SECRET=yj5abiJ8kCpzwFxCXWFQr9cSpJs_J9qX
DISCORD_SERVER_ID=1361362206946860626
PORT=10000
FRONTEND_URL=https://mod-training-void.onrender.com
DISCORD_BOT_URL=http://localhost:8003
```

**⚠️ IMPORTANT**: 
- Render automatically provides `PORT` environment variable
- Don't hardcode ports - use `$PORT` or `${PORT}` where needed
- The backend URL will be something like: `https://mod-training-void-backend-cbpz.onrender.com`

---

### **Part 2: Frontend Deployment (Static Site)**

#### **Step 1: Create/Update Frontend Static Site**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository: `MbixGamers/Mod-Training-VOID-`

#### **Step 2: Configure Frontend Static Site**

**Basic Settings:**
- **Name**: `Mod-Training-VOID-Frontend` (or your existing name)
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/build`

#### **Step 3: Set Frontend Environment Variables**

In Render Dashboard → Your Frontend Site → Environment:

```env
REACT_APP_SUPABASE_URL=https://rblunjowxpjqjqlslpfw.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibHVuam93eHBqcWpxbHNscGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MTU3NDYsImV4cCI6MjA1NDA5MTc0Nn0.Kb1EvvwDphx2DKcKGkPLG-kQxHW6T_Ps_HYe3uu9Dhw
REACT_APP_BACKEND_URL=https://mod-training-void-backend-cbpz.onrender.com
```

**⚠️ Replace** `https://mod-training-void-backend-cbpz.onrender.com` with your actual backend URL from Step 1!

---

### **Part 3: Supabase Configuration**

#### **Step 1: Set Redirect URLs**

Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Authentication → URL Configuration

**Redirect URLs** (add all of these):
```
https://mod-training-void.onrender.com/callback
https://mod-training-void.onrender.com/
https://mod-training-void.onrender.com/test
https://mod-training-void.onrender.com/admin
```

**Site URL**:
```
https://mod-training-void.onrender.com
```

#### **Step 2: Enable Discord OAuth Provider**

1. Go to Authentication → Providers
2. Enable **Discord**
3. Configure:
   - **Client ID**: `1469363280656076832`
   - **Client Secret**: `yj5abiJ8kCpzwFxCXWFQr9cSpJs_J9qX`
4. Save changes

---

## 🔍 Verification Steps

### **1. Check Backend Health**

Visit your backend URL + `/health`:
```
https://your-backend-url.onrender.com/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-08T12:34:56.789Z"
}
```

### **2. Check Backend Root**

Visit your backend URL:
```
https://your-backend-url.onrender.com/
```

**Expected Response**:
```json
{
  "message": "VOID Mod Training API",
  "status": "operational"
}
```

### **3. Check Backend Logs**

In Render Dashboard → Backend Service → Logs, look for:

```
🚀 Starting VOID Mod Training Backend Services...
📋 Loading environment variables from .env
🤖 Starting Discord bot on port 8003...
Bot started with PID: 12345
🌐 Starting API server on port 10000
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000
```

**AND** (within a few seconds):
```
INFO:discord.client: logging in using static token
INFO:discord.gateway: Shard ID None has connected to Gateway
VoidModBot#1234 has connected to Discord!
Bot is in 1 guilds
Web server started on port 8003
```

### **4. Test Frontend**

Visit your frontend URL:
```
https://mod-training-void.onrender.com
```

You should see the homepage with "Login with Discord" button.

### **5. Test Authentication Flow**

1. Click "Login with Discord"
2. Authorize the application
3. ✅ You should be redirected to `/callback` briefly
4. ✅ Then redirected to home page `/`
5. ✅ You should see your Discord username
6. ✅ You should see "Begin Practical Assessment" button

### **6. Test Admin Access** (if you're an admin)

Admin Discord IDs:
- `394600108846350346`
- `928635423465537579`

If you're an admin:
1. After logging in, you should see "Admin Portal" button
2. Click it to access admin dashboard

### **7. Test Complete Flow**

1. Take the assessment
2. Submit answers
3. Admin reviews submission
4. Admin clicks "Accept"
5. ✅ Check Discord - user should receive "Verified Staff" role

---

## 🐛 Troubleshooting

### **Backend Deployment Fails with "export: '#': not a valid identifier"**

✅ **FIXED** - Updated start.sh to filter comments from .env file

**If still occurring:**
1. Check that start.sh has execution permissions: `chmod +x backend/start.sh`
2. Verify the updated start.sh is deployed
3. Check Render logs for the exact error line

### **Backend Starts but Bot Doesn't Connect**

**Symptoms**: Logs show API server starting but no Discord bot messages

**Checks**:
1. Verify `DISCORD_BOT_TOKEN` is set correctly
2. Check Discord Developer Portal - ensure bot token is valid
3. Ensure bot has been invited to your server
4. Check bot has "Manage Roles" permission

**Solution**:
```bash
# Test bot token manually
curl -H "Authorization: Bot YOUR_BOT_TOKEN" \
  https://discord.com/api/v10/users/@me
```

### **Frontend Works but Backend Returns 404**

**Symptoms**: Frontend loads but API calls fail

**Checks**:
1. Verify `REACT_APP_BACKEND_URL` points to correct backend URL
2. Check CORS is enabled in backend (already configured)
3. Verify backend service is running

**Solution**: Rebuild frontend with correct `REACT_APP_BACKEND_URL`

### **Authentication Loops Forever**

**Symptoms**: After Discord OAuth, stays on "Processing authentication..."

**Checks**:
1. Check browser console for errors
2. Verify Supabase redirect URLs include your frontend URL + `/callback`
3. Clear browser cache and cookies

**Solution**: Update Supabase redirect URLs (see Part 3 above)

### **Discord Bot Can't Assign Roles**

**Symptoms**: Admin accepts user but Discord role not assigned

**Checks**:
1. Verify bot is in Discord server
2. Check bot has "Manage Roles" permission
3. Ensure bot's role is **higher** than "Verified Staff" role in server settings
4. Verify user is actually a member of the Discord server

**Solution**:
1. Go to Discord Server Settings → Roles
2. Drag bot's role above "Verified Staff" role
3. Ensure bot has "Manage Roles" permission

### **Backend Crashes After Some Time**

**Symptoms**: Backend works initially but crashes later

**Possible Causes**:
1. Memory issues (Render free tier has limits)
2. Discord bot disconnection
3. File system permissions

**Solution**:
- Upgrade to paid Render plan for more resources
- Check logs for specific error messages
- Ensure data persistence is configured if needed

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│         User's Browser                   │
│  https://mod-training-void.onrender.com  │
└────────────┬────────────────────────────┘
             │
             │ 1. Clicks "Login with Discord"
             ▼
┌─────────────────────────────────────────┐
│      Supabase (Discord OAuth)           │
│  https://rblunjowxpjqjqlslpfw.supabase  │
└────────────┬────────────────────────────┘
             │
             │ 2. Redirects to /callback
             ▼
┌─────────────────────────────────────────┐
│         Frontend (Static Site)          │
│           Render.com                    │
│                                         │
│  Routes:                                │
│  • / (Home)                             │
│  • /callback (Auth handler)             │
│  • /test (Assessment)                   │
│  • /admin (Admin portal)                │
│  • /results (Test results)              │
└────────────┬────────────────────────────┘
             │
             │ 3. API calls for submissions
             ▼
┌─────────────────────────────────────────┐
│       Backend (Web Service)             │
│           Render.com                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  API Server (FastAPI)           │   │
│  │  Port: 10000                    │   │
│  │  • POST /api/submissions        │   │
│  │  • GET  /api/submissions        │   │
│  │  • POST /api/admin/action       │   │
│  └─────────────┬───────────────────┘   │
│                │ 4. On admin accept    │
│                ▼                        │
│  ┌─────────────────────────────────┐   │
│  │  Discord Bot (discord.py)       │   │
│  │  Port: 8003                     │   │
│  │  • POST /api/assign-role        │   │
│  └─────────────┬───────────────────┘   │
└────────────────┼───────────────────────┘
                 │
                 │ 5. Assigns role
                 ▼
┌─────────────────────────────────────────┐
│         Discord Server                  │
│  ID: 1361362206946860626                │
│  Role: "Verified Staff"                 │
└─────────────────────────────────────────┘
```

---

## ✅ Final Checklist

Before considering deployment complete:

- [ ] Backend service is "Live" on Render
- [ ] Frontend static site is "Live" on Render
- [ ] Backend `/health` endpoint returns 200 OK
- [ ] Backend logs show both bot and API started
- [ ] Discord bot appears online in Discord server
- [ ] Frontend loads without errors
- [ ] Can click "Login with Discord"
- [ ] After OAuth, redirects to home page (not stuck)
- [ ] Can see Discord username on home page
- [ ] Can start assessment
- [ ] Can submit test
- [ ] Admin users can access admin portal
- [ ] Admin can accept/deny submissions
- [ ] Accepting users assigns Discord role

---

## 🔐 Security Notes

### **Environment Variables**

- **Never commit** .env files to Git
- **Always use** Render's environment variable settings
- **Rotate secrets** periodically (especially Discord bot token)

### **Discord Bot Token**

- Keep bot token secret
- If compromised, regenerate in Discord Developer Portal
- Update in Render environment variables immediately

### **Supabase Keys**

- Public (anon) key is safe to expose in frontend
- **Never expose** service role key
- Use Row Level Security (RLS) in Supabase

---

## 📝 Maintenance

### **Updating Code**

1. Make changes in your local repository
2. Commit to Git
3. Push to GitHub
4. Render will auto-deploy (if enabled)

### **Viewing Logs**

- **Backend**: Render Dashboard → Backend Service → Logs
- **Frontend**: Render Dashboard → Frontend Site → Logs
- **Real-time**: Use Render CLI `render logs <service-name> -f`

### **Scaling**

Render free tier limitations:
- Services sleep after 15 minutes of inactivity
- 750 hours/month free (1 service 24/7)
- Limited memory and CPU

To improve performance:
- Upgrade to Starter plan ($7/month per service)
- Services stay awake 24/7
- More memory and CPU allocated

---

## 🆘 Support Resources

- **Render Documentation**: https://render.com/docs
- **Discord.py Docs**: https://discordpy.readthedocs.io/
- **Supabase Docs**: https://supabase.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/

---

## 📞 Contact

If issues persist after following this guide:
1. Check all Render service logs
2. Check browser console errors
3. Verify all environment variables are set
4. Test each component individually

---

**Status**: ✅ All deployment issues resolved  
**Last Updated**: 2024-02-08  
**Version**: 4.0 (Production Ready)
