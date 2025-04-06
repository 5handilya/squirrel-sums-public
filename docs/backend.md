## Backend (FastAPI)
Dockerized backend that handles user management, game configurations, and logging game results

### 1. API Endpoints

#### Health Check
- `GET /ping`
  - Purpose: System health verification (no auth required)
  - Response: Simple confirmation message

#### User Management
- `GET /users/type/{user_id}`
  - Purpose: Retrieve user account type (authentication required)
  - Response: User type (admin/student)
  - Used for checking whether user is allowed into Builder.vue (Activity Builder)

#### Game Configuration
- `POST /game_configs/`
  - Purpose: Create new game configurations
  - Authentication: Required (admin only)
  - Validation: Automatic via Pydantic models
  - Auto-generates unique gameConfigId & adds it to config sent to firebase

#### Game Logging
- `POST /game_logs`
  - Purpose: Log completed game results
  - Authentication: Required (user/admin)
  - Validation: Ensures user can only log their own games
  - Stores: 
    - gameLogTimestamp: When the game was completed
    - gameConfigId: ID of the game configuration used
    - userId: Player's unique identifier
    - numQuestions: Total questions in game
    - numAttempted: Questions attempted by player
    - numCorrect: Correctly answered questions
    - timeElapsed: Total time taken (in seconds)

#### Game Progression
- `GET /users/nextGame`
  - Purpose: Fetch next appropriate game configuration (fetched from Home.vue)
  - Authentication: Required (user/admin)
  - Logic: Returns latest game config by timestamp (for now, we can make a better recommendation algorithm or an educator-designed series of gameconfigs later)

### 2. Security Checks

#### Authentication Layer
- Firebase Authentication integration
- JWT token verification on all protected routes
- Token validation middleware using HTTPBearer

#### Authorization Controls
- User type verification for admin actions
- User ID matching for personal data access (can't post logs for other users, pull userType of other users)
- Route-specific permission checks

#### Data Validation
- Pydantic models for request/response validation
- Automatic schema enforcement
- Type checking and data sanitization

### 3. Misc Development Notes

Major Design Decisions:
- * CORS middleware enabled for development
- What ID to use for gamelogs and gameconfigs?
    - uuidv4 or inbuilt ids given by firestore? -> decided on inbuilt ids because theyre being built anyway, just need an extra call to pull from ref.id and store it inside the doc
- Further development:
    - Rate limit POSTs
    - Check game config POSTs for duplicates
    - User leveling:
        - ML recommendations
        - User XP as input
        - Thumbs Ups & Downs from client
        - Reporting of questions