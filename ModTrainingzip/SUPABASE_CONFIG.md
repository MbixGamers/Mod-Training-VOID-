# ⚙️ SUPABASE CONFIGURATION REFERENCE

## 🔐 Required Supabase Settings

### Discord OAuth Provider Configuration

Navigate to: **Supabase Dashboard → Authentication → Providers → Discord**

**Settings**:
```
✅ Discord Enabled: YES

Client ID: 1469363280656076832
Client Secret: yj5abiJ8kCpzwFxCXWFQr9cSpJs_J9qX
Callback URL (Supabase generates): https://rblunjowxpjqjqlslpfw.supabase.co/auth/v1/callback
```

### Redirect URLs Configuration

Navigate to: **Supabase Dashboard → Authentication → URL Configuration**

**Site URL**:
```
https://mod-training-void.onrender.com
```

**Redirect URLs** (Add all of these):
```
https://mod-training-void.onrender.com/callback
https://mod-training-void.onrender.com/
https://mod-training-void.onrender.com/test
https://mod-training-void.onrender.com/admin
https://mod-training-void.onrender.com/results
http://localhost:3000/callback (for local development)
http://localhost:3000/ (for local development)
```

### Additional Providers (Ensure these are disabled if not used):
```
❌ Email: Optional (can enable for email/password login)
❌ Phone: Disabled
✅ Discord: ENABLED (primary authentication method)
❌ Google: Disabled
❌ GitHub: Disabled
```

---

## 🎮 DISCORD DEVELOPER PORTAL CONFIGURATION

Navigate to: **Discord Developer Portal → Your Application → OAuth2**

**OAuth2 Redirect URLs** (Must match exactly):
```
https://rblunjowxpjqjqlslpfw.supabase.co/auth/v1/callback
```

**OAuth2 Scopes** (Automatically selected by Supabase):
- identify
- email
- guilds (optional, for server membership check)

**Bot Permissions** (for role assignment):
- Manage Roles (required)
- View Channels (required)
- Send Messages (optional, for DM notifications)

**Privileged Gateway Intents** (Required for bot):
- ✅ Server Members Intent
- ❌ Presence Intent (optional)
- ❌ Message Content Intent (optional)

---

## 🔗 URL Mapping Reference

| Purpose | URL | Notes |
|---------|-----|-------|
| Frontend | https://mod-training-void.onrender.com | Main app |
| Backend API | https://mod-training-void-backend-cbpz.onrender.com | API + Bot |
| Supabase | https://rblunjowxpjqjqlslpfw.supabase.co | Auth provider |
| Discord Bot API | http://localhost:8003/api/assign-role | Internal only |

---

## 🔄 Authentication Flow URLs

```
Step 1: User clicks "Login with Discord"
  → Frontend initiates Supabase auth
  
Step 2: Redirect to Discord OAuth
  → https://discord.com/oauth2/authorize?...
  
Step 3: User authorizes on Discord
  → Discord redirects to Supabase callback
  
Step 4: Supabase processes OAuth
  → https://rblunjowxpjqjqlslpfw.supabase.co/auth/v1/callback
  
Step 5: Supabase redirects to frontend callback
  → https://mod-training-void.onrender.com/callback
  
Step 6: Frontend processes session
  → /callback page checks for session
  
Step 7: Redirect to home
  → https://mod-training-void.onrender.com/
```

---

## ✅ Verification Commands

### Check if Discord OAuth is working:
```bash
curl -I https://rblunjowxpjqjqlslpfw.supabase.co/auth/v1/callback
# Should return: 200 OK or 302 redirect
```

### Check if frontend is accessible:
```bash
curl -I https://mod-training-void.onrender.com
# Should return: 200 OK
```

### Check if backend API is running:
```bash
curl https://mod-training-void-backend-cbpz.onrender.com/health
# Should return: {"status":"healthy","timestamp":"..."}
```

### Check if Discord bot API is responding (from backend server):
```bash
# This only works from within the backend server
curl http://localhost:8003/api/assign-role -X POST \
  -H "Content-Type: application/json" \
  -d '{"user_id":"YOUR_DISCORD_ID","role_name":"Verified Staff"}'
```

---

## 🚨 Common Configuration Mistakes

### ❌ WRONG: Using /test as primary redirect
```
# DON'T DO THIS:
Supabase Redirect URLs: https://mod-training-void.onrender.com/test
Callback.js: navigate('/test')
```

### ✅ CORRECT: Using /callback then redirect to home
```
# DO THIS:
Supabase Redirect URLs: https://mod-training-void.onrender.com/callback
Callback.js: navigate('/') after processing
```

### ❌ WRONG: Checking Supabase UUID for admin
```javascript
// DON'T DO THIS:
const isAdmin = ADMIN_USER_IDS.includes(session.user.id);
```

### ✅ CORRECT: Checking Discord User ID
```javascript
// DO THIS:
const discordUserId = session.user.user_metadata?.provider_id;
const isAdmin = ADMIN_USER_IDS.includes(discordUserId);
```

### ❌ WRONG: Sending Supabase UUID to backend
```javascript
// DON'T DO THIS:
await axios.post('/api/submissions', {
  user_id: user.id  // This is Supabase UUID
});
```

### ✅ CORRECT: Sending Discord User ID
```javascript
// DO THIS:
const discordUserId = user.user_metadata?.provider_id;
await axios.post('/api/submissions', {
  user_id: discordUserId  // This is Discord User ID
});
```

---

## 📋 Quick Reference

**Supabase Project**: rblunjowxpjqjqlslpfw  
**Discord Client ID**: 1469363280656076832  
**Discord Server ID**: 1361362206946860626  
**Frontend URL**: https://mod-training-void.onrender.com  
**Backend URL**: https://mod-training-void-backend-cbpz.onrender.com  
**Admin IDs**: 394600108846350346, 928635423465537579

---

**Last Updated**: 2024-02-08  
**Status**: ✅ All configurations correct and verified
