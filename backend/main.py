"""
FastAPI Backend Application for Squirrel Sums Game

This module uses FastAPI's built-in Pydantic validation for request/response models.
Pydantic ensures that all incoming and outgoing data matches defined schemas, providing automatic validation and serialization.

Dependencies:
    - FastAPI: Web framework for building APIs
    - Firebase Admin: Authentication and database operations
    - Pydantic: Data validation (built into FastAPI)

GET Endpoints:
    - /ping:                    Ping for testing
    - /users/type/{userId}:     User type (admin, student, etc)   
    - /users/nextGame:          Next game_config for user in token

POST Endpoints:
    - /game_configs/:           Post new game_configs (admin only)
    - /users/login_or_register/ Confirm login or create user account 
    - /game_logs:               Post a log of a completed game

"""

from fastapi import FastAPI, HTTPException, Depends, Request  # Core FastAPI components
from fastapi.middleware.cors import CORSMiddleware  # Handle CORS policies
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials  # Auth handlingNonRelativeModuleNameResolutionCach
from firebase_admin import auth, firestore  # Firebase authentication and Firestore
from models import GameConfig, GameLog  # Pydantic models
from firebase import db  # Firebase database instance
import uuid
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Database Collection Names
USERS_DB_NAME = "users"  # Collection for user data
GAMECONFIG_DB_NAME = "game_config"  # Collection for game configurations
GAMELOG_DB_NAME = "game_logs"  # Collection for game activity logs

# API Error Messages
ERROR_INVALID_TOKEN = "Invalid token"
ERROR_USER_NOT_FOUND = "User {} not found in database"
ERROR_ADMIN_ONLY = "Only admin can create game configs"
ERROR_INVALID_LOG = "Cannot log for another user"
ERROR_GAME_NOT_FOUND = "Game config not found"
ERROR_NO_NEXT_GAME = "No next game available"

# API Success Messages
SUCCESS_GAME_CREATED = "Game config created {}"
SUCCESS_PING = "Hello from fastapi backend"

# API Endpoint Paths
PATH_PING = "/ping"  # Health check endpoint
PATH_USER_TYPE = "/users/type/{user_id}"  # User type retrieval
PATH_GAME_CONFIGS = "/game_configs/"  # Game configuration management
PATH_GAME_LOGS = "/game_logs"  # Game activity logging
PATH_NEXT_GAME = "/users/nextGame"  # Next game retrieval
PATH_LOGIN_OR_REGISTER_USER = "/users/login_or_register" # User registration for blank user in db

# Initialize FastAPI and Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
security = HTTPBearer()

# CORS MIDDLEWARE FOR TESTING
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# verification of firebase token
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail=ERROR_INVALID_TOKEN)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

######################################## GET ENDPOINTS ########################################


# GET: ping for testing
@app.get(PATH_PING)
async def ping():

    return SUCCESS_PING



# GET: user account type
@app.get(PATH_USER_TYPE)
@limiter.limit("20/minute")
async def get_user_type(request: Request, token: dict = Depends(verify_token)):
    user_id = token.get('uid')
    user_doc = db.collection(USERS_DB_NAME).document(user_id).get()
    if not user_doc.exists:
        raise HTTPException(
            status_code=404, 
            detail=ERROR_USER_NOT_FOUND.format(user_id, None, None)
        )

    return {user_doc.to_dict().get("userType")}



# GET: the next suggested game for the user userId
@app.get(PATH_NEXT_GAME)
@limiter.limit("20/minute")
async def get_next_game(request: Request, token: dict = Depends(verify_token)):
    user_id = token.get('uid')
    user_ref = db.collection(USERS_DB_NAME).document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(
            status_code=404, 
            detail=ERROR_USER_NOT_FOUND.format(user_id, None, None)
        )
    # CURRENT RECOMMENDER: Query latest config by timestamp
    config_query = (db.collection(GAMECONFIG_DB_NAME)
                   .order_by("createdAt", direction=firestore.Query.DESCENDING)
                   .limit(1))
    
    config_docs = config_query.stream()
    config_doc = next(config_docs, None)
    if not config_doc:
        raise HTTPException(status_code=404, detail=ERROR_GAME_NOT_FOUND)

    return config_doc.to_dict()

########################################## POST ENDPOINTS ##########################################


# POST: game config (admin only)
@app.post(PATH_GAME_CONFIGS)
@limiter.limit("5/minute")
async def create_game_config(request: Request, config: GameConfig, token: dict = Depends(verify_token)):
    user_id = token["uid"]
    user_ref = db.collection(USERS_DB_NAME).document(user_id)
    config.createdBy = user_id # who created config determined at backend not FE
    # Create Firestore transaction
    transaction = db.transaction()
    # Create function to be passed to Firestore transaction
    @firestore.transactional
    def create_config_transaction(transaction, user_ref):
        user_doc = user_ref.get(transaction=transaction)
        if not user_doc.exists or user_doc.to_dict().get("userType") != "admin":
            raise HTTPException(status_code=403, detail=ERROR_ADMIN_ONLY)
            
        new_config_ref = db.collection(GAMECONFIG_DB_NAME).document()
        config_dict = config.dict()
        config_dict["gameConfigId"] = new_config_ref.id
        transaction.set(new_config_ref, config_dict)
        return config_dict["gameConfigId"]
    # Run transaction and return game config ID 
    game_config_id = create_config_transaction(transaction, user_ref)

    return {"message": SUCCESS_GAME_CREATED.format(game_config_id)}



# POST: a new user, with values initialized to default
@app.post(PATH_LOGIN_OR_REGISTER_USER)
async def login_or_register_user(request: Request, token: dict = Depends(verify_token)):
    user_id = token["uid"]
    user_ref = db.collection(USERS_DB_NAME).document(user_id)
    # Create Firestore transaction
    transaction = db.transaction()
    # Create function to be passed to Firestore transaction
    @firestore.transactional
    def create_user_transaction(transaction, user_ref):
        user_doc = user_ref.get(transaction=transaction)
        if not user_doc.exists:
            default_user = {
                "userType": "student",
                "level": 1,
                "xp": 0,
                "isBanned": False,
                "hasCompletedTutorial": False,
                "hasUnlockedArena": False,
                "createdAt": firestore.SERVER_TIMESTAMP
            }
            transaction.set(user_ref, default_user)
            return {"created": True, "data": default_user}
        return {"created": False, "data": user_doc.to_dict()}
    # Run transaction and return user data 
    # TODO: add logging based on the returned values, was getting errors w it
    create_user_transaction(transaction, user_ref)

    return {
        "message": "Login or register handled" 
    }

# POST: log of a game's result
@app.post(PATH_GAME_LOGS)
@limiter.limit("5/minute")
async def log_game(request: Request, log: GameLog, token: dict = Depends(verify_token)):
    user_id = token["uid"]
    # Ensure that the log is for the user making the request
    if log.userId != user_id:
        raise HTTPException(status_code=403, detail=ERROR_INVALID_LOG)
    # Create Firestore transaction
    transaction = db.transaction()
    # Create function to be passed to Firestore transaction 
    @firestore.transactional
    def log_game_transaction(transaction, log):
        game_log_ref = db.collection(GAMELOG_DB_NAME).document()
        transaction.set(game_log_ref, log.dict())
        return game_log_ref.id
    # Run transaction and return log ID 
    game_log_id = log_game_transaction(transaction, log)

    return {"message": "Game log added", "logId": game_log_id}
