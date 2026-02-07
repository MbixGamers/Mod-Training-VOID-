#!/bin/bash

# VOID Mod Training Portal - Server Startup Script
# This script starts all required services for the application

echo "==================================="
echo "VOID Mod Training Portal"
echo "Starting all services..."
echo "==================================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "Port $1 is already in use!"
        return 1
    fi
    return 0
}

# Change to backend directory
cd "$(dirname "$0")/backend"

# Check if required environment variables are set
if [ -z "$DISCORD_BOT_TOKEN" ]; then
    echo "⚠️  WARNING: DISCORD_BOT_TOKEN not set"
fi

if [ -z "$DISCORD_SERVER_ID" ]; then
    echo "⚠️  WARNING: DISCORD_SERVER_ID not set"
fi

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt

# Start Discord Bot (port 8003)
echo ""
echo "Starting Discord Bot on port 8003..."
check_port 8003
if [ $? -eq 0 ]; then
    python discord_bot.py > ../logs/discord_bot.log 2>&1 &
    DISCORD_BOT_PID=$!
    echo "✓ Discord Bot started (PID: $DISCORD_BOT_PID)"
else
    echo "✗ Failed to start Discord Bot - port already in use"
fi

# Wait a moment for bot to initialize
sleep 2

# Start API Server (port 5000)
echo ""
echo "Starting API Server on port 5000..."
check_port 5000
if [ $? -eq 0 ]; then
    python api_server.py > ../logs/api_server.log 2>&1 &
    API_SERVER_PID=$!
    echo "✓ API Server started (PID: $API_SERVER_PID)"
else
    echo "✗ Failed to start API Server - port already in use"
fi

# Change to frontend directory
cd ../frontend

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing frontend dependencies..."
    npm install
fi

# Start Frontend Development Server (port 3000)
echo ""
echo "Starting Frontend Development Server on port 3000..."
check_port 3000
if [ $? -eq 0 ]; then
    npm start > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "✓ Frontend Server started (PID: $FRONTEND_PID)"
else
    echo "✗ Failed to start Frontend Server - port already in use"
fi

# Create logs directory if it doesn't exist
cd ..
mkdir -p logs

# Save PIDs to file for easy stopping
echo $DISCORD_BOT_PID > logs/discord_bot.pid
echo $API_SERVER_PID > logs/api_server.pid
echo $FRONTEND_PID > logs/frontend.pid

echo ""
echo "==================================="
echo "All services started!"
echo "==================================="
echo ""
echo "Services:"
echo "  • Discord Bot:  http://localhost:8003"
echo "  • API Server:   http://localhost:5000"
echo "  • Frontend:     http://localhost:3000"
echo ""
echo "Process IDs saved to logs/*.pid"
echo "Logs saved to logs/*.log"
echo ""
echo "To stop all services, run: ./stop_servers.sh"
echo "To view logs, run: tail -f logs/*.log"
echo ""
