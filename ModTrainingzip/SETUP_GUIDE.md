# VOID Mod Training Portal - Setup and Deployment Guide

## 🎯 Overview

This application is a comprehensive moderator training and assessment platform for the VOID Esports organization. It includes:

- **Frontend**: React SPA with Discord OAuth authentication
- **Backend**: FastAPI server with submission management
- **Discord Bot**: Automated role assignment for approved candidates

## 🔧 Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Discord Bot Token
- Supabase Account (for authentication)
- Discord Server with proper bot permissions

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MbixGamers/Mod-Training-VOID-.git
cd Mod-Training-VOID-
cd ModTrainingzip
```

### 2. Environment Variables

Create a `.env` file in the root directory (`ModTrainingzip/.env`):

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_SERVER_ID=your_discord_server_id_here

# Backend Configuration
PORT=5000
DISCORD_BOT_URL=http://localhost:8003

# Optional: Database (for production)
# MONGODB_URI=mongodb://localhost:27017/void_training
```

Create a `.env` file in the frontend directory (`ModTrainingzip/frontend/.env`):

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:5000

# Optional: Development
ENABLE_HEALTH_CHECK=true
```

### 3. Install Dependencies

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

#### Frontend
```bash
cd frontend
npm install
cd ..
```

## 🚀 Running the Application

### Option 1: Using the Startup Script (Recommended)

```bash
# Make scripts executable (first time only)
chmod +x start_servers.sh stop_servers.sh

# Start all services
./start_servers.sh

# Stop all services
./stop_servers.sh
```

This will start:
- Discord Bot on port 8003
- API Server on port 5000
- Frontend on port 3000

### Option 2: Manual Start

#### Terminal 1 - Discord Bot
```bash
cd backend
source venv/bin/activate
python discord_bot.py
```

#### Terminal 2 - API Server
```bash
cd backend
source venv/bin/activate
python api_server.py
```

#### Terminal 3 - Frontend
```bash
cd frontend
npm start
```

## 🔐 Discord Bot Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token and add to `.env`
5. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Presence Intent (optional)

### 2. Bot Permissions

The bot needs the following permissions:
- Manage Roles
- View Channels
- Send Messages

Permission Integer: `268435456`

### 3. Invite Bot to Server

Use this URL (replace CLIENT_ID with your application ID):
```
https://discord.com/oauth2/authorize?client_id=CLIENT_ID&permissions=268435456&scope=bot
```

## 🔒 Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy the project URL and anon key

### 2. Enable Discord OAuth

1. In Supabase dashboard, go to Authentication → Providers
2. Enable Discord provider
3. Add your Discord OAuth credentials:
   - Client ID (from Discord Developer Portal)
   - Client Secret (from Discord Developer Portal)
4. Add callback URL: `http://localhost:3000/callback` (or your production URL)

### 3. Configure Discord OAuth

1. In Discord Developer Portal, go to OAuth2
2. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`

## 👥 Admin Configuration

Admin users are defined in the code. To add admins:

1. Get the Discord User ID of the admin
2. Add to `ADMIN_USER_IDS` in:
   - `frontend/src/pages/Home.js`
   - `frontend/src/pages/Admin.js`

```javascript
const ADMIN_USER_IDS = ['394600108846350346', '928635423465537579', 'YOUR_USER_ID'];
```

## 📊 Application Flow

### User Journey

1. **Login**: User clicks "Login with Discord" → Redirected to Supabase/Discord OAuth
2. **Callback**: After successful auth, redirected to `/callback` → Processes auth → Redirects to `/test`
3. **Test**: User takes the assessment (multiple choice questions)
4. **Results**: User sees their score and submission status
5. **Admin Review**: Admin reviews submission in admin portal
6. **Role Assignment**: If approved, Discord bot automatically assigns "Verified Staff" role

### Admin Journey

1. **Login**: Admin logs in with Discord
2. **Home**: Admin sees "Admin Portal" button (only visible to admins)
3. **Admin Portal**: View all submissions with details
4. **Actions**: Accept or Deny submissions
5. **Auto-Role**: Accepted users automatically get Discord role (if in server)

## 🐛 Troubleshooting

### Authentication Issues

**Problem**: "Authentication incomplete" error after login

**Solutions**:
- Check Supabase configuration in `.env`
- Verify Discord OAuth redirect URLs match
- Check browser console for errors
- Clear browser cache/cookies

### Discord Bot Not Assigning Roles

**Problem**: Role not assigned after approval

**Solutions**:
- Verify bot is running (`logs/discord_bot.log`)
- Check bot has "Manage Roles" permission
- Ensure bot role is higher than "Verified Staff" role in server hierarchy
- Verify user is actually in the Discord server
- Check `logs/api_server.log` for error messages

### Backend Connection Issues

**Problem**: Frontend can't connect to backend

**Solutions**:
- Verify `REACT_APP_BACKEND_URL` in frontend `.env`
- Check API server is running on correct port
- Look at `logs/api_server.log` for errors
- Verify CORS configuration allows your frontend URL

## 📝 Data Persistence

Currently, submissions are saved to `backend/submissions_data.json`. This is suitable for development but not recommended for production.

### Production Recommendations

1. **Use a Database**: MongoDB, PostgreSQL, or similar
2. **Update `api_server.py`**: Replace file-based storage with database operations
3. **Add Database Connection**: Update `.env` with database URL

## 🔄 Deployment

### Frontend (e.g., Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `build` folder to your hosting service

3. Update environment variables on hosting platform

### Backend (e.g., Heroku/Railway)

1. Create a `Procfile`:
```
web: cd backend && uvicorn api_server:app --host 0.0.0.0 --port $PORT
worker: cd backend && python discord_bot.py
```

2. Deploy to platform with environment variables

3. Ensure both web and worker processes are running

## 📚 API Documentation

Once the server is running, visit:
- API Docs: `http://localhost:5000/docs`
- Alternative Docs: `http://localhost:5000/redoc`

## 🔍 Monitoring

### View Logs

```bash
# All logs
tail -f logs/*.log

# Specific service
tail -f logs/api_server.log
tail -f logs/discord_bot.log
tail -f logs/frontend.log
```

### Check Service Status

```bash
# Check if services are running
lsof -i :3000  # Frontend
lsof -i :5000  # API Server
lsof -i :8003  # Discord Bot
```

## 🆘 Support

For issues or questions:
1. Check logs in `logs/` directory
2. Review error messages in browser console
3. Verify all environment variables are set correctly
4. Ensure all services are running

## 📄 License

This project is for VOID Esports organization.

---

**Version**: 2.1  
**Last Updated**: 2024
