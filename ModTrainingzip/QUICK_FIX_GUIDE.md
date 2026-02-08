# 🎯 Quick Fix Guide - Render.com Backend Configuration

## ⚡ 3-Minute Fix

### What You Need to Change on Render.com

#### 1️⃣ **Backend Service Settings**

Go to: **Render Dashboard** → **Your Backend Service** → **Settings**

Find these fields and update them:

| Setting | ❌ Current (WRONG) | ✅ New (CORRECT) |
|---------|-------------------|------------------|
| **Root Directory** | (empty) | `ModTrainingzip/backend` |
| **Build Command** | `cd backend && pip install -r requirements.txt` | `pip install -r requirements.txt` |
| **Start Command** | `cd backend && chmod +x start.sh && ./start.sh` | `chmod +x start.sh && ./start.sh` |

**Why?** When Root Directory is set to `ModTrainingzip/backend`, Render automatically runs commands from that directory. The `cd backend` was causing a "directory not found" error because it was trying to go to `ModTrainingzip/backend/backend/` (double path).

---

#### 2️⃣ **Discord Bot Token** ⚠️ CRITICAL

Your current Discord bot token is **INVALID/EXPIRED**. You MUST regenerate it:

1. Go to: https://discord.com/developers/applications
2. Click on your application (Client ID: `1469363280656076832`)
3. Go to **Bot** section in left sidebar
4. Click **"Reset Token"** button
5. Click **"Yes, do it!"** to confirm
6. Copy the new token (it will only show once!)
7. Go back to Render Dashboard → Backend Service → **Environment**
8. Find `DISCORD_BOT_TOKEN` variable
9. Click Edit (pencil icon)
10. Paste the new token
11. Click **"Save Changes"**

---

#### 3️⃣ **Verify Environment Variables**

Make sure ALL these variables are set in Render Environment tab:

```
DISCORD_BOT_TOKEN=<your-new-token-from-step-2>
DISCORD_CLIENT_ID=1469363280656076832
DISCORD_CLIENT_SECRET=yj5abiJ8kCpzwFxCXWFQr9cSpJs_J9qX
DISCORD_SERVER_ID=1361362206246860626
DISCORD_REDIRECT_URI=https://rblunjowxpjqjqlslpfw.supabase.co/auth/v1/callback
PORT=10000
FRONTEND_URL=https://mod-training-void.onrender.com
DISCORD_BOT_URL=http://localhost:8003
```

---

## 📋 Step-by-Step Visual Walkthrough

### Step 1: Open Backend Service Settings

```
Render Dashboard
  └─ [Your Services]
      └─ Mod-Training-VOID-Backend (or similar name)
          └─ Click "Settings" tab at top
```

### Step 2: Scroll to "Build & Deploy"

Look for this section:

```
┌─────────────────────────────────────────────┐
│ BUILD & DEPLOY                              │
├─────────────────────────────────────────────┤
│                                             │
│ Root Directory                              │
│ ┌─────────────────────────────────────────┐ │
│ │ (empty)                           ← FIX │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Build Command                               │
│ ┌─────────────────────────────────────────┐ │
│ │ cd backend && pip install...      ← FIX │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Start Command                               │
│ ┌─────────────────────────────────────────┐ │
│ │ cd backend && chmod...            ← FIX │ │
│ └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### Step 3: Update Root Directory

Click in the "Root Directory" field and type:

```
ModTrainingzip/backend
```

### Step 4: Update Build Command

Clear the current command and replace with:

```
pip install -r requirements.txt
```

### Step 5: Update Start Command

Clear the current command and replace with:

```
chmod +x start.sh && ./start.sh
```

### Step 6: Save Changes

Scroll to the bottom and click:

```
┌──────────────────────┐
│   Save Changes       │
└──────────────────────┘
```

Render will automatically start a new deployment!

---

## 🎬 What Happens Next

After clicking "Save Changes":

1. ⏳ **Deployment starts** (you'll see logs streaming)
2. 📦 **Dependencies install** (should take ~1-2 minutes)
3. 🚀 **Services start**:
   - Discord bot starts on port 8003
   - API server starts on port 10000
4. ✅ **Backend goes LIVE** (green status)

---

## ✅ How to Know It Worked

### Check Logs (Render Dashboard → Logs)

You should see:

```bash
==> Building...
==> Running 'pip install -r requirements.txt'
Collecting Flask
Collecting fastapi
...
Successfully installed [all packages]

==> Build successful! 🎉

==> Starting service...
🚀 Starting VOID Mod Training Backend Services...
📋 Loading environment variables from .env
🤖 Starting Discord bot on port 8003...
Bot started with PID: 1234
🌐 Starting API server on port 10000...
INFO:     Started server process [5678]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000

INFO:discord.client: logging in using static token
INFO:discord.gateway: Shard ID None has connected to Gateway
YourBotName#1234 has connected to Discord!
Bot is in 1 guilds
Web server started on port 8003
```

### Test Health Endpoint

Open in browser or curl:

```bash
https://your-backend-url.onrender.com/health
```

Should return:

```json
{
  "status": "healthy",
  "timestamp": "2024-02-08T12:34:56.789Z"
}
```

---

## ⚠️ Common Issues

### ❌ Still seeing "No such file or directory"
**Solution:** Double-check Root Directory is exactly `ModTrainingzip/backend` (case-sensitive, no spaces)

### ❌ Bot connects but "401 Unauthorized"
**Solution:** You MUST regenerate Discord bot token (Step 2 above)

### ❌ "DISCORD_BOT_TOKEN not set" warning
**Solution:** Make sure you saved the new token in Environment variables

### ❌ Deployment fails with import errors
**Solution:** Clear Render build cache: Settings → scroll down → "Clear Build Cache & Deploy"

---

## 🎯 Summary Checklist

Before you start:
- [ ] I have access to Render Dashboard
- [ ] I have access to Discord Developer Portal
- [ ] I know my backend service name on Render

Do these in order:
1. [ ] Update Root Directory to `ModTrainingzip/backend`
2. [ ] Update Build Command to `pip install -r requirements.txt`
3. [ ] Update Start Command to `chmod +x start.sh && ./start.sh`
4. [ ] Click "Save Changes"
5. [ ] Go to Discord Developer Portal
6. [ ] Reset bot token
7. [ ] Copy new token
8. [ ] Update DISCORD_BOT_TOKEN in Render Environment
9. [ ] Save environment changes
10. [ ] Wait for deployment to complete
11. [ ] Check logs for success messages
12. [ ] Test health endpoint

Total time: **3-5 minutes** ⏱️

---

## 🆘 Need Help?

If you're stuck:

1. **Check Pull Request:** https://github.com/MbixGamers/Mod-Training-VOID-/pull/4
2. **Read Full Guide:** See `RENDER_FIX.md` in the repository
3. **Check Deployment Summary:** See `DEPLOYMENT_SUMMARY.md`

---

**Remember:** The main fixes are:
1. ✅ Set Root Directory to `ModTrainingzip/backend`
2. ✅ Remove `cd backend` from commands
3. ✅ Regenerate Discord bot token

That's it! 🎉
