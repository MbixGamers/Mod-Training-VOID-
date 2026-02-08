#!/bin/bash
# Comprehensive startup script for Render deployment
# This script starts both the Discord bot and the FastAPI server

set -e  # Exit on error

echo "🚀 Starting Mod Training VOID Backend Services..."

# Start Discord bot in background
echo "🤖 Starting Discord bot..."
python discord_bot.py &
BOT_PID=$!
echo "Discord bot started with PID: $BOT_PID"

# Wait for bot to initialize
sleep 5

# Start FastAPI unified server
echo "🌐 Starting FastAPI server..."
PORT=${PORT:-8080}
exec uvicorn unified_server:app --host 0.0.0.0 --port $PORT --log-level info
