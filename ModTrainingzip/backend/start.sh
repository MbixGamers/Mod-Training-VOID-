#!/bin/bash
# Unified startup script for Render.com deployment
# This script starts both the Discord bot and the API server

set -e  # Exit on error

echo "🚀 Starting VOID Mod Training Backend Services..."

# Load environment variables (ignoring comments and empty lines)
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env"
    set -a  # automatically export all variables
    source <(grep -v '^#' .env | grep -v '^$' | sed 's/\r$//')
    set +a  # stop automatically exporting
fi

# Check required environment variables
if [ -z "$DISCORD_BOT_TOKEN" ]; then
    echo "⚠️  WARNING: DISCORD_BOT_TOKEN not set"
fi

if [ -z "$DISCORD_SERVER_ID" ]; then
    echo "⚠️  WARNING: DISCORD_SERVER_ID not set"
fi

# Start Discord bot in background
echo "🤖 Starting Discord bot on port 8003..."
python3 discord_bot.py &
BOT_PID=$!
echo "Bot started with PID: $BOT_PID"

# Give bot a moment to initialize
sleep 3

# Start API server on port specified by Render (or 10000)
PORT=${PORT:-10000}
echo "🌐 Starting API server on port $PORT..."
python3 api_server.py

# This will only execute if api_server stops
echo "⚠️  API server stopped, killing bot..."
kill $BOT_PID 2>/dev/null || true
