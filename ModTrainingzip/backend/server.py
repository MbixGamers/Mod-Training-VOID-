from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import os

# Create the FastAPI app
app = FastAPI(title="Mod Training VOID API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5000",
        "https://mod-training-void.onrender.com",
        "https://mod-training-void-backend-cbpz.onrender.com"
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

# In-memory storage (replace with database in production)
submissions_db: List[dict] = []

# Admin user IDs
ADMIN_USER_IDS = ["394600108846350346", "928635423465537579"]

@app.get("/")
async def read_root():
    return {
        "message": "Mod Training VOID API",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/submissions")
async def get_submissions():
    """Get all submissions for admin review"""
    return submissions_db

@app.post("/api/submissions")
async def create_submission(submission: TestSubmissionCreate):
    """Create a new test submission"""
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
        
        return {
            "message": "Submission received successfully",
            "submission": new_submission
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/action")
async def admin_action(action_data: AdminAction):
    """Handle admin actions (accept/deny) on submissions"""
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
        
        return {
            "message": f"Submission {action_data.action} successfully",
            "submission": submission
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)