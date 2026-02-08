"""
Unified Backend Server for Mod Training VOID
Handles test submissions, admin actions, Discord webhook notifications, and bot role assignment
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import os
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI(title="Mod Training VOID API", version="2.0.0")

# Environment variables
DISCORD_WEBHOOK_URL = os.environ.get('DISCORD_WEBHOOK_URL', 'https://discord.com/api/webhooks/1469965044178747464/tsd8g35ohlBhmaQci6lou-ieZ9EoXZhqSuh-aZ8yyu-j2mfsQymdvPUzV84_bQu9KYBG')
DISCORD_BOT_URL = os.environ.get('DISCORD_BOT_URL', 'http://localhost:8003')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://mod-training-void.onrender.com')

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5000",
        "https://mod-training-void.onrender.com",
        "https://mod-training-void-backend-cbpz.onrender.com",
        "*"  # For development, restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class TestAnswer(BaseModel):
    question_number: int
    question: str
    user_answer: str
    is_correct: bool

class TestSubmissionCreate(BaseModel):
    user_id: str
    user_email: str
    username: str
    answers: List[TestAnswer]
    score: float
    passed: bool

class TestSubmission(BaseModel):
    id: str
    user_id: str
    user_email: str
    username: str
    answers: List[TestAnswer]
    score: float
    passed: bool
    status: str
    created_at: str
    updated_at: str

class AdminAction(BaseModel):
    submission_id: str
    action: str  # "accepted" or "denied"

class WebhookInteraction(BaseModel):
    """Discord webhook interaction (button click)"""
    submission_id: str
    action: str
    admin_user_id: Optional[str] = None

# In-memory storage (replace with database in production)
submissions_db: List[dict] = []

# Admin user IDs
ADMIN_USER_IDS = ["394600108846350346", "928635423465537579"]

@app.get("/")
async def read_root():
    return {
        "message": "Mod Training VOID API v2.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "health": "/health",
            "submissions": "/api/submissions",
            "admin_action": "/api/admin/action",
            "webhook_action": "/api/webhook/action"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "discord_webhook_configured": bool(DISCORD_WEBHOOK_URL),
        "discord_bot_url": DISCORD_BOT_URL
    }

@app.get("/api/submissions")
async def get_submissions():
    """Get all submissions for admin review"""
    return submissions_db

async def send_discord_webhook(submission: dict):
    """Send notification to Discord with approve/deny buttons"""
    try:
        # Create embed for Discord
        embed = {
            "title": "🎯 New Mod Training Submission",
            "color": 0x7C3AED if submission['passed'] else 0xEF4444,
            "fields": [
                {"name": "Username", "value": submission['username'], "inline": True},
                {"name": "Score", "value": f"{submission['score']:.1f}%", "inline": True},
                {"name": "Status", "value": "✅ PASSED" if submission['passed'] else "❌ FAILED", "inline": True},
                {"name": "User ID", "value": submission['user_id'], "inline": False},
                {"name": "Email", "value": submission['user_email'], "inline": False},
                {"name": "Submitted", "value": f"<t:{int(datetime.fromisoformat(submission['created_at']).timestamp())}:R>", "inline": False}
            ],
            "footer": {"text": f"Submission ID: {submission['id']}"},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Create action buttons
        components = [
            {
                "type": 1,
                "components": [
                    {
                        "type": 2,
                        "style": 3,  # Green button
                        "label": "✅ Approve",
                        "custom_id": f"approve_{submission['id']}"
                    },
                    {
                        "type": 2,
                        "style": 4,  # Red button
                        "label": "❌ Deny",
                        "custom_id": f"deny_{submission['id']}"
                    },
                    {
                        "type": 2,
                        "style": 5,  # Link button
                        "label": "View Admin Panel",
                        "url": f"{FRONTEND_URL}/admin"
                    }
                ]
            }
        ]
        
        payload = {
            "embeds": [embed],
            "components": components
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(DISCORD_WEBHOOK_URL, json=payload, timeout=10.0)
            
            if response.status_code in [200, 204]:
                logger.info(f"Discord webhook sent successfully for submission {submission['id']}")
            else:
                logger.error(f"Discord webhook failed: {response.status_code} - {response.text}")
                
    except Exception as e:
        logger.error(f"Error sending Discord webhook: {str(e)}", exc_info=True)

async def assign_discord_role(user_id: str) -> dict:
    """Assign role to Discord user via bot API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{DISCORD_BOT_URL}/api/assign-role",
                json={"user_id": user_id, "role_name": "Verified Staff"},
                timeout=15.0
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Role assigned successfully to user {user_id}")
                return {"success": True, "data": data}
            else:
                error_data = response.json()
                logger.error(f"Role assignment failed: {response.status_code} - {error_data}")
                return {"success": False, "error": error_data}
                
    except Exception as e:
        logger.error(f"Error assigning role: {str(e)}", exc_info=True)
        return {"success": False, "error": str(e)}

@app.post("/api/submissions")
async def create_submission(submission: TestSubmissionCreate, background_tasks: BackgroundTasks):
    """Create a new test submission and send Discord notification"""
    try:
        new_submission = {
            "id": str(uuid.uuid4()),
            "user_id": submission.user_id,
            "user_email": submission.user_email,
            "username": submission.username,
            "answers": [answer.dict() for answer in submission.answers],
            "score": submission.score,
            "passed": submission.passed,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        submissions_db.append(new_submission)
        
        # Send Discord webhook notification in background
        background_tasks.add_task(send_discord_webhook, new_submission)
        
        return {
            "message": "Submission received successfully",
            "submission": new_submission
        }
    except Exception as e:
        logger.error(f"Error creating submission: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/action")
async def admin_action(action_data: AdminAction, background_tasks: BackgroundTasks):
    """Handle admin actions (accept/deny) on submissions from admin panel"""
    try:
        if action_data.action not in ["accepted", "denied"]:
            raise HTTPException(
                status_code=400,
                detail='Action must be either "accepted" or "denied"'
            )
        
        # Find and update submission
        submission = None
        for sub in submissions_db:
            if sub["id"] == action_data.submission_id:
                submission = sub
                break
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Update submission status
        submission["status"] = action_data.action
        submission["updated_at"] = datetime.utcnow().isoformat()
        
        # If accepted, assign Discord role in background
        if action_data.action == "accepted":
            background_tasks.add_task(assign_discord_role, submission["user_id"])
        
        return {
            "message": f"Submission {action_data.action} successfully",
            "submission": submission
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling admin action: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/webhook/action")
async def webhook_action(interaction: WebhookInteraction, background_tasks: BackgroundTasks):
    """Handle Discord webhook button interactions (approve/deny from Discord)"""
    try:
        # Find submission
        submission = None
        for sub in submissions_db:
            if sub["id"] == interaction.submission_id:
                submission = sub
                break
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Update submission status
        action_status = "accepted" if interaction.action == "approve" else "denied"
        submission["status"] = action_status
        submission["updated_at"] = datetime.utcnow().isoformat()
        
        # If approved, assign Discord role in background
        if interaction.action == "approve":
            background_tasks.add_task(assign_discord_role, submission["user_id"])
        
        logger.info(f"Webhook action '{interaction.action}' processed for submission {interaction.submission_id}")
        
        return {
            "message": f"Submission {action_status} via webhook",
            "submission": submission
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling webhook action: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
