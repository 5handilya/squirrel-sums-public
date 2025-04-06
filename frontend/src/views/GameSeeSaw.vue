<!-- This view is the main game view to visualize addition -->
<!-- Basic Stucture: 1.Visualizer 2. ControlBoard -->
<!-- Question generation: Based on gameconfig parameters, we programmatically generate questions and options for those questions guaranteed to have a right combination -->

<template>
  <!-- Header -->
  <div class="header flex justify-between items-center p-4 bg-gray-50 h-[80px]">
    <div class="flex flex-row">
      <img src="/src/assets/squirrel1.png" alt="Squirrel" class="h-8 w-8 mr-2">
      <p class="text-2xl">Squirrel Sums</p>
    </div>
  
    <!-- Progress Info Question n / total questions + right/wrong indicators -->
    <div class="progress-info text-center">
      <div class="text-lg font-normal mb-2">Puzzle {{ currentQuestionIndex + 1 }}/{{ questions.length }}</div>
      <div class="flex gap-2 justify-center">
        <div v-for="(q, index) in questions" :key="index" 
             class="w-3 h-3 rounded-full"
             :class="{
               'bg-green-500': q.solved && q.correct,
               'bg-yellow-700': q.solved && !q.correct,
               'bg-gray-300': !q.solved
             }">
        </div>
      </div>
    </div>
  
    <!-- Timer & Home button -->
    <div class="flex items-center gap-4">
      <div class="timer px-4 py-2 bg-yellow-200 rounded-lg">
        {{ timer }}
      </div>
      <button @click="goToHome" class="home-button flex items-center bg-gray-200 rounded-full p-2 hover:bg-gray-300">
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      </button>
    </div>
  </div>

  <!-- Game container height should be total height -80px (header = 80px) -->
  <!--- The game container is split into two: a visualizer (output) and a controlboard (input) -->
  <div class="game-container justify-end h-[calc(100vh-80px)] w-full flex align-middle flex-col fixed bg-cover bg-center overflow-hidden" 
       style="background-image: url('/src/assets/home_background.png')">

    <!-- VISUALIZER -->
    <div class="visualizer flex-1 flex flex-col justify-center items-center relative">
      <!-- End-of-game Stats -->
      <div v-if="isGameEnded" 
           class="game-stats bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
        <h2 class="text-3xl font-bold text-center mb-6 text-blue-600">
          {{ completionMessage }} 
          {{ numCorrect === questions.length ? '🌟' : numCorrect === 0 ? '💪' : '👍' }}
        </h2>
        
        <div class="stats-grid grid gap-4 text-center">
          <div class="stat-item bg-blue-50 rounded-lg p-4">
            <div class="text-4xl font-bold text-blue-500 mb-2">
              {{ numCorrect }}/{{ questions.length }}
            </div>
            <div class="text-gray-600">Correct Answers</div>
          </div>
          
          <div class="stat-item bg-green-50 rounded-lg p-4">
            <div class="text-4xl font-bold text-green-500 mb-2">
              {{ timer }}
            </div>
            <div class="text-gray-600">Time Taken</div>
          </div>
          
          <div class="stat-item bg-purple-50 rounded-lg p-4">
            <div class="text-4xl font-bold text-purple-500 mb-2">
              {{ Math.round((numCorrect / questions.length) * 100) }}%
            </div>
            <div class="text-gray-600">Score</div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-4 mt-8">
          <button @click="goToHome" 
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-xl font-bold transition-colors">
            Home
          </button>
          <button @click="restartGame" 
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-xl font-bold transition-colors">
            Retry 
          </button>
        </div>
      </div>

      <!-- Regular Game View -->
      <div v-else class="regular-game-container flex-1 w-full flex flex-row items-center justify-end">
        <!-- Feedback Text - Only show when checking the answer -->
        <div class="feedback-container w-96 mb-8" 
             v-if="feedback && !isEnteringAnswer">
          <div class="bg-yellow-50 p-4 rounded-lg shadow-md">
            <div class="text-xl font-bold text-center" 
                 :class="{
                   'text-green-600': questions[currentQuestionIndex]?.correct,
                   'text-red-600': questions[currentQuestionIndex]?.solved && !questions[currentQuestionIndex]?.correct
                 }">
              {{ feedback }}
            </div>
            <div class="text-sm text-gray-600 text-center mt-2">{{ hint }}</div>
          </div>
        </div>
        <!-- Imagery Container -->
        <div class="imagery-container w-full flex items-center justify-around">
          <div class="seesaw-container relative">
            <!-- Wooden beam -->
            <div class="see-saw h-4 w-full bg-gradient-to-b from-yellow-500 to-yellow-700 absolute top-1/2 rounded-md shadow-md" 
                 :style="{ transform: `rotate(${scaleRotation}deg)`, transformOrigin: 'center' }">
              <!-- Wood grain effect -->
              <div class="absolute inset-0 opacity-20 bg-repeat" 
                   style="background-image: url('data:image/svg+xml,...')">
              </div>
              <!-- LHS squirrels -->
              <div class="left-shapes absolute -top-16 left-0" style="position: relative; min-height: 56px;">
                <div v-for="(shape, index) in leftShapes" 
                     :key="'left-'+index"
                     :style="shape.style">
                  <img :src="shape.image"
                       class="h-14 w-14 drop-shadow-xl transform translate-y-2">
                </div>
              </div>
              <!-- RHS squirrels -->
              <div class="right-shapes absolute -top-16 right-0 flex gap-2">
                <img v-for="(shape, index) in rightShapes"
                    :key="'right-'+index"
                    :src="shape" 
                    class="h-14 w-14 drop-shadow-xl transform translate-y-2"
                    :ref="'rightShape'+index">
              </div>
            </div>
            <!-- Wooden base -->
            <div class="scale-base h-80 w-10 mt-48 transform translate-y-14 bg-gradient-to-b from-yellow-700 to-yellow-900 mx-auto rounded-t-lg shadow-lg">
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- CONTROLBOARD - the input section -->
    <div v-if="!isGameEnded" class="control-board w-full bg-brown-100 flex flex-col items-center justify-center px-4 py-8 z-50">
      <div class="drag-options-container flex justify-center gap-6 mb-6">
        <div v-for="number in dragOptions" 
             :key="number"
             draggable="true"
             @dragstart="handleDragStart($event, number)"
             class="drag-tile flex items-center justify-center w-16 h-16 
                    bg-white rounded-xl shadow-lg cursor-move
                    text-3xl font-bold text-blue-600
                    hover:shadow-xl transform hover:-translate-y-1 transition-all
                    py-4 
                    border-4 border-blue-400">
          {{ number }}
        </div>
      </div>
      <div class="inputs flex flex-row py-4">
        <!-- LHS -->
        <div class="lhs flex flex-row gap-4">
          <div v-for="(input, index) in inputs" :key="index" 
              class="input-container flex flex-row">
            <input type="text" 
                  v-model="input.value" 
                  class="w-16 h-16 border-2 border-gray-300 rounded-xl text-center text-3xl" 
                  maxlength="1"
                  pattern="[0-9]"
                  @input="filterInput(index)"
                  @dragover="handleDragOver"
                  @drop="handleDrop($event, index)">
            <span 
              v-if="index < inputs.length - 1" 
              class="plus-sign flex items-center justify-center pl-4"
              >
              <div class="text-2xl font-bold">+</div>
            </span>
          </div>
        </div>
        <!-- RHS -->
        <div class="rhs flex flex-row items-center px-4">
          <div class="text-2xl font-bold">=</div>
          <div class="ml-4 text-2xl">{{ currentAnswer }}</div>
        </div>
      </div>
      <!-- Check/Next/Finish Button -->
      <button @click="checkAnswer" 
              class="check-button mt-8 py-4 px-8 rounded-lg text-xl font-bold transition-colors"
              :class="{
                'bg-blue-600 hover:bg-blue-700 text-white': isEnteringAnswer,
                'bg-green-600 hover:bg-green-700 text-white': !isEnteringAnswer && !allQuestionsAnswered,
                'bg-purple-600 hover:bg-purple-700 text-white': !isEnteringAnswer && allQuestionsAnswered
              }"
              :disabled="isEnteringAnswer && !hasValidInput">
        {{ buttonText }}
      </button>
    </div>
    </div>
