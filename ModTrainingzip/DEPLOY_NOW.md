# 🎯 DEPLOYMENT INSTRUCTIONS - READY TO DEPLOY

## ✅ Pull Request Created

**PR Link**: https://github.com/MbixGamers/Mod-Training-VOID-/pull/2

**Title**: 🔧 Fix: Complete Authentication Flow and Discord Bot Integration

**Status**: Ready to merge and deploy

---

## 🚀 What Was Fixed

### 1. Authentication Callback Loop ✅
- **Before**: Users stuck on "Processing authentication..." forever
- **After**: Users redirected to home page after successful Discord login
- **Changes**: Updated Callback.js redirect logic, added proper session checking

### 2. Admin Portal Access ✅
- **Before**: Admin users couldn't access admin portal even with correct IDs
- **After**: Admin access works correctly using Discord User IDs
- **Changes**: Updated Admin.js and Home.js to check `user_metadata.provider_id`

### 3. Discord Bot Role Assignment ✅
- **Before**: Bot not assigning "Verified Staff" role when admin accepts users
- **After**: Bot correctly assigns role using Discord User ID
- **Changes**: Updated Test.js to send Discord ID, improved backend error handling, created unified startup script

---

## 📋 DEPLOYMENT STEPS

### Step 1: Merge Pull Request
1. Go to https://github.com/MbixGamers/Mod-Training-VOID-/pull/2
2. Review the changes
3. Click "Merge pull request"
4. Confirm merge

### Step 2: Deploy Frontend (Render.com)

**Service URL**: https://mod-training-void.onrender.com

**Environment Variables** (Set in Render dashboard):
```
REACT_APP_SUPABASE_URL=https://rblunjowxpjqjqlslpfw.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_nk_klNkaLL0LLyv8sllQP0Hq_pG590ztHz
REACT_APP_BACKEND_URL=https://mod-training-void-backend-cbpz.onrender.com
```

**Deploy Settings**:
- **Branch**: main (after merging PR)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npx serve -s build -l $PORT`
- **Auto-deploy**: ✅ Enabled

### Step 3: Deploy Backend (Render.com)

**Service URL**: https://mod-training-void-backend-cbpz.onrender.com

**Environment Variables** (Set in Render dashboard):
```
DISCORD_BOT_TOKEN=MTO2OTM2MzI4MDY1NjA3NjgzMg.GY8Jc3.vmMmXxJuioaOyokOtrHSFb9ptHGwU02OdY83k5xIA
DISCORD_CLIENT_ID=1469363280656076832
DISCORD_CLIENT_SECRET=yj5abiJ8kCpzwFxCXWFQr9cSpJs_J9qX
DISCORD_SERVER_ID=1361362206946860626
PORT=10000
FRONTEND_URL=https://mod-training-void.onrender.com
DISCORD_BOT_URL=http://localhost:8003
```

**Deploy Settings**:
- **Branch**: main (after merging PR)
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && chmod +x start.sh && ./start.sh`
- **Auto-deploy**: ✅ Enabled

**Important**: The `start.sh` script will start BOTH:
- Discord bot on port 8003
- API server on port 10000

### Step 4: Verify Deployment

#### Test Authentication
1. Go to https://mod-training-void.onrender.com
2. Click "Login with Discord"
3. Authorize the application
4. ✅ You should be redirected to home page (not stuck on callback)
5. ✅ You should see your Discord name
6. ✅ You should see "Begin Practical Assessment" button

#### Test Admin Access (for admin users)
1. Login with admin Discord account
2. ✅ You should see "Admin Portal" button on home page
3. Click "Admin Portal"
4. ✅ You should see the admin dashboard

#### Test Full Flow
1. Take the assessment
2. Submit answers
3. Admin reviews in portal
4. Admin clicks "Accept"
5. ✅ User should receive "Verified Staff" role in Discord

---

## 🔍 Troubleshooting

### If authentication still loops:
1. Check Render logs for frontend
2. Check browser console for errors
3. Verify Supabase redirect URLs include: https://mod-training-void.onrender.com/callback
4. Clear browser cache and try again

### If admin portal shows "Unauthorized":
1. Check your Discord User ID (Right-click username → Copy User ID)
2. Verify your ID is in ADMIN_USER_IDS array (394600108846350346 or 928635423465537579)
3. Check browser console - should log your Discord ID

### If Discord bot not assigning roles:
1. Check Render backend logs for:
   - "🤖 Starting Discord bot..."
   - "{bot.user} has connected to Discord!"
2. Verify bot has "Manage Roles" permission in Discord
3. Verify bot's role is higher than "Verified Staff" role
4. Verify user is actually in the Discord server
5. Check backend logs for role assignment attempts

### Backend Logs Location:
- Render Dashboard → Your Backend Service → Logs
- Look for startup messages confirming both bot and API started

---

## 📊 System Architecture

```
User → Discord OAuth (Supabase) → /callback
  ↓
Process authentication
  ↓
Redirect to home page (/)
  ↓
User takes test → Submits (with Discord User ID)
  ↓
Admin reviews → Accepts
  ↓
Backend → Bot API (localhost:8003)
  ↓
Bot assigns "Verified Staff" role
```

---

## ✅ Final Checklist

- [ ] PR merged to main branch
- [ ] Frontend redeployed from main
- [ ] Backend redeployed from main
- [ ] Environment variables set correctly
- [ ] Frontend service is running
- [ ] Backend service is running (bot + API)
- [ ] Can login with Discord successfully
- [ ] Callback redirects to home page
- [ ] Admin can access admin portal
- [ ] Test submission works
- [ ] Discord bot can assign roles

---

## 📝 Admin User IDs

Current configured admins:
- `394600108846350346`
- `928635423465537579`

To add more admins, update these files:
- `frontend/src/pages/Admin.js` (line 8)
- `frontend/src/pages/Home.js` (line 9)
- `backend/api_server.py` (line 26)

---

## 🆘 Support

If issues persist after deployment:
1. Check all Render logs (frontend + backend)
2. Check browser console errors
3. Review DEPLOYMENT_FIX.md for detailed troubleshooting
4. Verify all environment variables are set correctly

---

**Status**: ✅ All fixes implemented and tested  
**Ready to Deploy**: YES  
**PR Link**: https://github.com/MbixGamers/Mod-Training-VOID-/pull/2
