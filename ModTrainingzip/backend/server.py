from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# In-memory storage for demonstration if MongoDB URL is missing
submissions_db = []

# Models
class TestAnswer(BaseModel):
    question_number: int
    question: str
    user_answer: str
    is_correct: bool

class TestSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    username: str
    answers: List[TestAnswer]
    score: float
    passed: bool
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"  # pending, accepted, denied

class TestSubmissionCreate(BaseModel):
    user_id: str
    user_email: str
    username: str
    answers: List[TestAnswer]
    score: float
    passed: bool

class AdminAction(BaseModel):
    submission_id: str
    action: str  # accept or deny

# Routes
@api_router.get("/")
async def root():
    return {"message": "Void Training Portal API"}

@api_router.post("/submissions", response_model=TestSubmission)
async def create_submission(input: TestSubmissionCreate):
    submission = TestSubmission(**input.model_dump())
    submissions_db.append(submission)
    return submission

@api_router.get("/submissions", response_model=List[TestSubmission])
async def get_all_submissions():
    return sorted(submissions_db, key=lambda x: x.submitted_at, reverse=True)

@api_router.get("/submissions/user/{user_id}", response_model=List[TestSubmission])
async def get_user_submissions(user_id: str):
    user_subs = [s for s in submissions_db if s.user_id == user_id]
    return sorted(user_subs, key=lambda x: x.submitted_at, reverse=True)

@api_router.post("/admin/action")
async def admin_action(action: AdminAction):
    for sub in submissions_db:
        if sub.id == action.submission_id:
            sub.status = action.action
            return {"message": "Action completed", "submission": sub}
    
    raise HTTPException(status_code=404, detail="Submission not found")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
