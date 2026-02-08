# 🚀 QUICK REFERENCE CARD

## 📋 DEPLOYMENT CHECKLIST

### 1. Environment Variables for Backend
```bash
DISCORD_BOT_TOKEN=your_bot_token_from_discord_dev_portal
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_SERVER_ID=your_server_id
DISCORD_REDIRECT_URI=https://your-supabase-project.supabase.co/auth/v1/callback
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
PORT=10000
FRONTEND_URL=https://your-frontend.onrender.com
DISCORD_BOT_URL=http://localhost:8003
```

**Note**: Get actual values from:
- Bot token: Discord Developer Portal > Bot
- Webhook URL: Discord channel > Integrations > Webhooks
- Other IDs: Check your backend/.env file (already configured)

### 2. Environment Variables for Frontend
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
```

**Note**: Get from Supabase dashboard > Project Settings > API

### 3. Backend Build Commands
```bash
Build: cd backend && pip install -r requirements.txt
Start: cd backend && bash start_all.sh
```

### 4. Frontend Build Commands
```bash
Build: npm install && npm run build
Start: npx serve -s build -l 3000
Root: frontend
```

### 5. Frontend Redirect Rule
```
Source: /*
Destination: /index.html
Action: Rewrite
```

---

## 🔍 VERIFICATION COMMANDS

```bash
# Check backend health
curl https://your-backend.onrender.com/health

# Expected response
{"status": "healthy", "discord_webhook_configured": true, ...}

# Test webhook manually
curl -X POST \
  "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test webhook"}'

# Check if bot file exists
ls -la backend/discord_bot.py

# Check if startup script is executable
ls -la backend/start_all.sh

# Run local verification
bash test_setup.sh
```

---

## 📝 GIT COMMANDS

```bash
# Check status
git status

# Stage all changes
git add -A

# Commit with message
git commit -m "fix: Complete integration"

# Push to GitHub
git push origin main

# Check remote
git remote -v

# View commit history
git log --oneline -5
```

---

## 🐛 TROUBLESHOOTING QUICK FIXES

| Problem | Solution | Command/Action |
|---------|----------|----------------|
| Bot offline | Check token & intents | Update DISCORD_BOT_TOKEN in Render |
| Auth loops | Clear cache | Incognito mode or clear cookies |
| Webhook fails | Verify URL | Test with curl command |
| Role not assigned | Check permissions | Move bot role above target role |
| Build fails | Check syntax | Run `bash test_setup.sh` |
| Import errors | Install deps | `pip install -r requirements.txt` |
| Frontend 404 | Add redirect | Add /* → /index.html rewrite |
| Port conflict | Change port | Update PORT env var |

---

## 📊 KEY ENDPOINTS

### Backend (API)
```
GET  /                     - API info
GET  /health               - Health check
GET  /api/submissions      - Get all submissions
POST /api/submissions      - Submit test
POST /api/admin/action     - Admin approval (web)
POST /api/webhook/action   - Admin approval (Discord)
```

### Bot (Internal)
```
POST /api/assign-role      - Assign Discord role
```

### Frontend
```
/                          - Home page
/login                     - Login page
/callback                  - OAuth callback
/test                      - Test page (protected)
/admin                     - Admin panel (protected)
/results                   - Results page
```

---

## 🎯 SUCCESS INDICATORS

✅ Backend logs show:
```
🤖 Starting Discord bot...
Discord bot started with PID: XXXX
[BOT] Bot has connected to Discord!
🌐 Starting FastAPI server...
Application startup complete
```

✅ Bot shows online in Discord

✅ Login redirects to /test (not home)

✅ Test submission creates webhook

✅ Webhook has buttons

✅ Approval assigns role

✅ User receives DM

---

## 🔐 SECURITY CHECKLIST

- [ ] Bot token in env vars only (not in code)
- [ ] Webhook URL kept secret
- [ ] Admin IDs hardcoded in server
- [ ] CORS configured for specific domains
- [ ] HTTPS only for all endpoints
- [ ] Session tokens validated
- [ ] Discord intents minimal (only needed ones)
- [ ] Bot permissions minimal (Manage Roles only)

---

## 📞 SUPPORT RESOURCES

| Document | Purpose |
|----------|---------|
| `SOLUTION_SUMMARY.md` | Overview of fixes |
| `COMPLETE_FIX_GUIDE.md` | Technical details |
| `RENDER_DEPLOYMENT_STEPS.md` | Step-by-step deployment |
| `SYSTEM_FLOW_DIAGRAM.md` | Visual architecture |
| `test_setup.sh` | Local verification |

---

## 🚦 DEPLOYMENT STATUS

### Before Deployment
- [ ] All files committed
- [ ] Git pushed to GitHub
- [ ] Render services created
- [ ] Environment variables set
- [ ] Discord intents enabled
- [ ] Webhook created

### After Deployment
- [ ] Backend health returns 200
- [ ] Bot shows online
- [ ] Frontend loads
- [ ] Login works
- [ ] Test page accessible
- [ ] Submissions create webhooks
- [ ] Buttons work
- [ ] Roles assign

---

## 💡 COMMON COMMANDS

```bash
# Backend local test
cd backend && python3 unified_server.py

# Frontend local test
cd frontend && npm start

# Check logs (Render)
# Dashboard → Service → Logs tab

# Restart service (Render)
# Dashboard → Service → Manual Deploy → Deploy Latest Commit

# Update env vars (Render)
# Dashboard → Service → Environment → Edit

# Check bot status (Discord)
# Server → Members list → Find bot

# Test webhook
curl -X POST [WEBHOOK_URL] -H "Content-Type: application/json" -d '{"content":"test"}'
```

---

## 📈 METRICS TO MONITOR

| Metric | Expected | Alert If |
|--------|----------|----------|
| Backend uptime | 100% | < 99% |
| Bot connection | Online | Offline > 1 min |
| Webhook delivery | < 2s | > 5s |
| Role assignment | < 3s | > 10s |
| Frontend load | < 3s | > 5s |
| API response | < 500ms | > 2s |

---

## 🔄 UPDATE WORKFLOW

```
1. Make changes locally
   ↓
2. Test with test_setup.sh
   ↓
3. Git commit & push
   ↓
4. Render auto-deploys
   ↓
5. Monitor logs
   ↓
6. Verify endpoints
   ↓
7. Test user flow
```

---

## 🎨 ADMIN USER IDS

Current admins (update in `unified_server.py`):
```python
ADMIN_USER_IDS = [
    "394600108846350346",
    "928635423465537579"
]
```

To add more: Edit `backend/unified_server.py` line 62

---

## 📦 FILE STRUCTURE

```
ModTrainingzip/
├── backend/
│   ├── .env                      ← Environment variables
│   ├── discord_bot.py            ← Bot with role assignment
│   ├── unified_server.py         ← Main API server ⭐
│   ├── start_all.sh              ← Startup script ⭐
│   ├── requirements.txt          ← Python dependencies
│   └── Procfile                  ← Render config
├── frontend/
│   ├── src/
│   │   └── pages/
│   │       ├── Callback.js       ← Fixed redirect ⭐
│   │       ├── Login.js
│   │       ├── Test.js
│   │       └── Admin.js
│   ├── package.json
│   └── .env                      ← Frontend env vars
├── SOLUTION_SUMMARY.md           ← Quick overview
├── COMPLETE_FIX_GUIDE.md         ← Full documentation
├── RENDER_DEPLOYMENT_STEPS.md    ← Deployment guide
├── SYSTEM_FLOW_DIAGRAM.md        ← Visual diagrams
└── test_setup.sh                 ← Verification script
```

---

## 🎉 FINAL CHECKLIST

Before going live:
- [ ] Read SOLUTION_SUMMARY.md
- [ ] Set up Render services
- [ ] Add all environment variables
- [ ] Enable Discord intents
- [ ] Test locally (optional)
- [ ] Deploy to Render
- [ ] Verify health endpoints
- [ ] Test complete user flow
- [ ] Test admin approval flow
- [ ] Test role assignment
- [ ] Celebrate! 🎊

---

**Quick Links:**
- Backend Health: `https://your-backend.onrender.com/health`
- Frontend: `https://your-frontend.onrender.com`
- Admin Panel: `https://your-frontend.onrender.com/admin`
- Discord Bot Developers: `https://discord.com/developers/applications`

---

**Version:** 2.0.0 | **Date:** 2026-02-08 | **Status:** Production Ready ✅
