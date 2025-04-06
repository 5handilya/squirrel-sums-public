# Squirrel Sums Frontend 
A frontend that uses visualization to help children grok addition. The design is intended to be modular and reusable for other projects.
## Tech Stack
- TypeScript: Strong typing and better IDE support
- Vue.js: Progressive JavaScript framework
- Pinia: State management solution
- Firebase: Backend as a Service
- Tailwind CSS: Utility-first CSS framework
## Login.vue
- Entry point to application for those not logged in
- Handles Google OAuth authentication
- Stores user data in pinia and local storage
#### Authentication Flow
- User selects Google account
- loginWithGoogle function from authServices.ts used
- Firebase returns credentials (this token is later embedded in all backend calls)
- Page retrieves user ID from firebase - same used as key for firestore DB
#### Data Storage
1. Local Storage
    - Used for persistence
    - Key: 'userStore'
    - stores user Id separately as well 
1. Pinia Store (userStore.ts)
    - Active user session data
    - Most impportant fields :
        - userId
        - userType
#### Post-Login Actions
1. Check if new user
2. Initialize progress data
3. Redirect to Home page
#### Misc
- Auth state persists across sessions
- Route guards prevent unauthorized access to non-login pages and only admins can access Builder.vue
---
## Home.vue
Upon login, show:
1. **Assigned / Curated Sums or a single “start” button**
2. Builder button - only for userType = admin (hidden for students)
3. Signin status and logout button
#### Fetches nextGameConfig from backend, gives userId
At the moment, the backend is set to return the latest gameConfig. This can be replaced by:
- Teacher-decided config sets for students
- Automatic leveling using ML and user fields like XP, game config fields like indicated difficulty
#### 
---
## Game.vue
This is the main game view. It has a see-saw visualization to help students gauge how addition changes quantities.
#### Key Design Decisions
##### Programmatically Generating Questions
###### Config Parameters
- minSum: smallest possible answer
- maxSum: largest possible answer
- numQuestions: total questions to generate
- numOfAddends: number of input fields (2-4)
###### Question Generation
- Create empty questions array
- For each question (n = numQuestions):
    - Generate random target between minSum and maxSum
    - Create question object with target as answer
    - Set solved and correct flags to false
    - Push to questions array
###### Drag Option Generation
When question loads:
- Get current question's answer as target
- Generate num1 randomly between 1 and (target-1)
- Calculate num2 as (target - num1)
- Generate num3 randomly between minSum and maxSum
- Shuffle these three numbers
- Store in dragOptions array
	
```typescript
generateDragOptions() {
  const target = this.currentAnswer;
  const num1 = Math.floor(Math.random() * (target - 1)) + 1;
  const num2 = target - num1;
  const num3 = Math.floor(Math.random() * (this.maxSum - this.minSum)) + this.minSum;
  this.dragOptions = [num1, num2, num3];
  //shuffle drag options
  this.dragOptions.sort(() => Math.random() - 0.5);
  console.log('Generated options:', this.dragOptions);
}
```
- Always one valid solution
- Options shuffled after generation
- Third number adds complexity
- Options regenerated each question
##### Random Squirrel Image Selection:
1. **Asset Setup**
- 4 unique squirrel PNGs in assets folder
2. **RHS (Answer Side) Logic**
```typescript
data() {
  return {
    squirrelImages: [
      '/src/assets/squirrel1.png',
      '/src/assets/squirrel2.png',
      '/src/assets/squirrel3.png',
      '/src/assets/squirrel4.png'
    ],
    fixedRightSequence: [],
    rightShapes: []
  }
data() {
  return {
    squirrelImages: [
      '/src/assets/squirrel1.png',
      '/src/assets/squirrel2.png',
      '/src/assets/squirrel3.png',
      '/src/assets/squirrel4.png'
    ],
    fixedRightSequence: [], // Stores 4 random squirrels
    rightShapes: []  // References fixedRightSequence
  }
}

//for generation
    this.fixedRightSequence = Array(this.questions[0].answer).fill(null).map(() => 
    this.squirrelImages[Math.floor(Math.random() * 4)]);
```

3. **LHS (Input Side) Logic**
```typescript
  // Calculate new shapes array for LHS
    const newLeftShapes = [];
    for (let i = 0; i < sum; i++) {
      const row = Math.floor(i / 8);
      const posInRow = i % 8;
      //this arranges squirrels with a max width on the LHS and gives them the appearance of stacking over one another on overflow (also is set: flex overflow)
      //extend to RHS too if planning on higher maxsums
      newLeftShapes.push({
        image: this.squirrelImages[Math.floor(Math.random() * this.squirrelImages.length)],
        style: {
          transform: `translate(${posInRow * 60}px, ${-row * 60}px)`,
          zIndex: row,
          position: 'absolute'
        }
      });
    }
```

