from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

# Create FastAPI app
app = FastAPI(title="VOID Mod Training API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Admin user IDs (should match frontend)
ADMIN_USER_IDS = ['394600108846350346', '928635423465537579']

# Discord bot configuration
DISCORD_BOT_URL = os.getenv('DISCORD_BOT_URL', 'http://localhost:8003')
BOT_ROLE_ENDPOINT = f"{DISCORD_BOT_URL}/api/assign-role"

# Data Models
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

class TestSubmission(TestSubmissionCreate):
    id: str
    status: str  # pending, accepted, denied
    created_at: str
    updated_at: str

class AdminAction(BaseModel):
    submission_id: str
    action: str  # accepted or denied
    admin_user_id: Optional[str] = None

# In-memory database (replace with real DB in production)
submissions_db = []
submission_counter = 0

# Helper function to save data to file (persistence)
DATA_FILE = 'submissions_data.json'

def load_submissions():
    global submissions_db, submission_counter
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                submissions_db = data.get('submissions', [])
                submission_counter = data.get('counter', 0)
        except Exception as e:
            print(f"Error loading submissions: {e}")

def save_submissions():
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump({
                'submissions': submissions_db,
                'counter': submission_counter
            }, f, indent=2)
    except Exception as e:
        print(f"Error saving submissions: {e}")

# Load submissions on startup
load_submissions()

# API Routes

@app.get("/")
async def root():
    return {"message": "VOID Mod Training API", "status": "operational"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/submissions", response_model=TestSubmission)
async def create_submission(submission: TestSubmissionCreate):
    global submission_counter
    submission_counter += 1
    
    # Create new submission
    new_submission = TestSubmission(
        id=str(submission_counter),
        user_id=submission.user_id,
        user_email=submission.user_email,
        username=submission.username,
        answers=submission.answers,
        score=submission.score,
        passed=submission.passed,
        status="pending",
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat()
    )
    
    submissions_db.append(new_submission.dict())
    save_submissions()
    
    return new_submission

@app.get("/api/submissions", response_model=List[TestSubmission])
async def get_submissions(status: Optional[str] = None):
    """Get all submissions, optionally filtered by status"""
    if status:
        filtered = [s for s in submissions_db if s.get('status') == status]
        return filtered
    return submissions_db

@app.get("/api/submissions/{submission_id}", response_model=TestSubmission)
async def get_submission(submission_id: str):
    """Get a specific submission by ID"""
    for submission in submissions_db:
        if submission['id'] == submission_id:
            return submission
    raise HTTPException(status_code=404, detail="Submission not found")

@app.post("/api/admin/action")
async def admin_action(action: AdminAction):
    """Handle admin actions (accept/deny submissions)"""
    
    # Validate action
    if action.action not in ['accepted', 'denied']:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'accepted' or 'denied'")
    
    # Find submission
    submission = None
    submission_index = None
    for idx, sub in enumerate(submissions_db):
        if sub['id'] == action.submission_id:
            submission = sub
            submission_index = idx
            break
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Update submission status
    submission['status'] = action.action
    submission['updated_at'] = datetime.utcnow().isoformat()
    submissions_db[submission_index] = submission
    save_submissions()
    
    # If accepted and passed, assign Discord role
    if action.action == 'accepted' and submission.get('passed'):
        try:
            # Get Discord user ID from submission (if available)
            discord_user_id = submission.get('user_id')
            
            if discord_user_id:
                # Call Discord bot to assign role
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        BOT_ROLE_ENDPOINT,
                        json={
                            'user_id': discord_user_id,
                            'role_name': 'Verified Staff'
                        },
                        timeout=10.0
                    )
                    
                    if response.status_code == 200:
                        print(f"Successfully assigned role to user {discord_user_id}")
                    else:
                        print(f"Failed to assign role: {response.text}")
        except Exception as e:
            print(f"Error assigning Discord role: {e}")
            # Don't fail the whole operation if role assignment fails
    
    return {
        "success": True,
        "message": f"Submission {action.action}",
        "submission": submission
    }

@app.delete("/api/submissions/{submission_id}")
async def delete_submission(submission_id: str):
    """Delete a submission"""
    global submissions_db
    
    submission_index = None
    for idx, sub in enumerate(submissions_db):
        if sub['id'] == submission_id:
            submission_index = idx
            break
    
    if submission_index is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submissions_db.pop(submission_index)
    save_submissions()
    
    return {"success": True, "message": "Submission deleted"}

@app.get("/api/admin/stats")
async def get_admin_stats():
    """Get statistics for admin dashboard"""
    total = len(submissions_db)
    pending = len([s for s in submissions_db if s.get('status') == 'pending'])
    accepted = len([s for s in submissions_db if s.get('status') == 'accepted'])
    denied = len([s for s in submissions_db if s.get('status') == 'denied'])
    
    # Calculate pass rate
    total_with_status = accepted + denied
    pass_rate = (accepted / total_with_status * 100) if total_with_status > 0 else 0
    
    return {
        "total_submissions": total,
        "pending": pending,
        "accepted": accepted,
        "denied": denied,
        "pass_rate": round(pass_rate, 2)
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
