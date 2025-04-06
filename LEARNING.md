# Learning experience - Squirrel Sums

- This was the first web dev project I worked on, so it was mostly learn -> execute, instead of execute-from-memory for me. Just about a week ago, I knew very little about details like the pros and cons of Pinia vs. local storage - but now I have a working full-stack project. Let's go over the learning notes in brief (compressed and cleaned copy of the raw logs I maintained in obsidian)

## Basic Loop For This Project
1. Decide what I want based on specs, whiteboard and picture the flows to see if they make sense
2. Describe what I want to Copilot (Claude), ask it to explain, as a senior SWE, the involved technical aspects in brief without code first
3. Make it write scaffolding and ask it to explain syntax I don't understand 
4. If overwhelmed by info, watch a YouTube video on that topic
5. Be agile with refactoring and cleaning code as I learn
## Step 0: Whiteboarding
- I sketched the basic UI and data flow, imagined which pages should exist and what they should look like (based on the provided specs)
- I made notes of the basic data structures I would be using and their types, and had this on my whiteboard and in my project management notion for reference
- I decided that to the manage the project I'd break:
    - the backend into individual API calls
    - the frontend into individual pages, the router, and the individual data stores
## Step 1: Learning & Scaffolding
- I asked VSCode's copilot to create a frame for a game screen for me, then asked it questions till I understood what was happening - e.g. on the basics of Vue.js. I learned about the <template>, <script>, <styles> system, about how the firebase library interacts with web dev projects and how auth tokens are best stored
- I also had Deepseek open on the side for more rapid questions that didn't need code as context - quick questions like "Is pinia always in RAM?"
- A few times this became too much info to handle. At these times I stepped away from my computer, took a small break, then watched a youtube video on whatever stuck I was stuck on (e.g. Composition vs Options API) with deepseek open on the side for QnA
## Step 2: The Visualizer - Game.vue
- Tackling the Game (Game.vue) first of all after implementing rudimentary auth functions, I decided to get a basic animation going. 
- I decided to go with a see-saw instead of a weighing scale because I thought kids might relate more to a see-saw, be more likely to be using a see-saw than a weighing scale, and maybe when they were on one next time, they would think about addition.
- I knew that GSAP was a good library for animation, and asked Copilot to place a bar that rotated (within range min and max 40 degrees) based on the difference in LHS and RHS. I added input boxes and a hard-fixed the RHS for experimentation. This worked properly out of the gate, so all that remained was adding visual enhancements to make it look more like a see-saw.
- I had also added some dummy entries in the firebase users db for my own account - enough to get started
- I actually spent most of my time in Game.vue wrestling with the UI part. Since the layout tree was dense, it was difficult to simplify it, and it even gave rise to some bugs e.g. the feedback rectangle not appearing at times
    - I went about fixing this by deciding to stick strictly to the 3-section layout I had in mind: 80px header, the rest split between the visualizer and the container, with rational parent-child relations. After some struggling, this was cleaned up well and the feedback container was visible as intended
    - I then also added an end-of-game feedback screen, which thankfully worked properly from the first try
- I then also added a stopwatch, and made sure it only incremented when answers weren't being checked using the same booleans I was using to track state
- I added programmatic generation of questions based on game config parameters - this was simple
- Then, I added floating draggable options. I specified to copilot the div to place them in,and the method to ensure there was always a right combination of options, and that they should be shuffled after generation or the first two would always be the right answer
- Towards the end, I added some squirrel pngs to assets with squirrel*.png filenames, and provided for them to be randomly generated and placed on the see saw
    - The RHS sequence (array of image names) was generated once and not changed later
    - The LHS was regenerated each time. This led to all squirrels changing on change of any input, so I asked copilot to keep in memory the squirrels generated for the inputs present - this fixed the issue
    - After adding squirrels, I implemented their stacking (using y and z) to make sure large entries wouldn't have then shooting out of the seesaw into infinity. I also added single-digit limits to the input boxes
- I then added the background image I generated using AI and asked copilot to change the appearance of the see saw using a brown gradient to give the appearance of wood, and to give the visualizer a 0.5 alpha white background to improve visibility
## Step 3: Login.vue
- By this time I had learned the basics of web dev and the Vue + FastAPI combo specifically to prototype faster, and was progressing much faster through pages
- I added a router and a login page, and now had multiple pages in the app
- I was wary of problems regarding reading state data but luckily it was quite simple, just import the correct useStore function and get going, using the inbuilt saving functions (which also handle local storage) of the pinia store files (*store.ts) to make any changes and ensure they persist
    - By this time I was still struggling a bit with storage implementation, but the solutions I lay here were used in the rest of the project (basically read pinia first, local second, rewrite pinia if its empty and local isnt)