##### Drag and Drop System
I was earlier only using text input for numbers, but chose to implement drag-and-drop in addition to typing because:
- More engaging for young students
- Reduces input errors
- Works well on touch devices
- Provides immediate visual feedback
The draggable options are guaranteed to have at least one correct combination (see below). 
I also explored pre-filling certain options for students with a number randomly chosen from between minSum and maxSum (non-inclusive) - but empty + draggable options seems the right amount of challenging.
##### Visual Feedback
- See-saw tilts based on sum difference (using GSAP for animation)
- Squirrel images provide kid-friendly interface
- Immediate response to drag-drop actions (HTM5 drag and drop)
##### State Management
I track:
- User and Game ID
- Current inputs
- Generated questions and their state
- Draggable options
- Visual state (rotation, shapes)
- Time elapsed
- Game progress (answered/numQuestions)
#### Game Component Layout: Sections
1. Header
2. Visualizer
3. Control Board
---
### Builder.vue
This is a simple single-page form with these main parts:
- Auth guard (admin only)
- Live validation (dialog + built into inputs)
- Clear feedback
- Unsaved changes warning
- Success/error dialogs
#### Form Structure
- Went with 3-section layout: game params , visualization options, misc settings
- Validation happens live with feedback - no server roundtrip needed
- Form state tracked via hasChanges computed prop. 
- Success/fail dialogs
#### Data Flow
Config builds up as user types -> validates on change -> clicks submit -> posts to API -> shows result -> either resets or redirects. Uses userStore for admin check and creator ID. All configs get timestamped at creation.
#### UX Considerations
- Added unsaved changes dialog to prevent accidental navigation
- Form remembers state if dialog canceled
- Validation messages appear inline near relevant fields.
- Submit button shows current state (enabled/disabled + appropriate text)
---
### State Management
I used both Pinia and local storage: try from pinia first, then from local if available (& rewrite to pinia if its wiped) because pinia is reactive and bound components can be updated more easily - and also because it is stored in RAM. I hear it is also better than Vuex at typescript support
#### Pinia Stores
- UserStore: Handles auth state + user details
- CurrentGameConfig: Manages active game settings
#### UserStore Details
- State tracks: userId, email, displayName, userType (enum), level, xp, flags (banned, tutorial, arena)
- Getters and setters for individual fields + full localStorage sync
- Storage key constant to prevent typos
#### CurrentGameConfigStore Details
- State matches Firebase schema: gameConfigId, ranges (min/max), settings (visualizer, hints), metadata (creator, timestamps), social (thumbs, flags)
- Actions: setGameConfig for full updates, loadFromLocalStorage for persistence 
#### Persistence Strategy
- Both stores sync to localStorage. UserStore: On every state change via watch. CurrentGameConfig: Only on explicit setGameConfig calls
- Recovery: Stores try localStorage first, then API
#### Usage Pattern
- Components inject stores using useStore()
- Reactive updates propagate automatically
- Builder.vue uses admin check from UserStore
- Game.vue pulls config from CurrentGameConfigStore
- Home.vue uses both for navigation
#### Type Safety
- Interface GameConfig ensures API/store alignment
- UserType enum prevents invalid roles. All state fields typed for IDE support
---
### Authentication Flow
User signs in -> Google OAuth -> Firebase auth -> Get user data from Firestore -> Store in Pinia + localStorage -> Token for API calls
#### authService.ts
- loginWithGoogle: Main auth flow. 
- createUserIfNotExists: First-time user setup, initialize as student
- fetchUserData: Gets Firestore profile
- logout: Cleans local state (pinia and local)
- loadPiniaFromLocalStorage: Recovery after refresh.
#### firebaseConfig.ts
Central Firebase setup. Handles app init, auth persistence, state changes. Exports auth instance + token getter. Persistence set to local for session survival. Auth state observer updates user data automatically.
#### Auth & User Data Flow
1. User clicks login -> Firebase popup -> Google OAuth
2. Success -> Check Firestore for user
3. If new: Create default profile
4. If existing: Load profile data
5. Save to Pinia store + localStorage
6. Setup auth state listener
7. Use token for future API calls
#### Features
- Local persistence for session management
- Auth state change monitoring
- Error handling for network/auth issues
- Automatic token generation for API calls