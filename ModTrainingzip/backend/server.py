from fastapi import FastAPI, Depends
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import RedirectResponse
import os

# Create the FastAPI app
app = FastAPI()

# Allow all origins (Change this in production)
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

# Discord OAuth2 settings
discord_client_id = os.getenv("DISCORD_CLIENT_ID")
discord_client_secret = os.getenv("DISCORD_CLIENT_SECRET")
discord_redirect_uri = os.getenv("DISCORD_REDIRECT_URI")

oauth2_scheme = OAuth2AuthorizationCodeBearer(authorizationUrl="https://discord.com/api/oauth2/authorize", tokenUrl="https://discord.com/api/oauth2/token")

# Example admin user ID
ADMIN_USER_ID = "928635423465537579"

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/login")
def login():
    redirect_uri = f"{discord_redirect_uri}?response_type=code&client_id={discord_client_id}&scope=identify&redirect_uri={discord_redirect_uri}"
    return RedirectResponse(url=redirect_uri)

@app.get("/auth/discord")
async def auth_discord(request: Request, code: str):
    # Handle the OAuth2 flow and get user information
    # Implement token exchange and user retrieval logic here
    return {"code": code} 

@app.get("/admin")
async def admin(user_id: str = Depends(oauth2_scheme)):
    if user_id != ADMIN_USER_ID:
        return {"error": "Unauthorized"}
    return {"message": "Welcome Admin!"}