- I also wasn't sure here how to distribute functions across firebaseConfig and authServices (the helper) - and decided to leave the former for pure firebase-related stuff and use authServices for any functions that seemed like "helper functions" - but I'm still not entirely sure if I did this the right way
### Auth Flow
- I was new to implementing firebase in a web dev project, and this took me a few tries to get right
- I got stuck at losing auth data on refresh, and discovered I had to specify local persistence explicitly, i also implemented an auth state changed listener
- I had trouble (because I was also learning storage at this time) persisting auth state across pages, but this was eventually ironed out by keeping sane functions using the same algorithm: read pinia first, local second, write to pinia if local not empty and pinia is. Didn't have trouble again
- I decided to use the firestore doc's inbuilt ID as the userId as well, and sometimes the userId found in pinia stores would be empty while the rest of the data was present - I had a bug in the code writing this to memory. I was so engrossed in its debugging that I forgot to document it, and I don't recall what it was, but upon fixing it all of this was fixed
## Step 4: Home.vue
- I implemented a Home page to first show user details and added a bunch of user doc fields for debug purposes
- I then refreshed the UI into a real Home page - with a banner, login status, a logout function, and a method calling the backend to send the next game suitable for the user
- At this point I also learned how **router guards** work and implemented them to only let authenticated users into any non-Login page, and only admin types to enter Builder.vue (at this point just an empty page)
## Step 5: Backend - fleshing out
- I enjoyed working here more than I did on the frontend, and was much more familiar with Python than with Vue.js or web dev in general
- I had to add a CORS exception to make sure the front and backend could communicate for now
- I added error handling and logging to all the functions, and the Pydantic models in models.py
- Finally, I added some security measures:
    - I kept in mind to not trust the frontend regarding anything but their auth token, and shifted stuff like userType checking to the backend (was on frontend earlier - which wouldn't have been right - a student could get into Builder.vue)
    - For game logs, I kept in mind to check if the user posting the log is the user whose auth token comes with the request
- Then, I put this in a docker container and tested it using the /ping endpoint - and was happy to see the confirmation message show up
- Had to allow CORS from frontend because, running on different ports, FE and BE were to be treated as separate origins
- Lastly, I added a dummy implementation of the send next game config function - to send the same config despite user id
    - Had some bugs when moving out of this because I had accidentally hardcoded the gameconfigID (was busy focusing on whether the visualizer showed the right config parameters)
    - but this was an easy fix, and the function is now set to send the latest config added
## Step 6: UI Improvements
- Used an AI generated forest background
- Squirrel pngs were also added at this step - and their improper stacking was fixed
- Created a board and logo using pngs available online for free and some sketching on Procreate on my iPad
- Also changed most fonts to Comic Sans to make them look less intimidating and more friendly to children
- I also added the missing "confirm exit" dialog for the Game
## Step 7: Builder.vue
- I first added the Builder button in the Home page - made a mistake here by checking userType from pinia store, not from backend - users can just change it on the frontend so this is not safe, so I fixed it
- With routing guards, I added the routing to Builder.vue
- The Builder was almost entirely AI-generated. I specified in a very long exposition that this page was to be an HTML form with specified sections, specified inputs and their validation rules, the interface for the gameconfig to be used, a specified location for a dialog box showing errors in validation, more rules of validation, the UX features: confirm exit with unsaved changes, grey out the submit button if nothing on the form has been changed, and lastly I specified the endpoint to submit this to
- This worked in the first try, I just had to tweak the UI a bit (planned on having a header earlier which I removed and went for the current form-title style heading)   
## Step 8: Docker Compose
- Having worked with docker and docker-compose before, this wasn't challenging (I use docker for my home  nextcloud server, among other things)
- I asked Copilot to create Dockerfiles and the compose file in the root dir, and, this being a simple FE-BE integration, it did it properly in one shot
## First presentation - notes
- I was in a hurry to present what I had and didn't test for reproducibility, thinking I would simply show the project over screensharing and also didn't provide proper documentation - I realized I was a bit burnt out, having been lost in flow for many weeks (since before this project) and that I hadn't been taking care of myself properly
- I (re-)learned its best not to push through burnout because that only makes it worse
- Postponed the interview, took some time for myself, and went for a jog, came back with a fresh mind, and start compiling my notes properly into docs
- In this clearer headspace, I did plenty of refactoring in the code and fixed a few bugs (e.g. stacking squirrels properly, storing game config Ids properly, etc)
# Parting Notes and self-review
- I haven't fully implemented leveling as I was unsure whether we would be using tailormade lists for specified sets of students or whether the game would be entirely responsible for determining which questions to show the user
- I have yet to really appreciate the difference between composition and options API, I have mixed them up in some of my code - which is not ideal
- I'd say the thing I have to work on most is documentation and logging. When I'm in flow, I tend to not want to write anything down - and during this project I was too tired to do any writing after flow
- But I realize that this daily-log writing will not only make things easier for me, but for others too, and tremendously so
- A discussion with an experienced SWE friend (also working at a startup) further helped me realize the importance of good documentation
- While there may be many details missing in my learning.md, and I may have forgotten how I implemented some things I put into code, I am getting better at this and logging more diligently. I have obsidian open in workspace 1, with code open in workspace 2, so I can easily switch to the notes workspace and get back to coding after quickly jotting down my notes
- Overall, regardless of outcome (though I do hope its a good one) I'm quite pleased at the fact that I had the wrong definition of DOM in my mind and had never written a web dev project just over a week ago, and now have made a fullstack project of value