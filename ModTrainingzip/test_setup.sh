#!/bin/bash
# Local testing script to verify all components

echo "🧪 Testing Mod Training VOID Components..."
echo ""

# Test 1: Check if .env exists
echo "1️⃣ Checking environment configuration..."
if [ -f "backend/.env" ]; then
    echo "✅ backend/.env found"
    if grep -q "DISCORD_BOT_TOKEN" backend/.env; then
        echo "✅ Bot token configured"
    else
        echo "❌ Bot token missing in .env"
    fi
else
    echo "❌ backend/.env not found"
fi
echo ""

# Test 2: Check Python dependencies
echo "2️⃣ Checking Python dependencies..."
cd backend
if python3 -c "import fastapi, discord, uvicorn, httpx" 2>/dev/null; then
    echo "✅ All Python packages installed"
else
    echo "⚠️  Some packages missing. Run: pip install -r requirements.txt"
fi
cd ..
echo ""

# Test 3: Check Node dependencies
echo "3️⃣ Checking Node dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo "✅ Node modules installed"
else
    echo "⚠️  Node modules not found. Run: cd frontend && npm install"
fi
echo ""

# Test 4: Check critical files
echo "4️⃣ Checking critical files..."
FILES=(
    "backend/unified_server.py"
    "backend/discord_bot.py"
    "backend/start_all.sh"
    "frontend/src/pages/Callback.js"
    "frontend/src/pages/Login.js"
    "frontend/src/pages/Test.js"
    "frontend/src/pages/Admin.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
    fi
done
echo ""

# Test 5: Syntax check
echo "5️⃣ Checking Python syntax..."
python3 -m py_compile backend/unified_server.py 2>/dev/null && echo "✅ unified_server.py syntax OK" || echo "❌ Syntax error in unified_server.py"
python3 -m py_compile backend/discord_bot.py 2>/dev/null && echo "✅ discord_bot.py syntax OK" || echo "❌ Syntax error in discord_bot.py"
echo ""

# Test 6: Check permissions
echo "6️⃣ Checking file permissions..."
if [ -x "backend/start_all.sh" ]; then
    echo "✅ start_all.sh is executable"
else
    echo "⚠️  start_all.sh not executable. Run: chmod +x backend/start_all.sh"
fi
echo ""

echo "🎯 Test Summary:"
echo "If all checks pass ✅, you're ready to deploy!"
echo "If any checks fail ❌, fix those issues first."
echo ""
echo "📚 Next steps:"
echo "1. Fix any failed checks above"
echo "2. Commit changes: git add . && git commit -m 'Complete fixes'"
echo "3. Push to GitHub: git push origin main"
echo "4. Follow RENDER_DEPLOYMENT_STEPS.md for deployment"
