#!/bin/bash

# VOID Mod Training Portal - Server Stop Script
# This script stops all running services

echo "==================================="
echo "VOID Mod Training Portal"
echo "Stopping all services..."
echo "==================================="

cd "$(dirname "$0")"

# Function to stop a process
stop_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            echo "Stopping $service_name (PID: $pid)..."
            kill $pid
            sleep 1
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                echo "Force stopping $service_name..."
                kill -9 $pid
            fi
            echo "✓ $service_name stopped"
        else
            echo "✓ $service_name was not running"
        fi
        rm "$pid_file"
    else
        echo "No PID file found for $service_name"
    fi
}

# Stop all services
stop_process "logs/discord_bot.pid" "Discord Bot"
stop_process "logs/api_server.pid" "API Server"
stop_process "logs/frontend.pid" "Frontend Server"

echo ""
echo "All services stopped!"
echo ""