</template>

<!-- =========================================================================================== -->

<script lang="ts">
import { defineComponent } from 'vue';
import { gsap } from 'gsap';
import { useUserStore } from '../stores/userStore.ts';
import { useCurrentGameConfigStore } from '../stores/currentGameConfigStore.ts';
import { loadUserFromLocalStorage } from '../authService.ts';
import { getFirebaseToken } from '../firebaseConfig.ts';
const API_URL = import.meta.env.VITE_API_URL;

interface GameData {
  timerInterval: number | null;
  inputs: Array<{ value: string | null }>;
  currentQuestionIndex: number;
  questions: {
    rhs : number;
    solved: boolean;
    correct: boolean;
  }[];
  squirrelImages: string[];
  fixedRightSequence: string[];
  numAttempted: number;
  numCorrect: number;
  timeElapsed: number;
  scaleRotation: number;
  leftShapes: Array<any>;
  rightShapes: Array<any>;
  isEnteringAnswer: boolean;
  isGameEnded: boolean;
  feedback: string;
  hint: string;
  dragOptions: number[];
  minSum: number;
  maxSum: number;
}

export default defineComponent({
  name: 'SquirrelSums',
  
  setup() {
    //load user and game config stores
    const userStore = useUserStore();
    const currentGameConfigStore = useCurrentGameConfigStore();
    
    return { userStore, currentGameConfigStore };
  },

  data(): GameData {
    return {
      // Timer state
      timeElapsed: 0,
      timerInterval: null,
      
      // Game state
      currentQuestionIndex: 0,
      questions: [] as GameData['questions'],
      numAttempted: 0,
      numCorrect: 0,
      
      // UI state
      inputs: [] as Array<{ value: string | null }>,
      scaleRotation: 0,
      leftShapes: [],
      rightShapes: [],
      isEnteringAnswer: true,
      isGameEnded: false,
      feedback: '',
      hint: '',
      
      squirrelImages: [
      '/src/assets/squirrel1.png',
      '/src/assets/squirrel2.png',
      '/src/assets/squirrel3.png',
      '/src/assets/squirrel4.png'
      ],
      fixedRightSequence: [],
      dragOptions: [],
      minSum: 1,
      maxSum: 10
    }
  },

  computed: {
    // various game progress tracking vars
    timer(): string {
      const minutes = Math.floor(this.timeElapsed / 60);
      const seconds = this.timeElapsed % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    currentAnswer(): number {
      return this.questions[this.currentQuestionIndex]?.rhs;
    },
    
    allQuestionsAnswered(): boolean {
      return this.questions.every(q => q.solved);
    },

    buttonText(): string {
      if (this.isEnteringAnswer) return 'Check Answer';
      if (this.allQuestionsAnswered) return 'Finish';
      return 'Next Question';
    },

    completionMessage(): string {
      if (this.numCorrect === this.questions.length) return 'Great job!';
      if (this.numCorrect === 0) return 'Good attempt!';
      return 'Well done!';
    },

    hasValidInput(): boolean {
      return this.inputs.some(input => 
        input.value !== null && 
        input.value !== '' && 
        Number(input.value) > 0
      );
    }
  },

  created() {

    //if user data is not loaded, load from local storage
    if (this.userStore.userId === '') {
      loadUserFromLocalStorage();
    }

    //if game config is not loaded, load from local storage
    if (!this.currentGameConfigStore.createdBy) {
      this.currentGameConfigStore.loadFromLocalStorage();
    }

    //if game config still hasnt loaded, the backend is probably not responding, return home
    if (this.currentGameConfigStore.createdBy === '') {
      console.log("Game.vue: Game config couldnt be loaded, returning home");
      this.goToHome();
    }

    // start to load valid game config
    // generate numOfQuestions questions based on config
    this.questions = Array(this.currentGameConfigStore.numOfQuestions).fill(null).map(() => ({
      rhs: this.generateRandomRHS(),
      solved: false,
      correct: false
    }));

    console.log('Game initialized with config:', {
      userId: this.userStore.userId,
      gameConfigId: this.currentGameConfigStore.gameConfigId,
      questions: this.questions
    });

    this.resetInputs();
  },

  mounted() {
    this.startTimer();
  },

  unmounted() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  },

  methods: {
    // for keeping track of time elapsed - or a timer feature later
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.isEnteringAnswer) {  // Only increment if not checking
          this.timeElapsed++;
        }
      }, 1000);
    },

    // generate a random answer for the question given the min and max sum
    generateRandomRHS(): number {
      const min = this.currentGameConfigStore.minSum;
      const max = this.currentGameConfigStore.maxSum;
      const newAnswer = Math.floor(Math.random() * (max - min + 1)) + min;
      return newAnswer;
    },

    // update the visualizer based on the current input values
    updateVisualization() {
      const sum = this.inputs.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
      
      // Calculate new shapes array for LHS
      const newLeftShapes = [];
      for (let i = 0; i < sum; i++) {
        const row = Math.floor(i / 8);
        const posInRow = i % 8;
        
        //this arranges squirrels with a max width on the LHS and gives them the appearance of stacking over one another on overflow (also is set: flex overflow)
        //TODO: extend to RHS too if planning on higher maxsums
        newLeftShapes.push({
          image: this.squirrelImages[Math.floor(Math.random() * this.squirrelImages.length)],
          style: {
            transform: `translate(${posInRow * 60}px, ${-row * 60}px)`,
            zIndex: row,
            position: 'absolute'
          }
        });
      }
      this.leftShapes = newLeftShapes;
      
      // RHS fixed sequence of squirrels
      // only to be updated if hasnt already been set, or the squirrels on the right will change with every input
      if(this.rightShapes.length === 0) {
        this.rightShapes = Array(this.questions[this.currentQuestionIndex].rhs).fill(null).map(() => this.squirrelImages[Math.floor(Math.random() * 4)]);
      }
      // this.rightShapes = Array(this.questions[this.currentQuestionIndex].rhs).fill(null).map(() => this.squirrelImages[Math.floor(Math.random() * 4)]);

      // rotation of the seesaw
      const rotation = Math.min(Math.max(((this.currentAnswer - sum)) * 5, -30), 30);
      gsap.to(this, {
        scaleRotation: rotation,
        duration: 0.5,
        ease: 'power2.out'
      });
    },

    // Method for checking the answer when "Check Answer" is pressed
    checkAnswer() {
      if (!this.isEnteringAnswer) { 
        // Handle "Next (question)" or "Finish" button click - since theyre the same button
        if (this.allQuestionsAnswered) {
          this.endGame();
        } else {
          this.currentQuestionIndex++;
          this.resetInputs();
          this.isEnteringAnswer = true;
          this.feedback = '';  // Clear feedback
          this.hint = '';      // Clear hint
          this.updateVisualization();  // Reset shapes
        }
        return;
      }
      // Answer-checking logic
      const sum = this.inputs.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
      const isCorrect = sum === this.currentAnswer;
      this.questions[this.currentQuestionIndex].solved = true;
      this.questions[this.currentQuestionIndex].correct = isCorrect;
      this.numAttempted++;
      if (isCorrect) this.numCorrect++;
      // feedack title and subtitles (hints)
      this.feedback = isCorrect ? 'Correct!' : 'Not quite right...';
      this.hint = sum > this.currentAnswer ? this.currentGameConfigStore.hintTooHigh: 
                 sum < this.currentAnswer ? this.currentGameConfigStore.hintTooLow: 
                 'You have balanced the see-saw!';
      this.isEnteringAnswer = false;  // Change to "Next/Finish" mode
    },

    // Method for resetting the input fields and visualizer
    resetInputs() {
      this.inputs = Array(this.currentGameConfigStore.numOfAddends)
        .fill(null)
        .map(() => ({ value: '' }));

      this.leftShapes = [];
      this.rightShapes = [];
      this.generateDragOptions();

      this.updateVisualization();

      },

    // Method for ending the game and logging the game completion
    async endGame() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      this.isGameEnded = true;
      // LOGGING game completion
      // include: gameConfigId, userId, numQuestions, numAttempted, numCorrect, timeElapsed, gameCreatedBy, logTimestamp
      try {
        const token = await getFirebaseToken();
        const gameLog = {
          gameConfigId: this.currentGameConfigStore.gameConfigId,
          gameLogTimestamp: new Date().toISOString(),
          gameCreatedBy: this.userStore.userId,
          userId: this.userStore.userId,
          numQuestions: this.questions.length,
          numAttempted: this.numAttempted,
          numCorrect: this.numCorrect,
          timeElapsed: this.timeElapsed
        };
	const response = await fetch(`${API_URL}/game_logs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gameLog)
        });
        if (!response.ok) {
          throw new Error('Failed to log game completion');
        }
        else {
          console.log("Successfully logged game completion");
        }
      } catch (error) {
        console.error('Error logging game completion:', error);
      }
    },

    // Method for filtering input to only allow digits
    filterInput(index: number) {
      const value = this.inputs[index].value;
      this.inputs[index].value = value?.replace(/\D/g, '') || '';
      this.updateVisualization();
    },

    goToLogin() {
      this.$router.push({ name: 'Login' });
    },

    goToHome() {
      if(!this.isGameEnded){
        if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
          if (this.timerInterval) {
            clearInterval(this.timerInterval);
          }
          this.$router.push({ name: 'Home' });
        }
      }
      else{
        this.$router.push({ name: 'Home' });
      }
    },

    // Called when the user wants to restart the game from the end-of-game feedback screen
    restartGame() {
      this.currentQuestionIndex = 0;
      this.questions = Array(this.currentGameConfigStore.numOfQuestions).fill(null).map(() => ({
        rhs: this.generateRandomRHS(),
        solved: false,
        correct: false
      }));
      this.numAttempted = 0;
      this.numCorrect = 0;
      this.timeElapsed = 0;
      this.isGameEnded = false;
      this.isEnteringAnswer = true;
      this.feedback = '';
      this.hint = '';
      this.resetInputs();
      
      this.timerInterval = setInterval(() => {
        this.timeElapsed++;
      }, 1000);
    },

    // Method to generate draggable options for the input fields
    // Guaranteed to have a right combination
    generateDragOptions() {
      this.dragOptions = [];
      const target = this.currentAnswer;
      const num1 = Math.floor(Math.random() * (target - 1)) + 1;
      const num2 = target - num1;
      const num3 = Math.floor(Math.random() * (this.maxSum - this.minSum)) + this.minSum;
      this.dragOptions = [num1, num2, num3];
      //shuffle drag options
      this.dragOptions.sort(() => Math.random() - 0.5);
      console.log('Generated options:', this.dragOptions);
    },

    //methods below for drag and drop functionality
    handleDragStart(e: DragEvent, number: number) {
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', number.toString());
      }
    },

    handleDrop(e: DragEvent, index: number) {
      e.preventDefault();
      if (e.dataTransfer) {
        const number = e.dataTransfer.getData('text/plain');
        this.inputs[index].value = number;
        this.updateVisualization();
      }
    },

    handleDragOver(e: DragEvent) {
      e.preventDefault();
    }
  }
});
</script>

<!-- ====================================================== -->

<style scoped>
.check-button {
  align-self: center;
  font: 'Comic Sans';
  background: linear-gradient(to bottom, #4CAF50, #45a049);
}

.check-button:hover {
  background: linear-gradient(to bottom, #45a049, #3d8b40);
}

.profile-button {
  transition: background-color 0.3s;
  background-color: rgba(139, 69, 19, 0.1);
}
.profile-button:hover {
  background-color: rgba(139, 69, 19, 0.2);
}

.game-stats {
  animation: fadeIn 0.5s ease-out;
}

.stat-item {
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.visualizer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5);
}
.seesaw-container {
  height: fit-content;
  width: 1000px;
}

.feedback-container {
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 24rem;
  z-index: 10;
}

.regular-game-container{
  flex: 1;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drag-tile {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.see-saw {
  background: linear-gradient(to bottom, #8B4513, #654321);
}

.left-shapes {
  max-width:  500px;
}

.right-shapes {
  max-width:  500px;
}

.control-board {
  min-height: 300px;
  background: linear-gradient(to bottom, rgb(217, 188, 146), rgb(220, 187, 121));
}

</style>
