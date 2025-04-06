<!-- This view is the Continuous Mode of the See Saw Game to visualize addition -->
<!-- Basic Stucture: 1.Visualizer 2. ControlBoard -->
<!-- Question generation: Based on gameconfig parameters, we programmatically generate questions -->

<template>
  <!-- Header -->
  <div class="header flex justify-between items-center p-4 bg-gray-50 h-[80px]">
    <div class="flex flex-row">
      <img src="/src/assets/squirrel1.png" alt="Squirrel" class="h-8 w-8 mr-2">
      <p class="text-2xl">Squirrel Sums</p>
    </div>

    <!-- Progress Info -->
    <div class="progress-info text-center">
      <div v-if="lives > 0" class="text-lg font-normal mb-2">❤️ Lives: {{ lives }} </div>
      <div v-if="lives == 0" class="text-lg font-normal mb-2">❤️ Lives: Infinite</div>
      <div class="flex gap-2 justify-center">
        <div
          v-for="(q, index) in questions"
          :key="index"
          class="w-3 h-3 rounded-full"
          :class="{
            'bg-green-500': q.solved && q.correct,
            'bg-red-500': q.solved && !q.correct,
            'bg-gray-300': !q.solved,
          }"
        ></div>
      </div>
    </div>

    <!-- Timer & Home button -->
    <div v-if="!isGameEnded" class="flex items-center gap-4">
      <div class="timer px-4 py-2 bg-yellow-200 rounded-lg">
        {{ timer }}
      </div>
      <button
        @click="goToHome"
        class="home-button flex items-center bg-gray-200 rounded-full p-2 hover:bg-gray-300"
      >
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Game container -->
  <div
    class="game-container justify-end h-[calc(100vh-80px)] w-full flex align-middle flex-col fixed bg-cover bg-center overflow-hidden"
    style="background-image: url('/src/assets/home_background.png')"
  >
    <!-- VISUALIZER -->
    <div class="visualizer flex-1 flex flex-col justify-center items-center relative">
      <!-- End-of-game Stats -->
      <div v-if="isGameEnded" class="game-stats bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
        <h2 class="text-3xl font-bold text-center mb-6 text-blue-600">
          {{ endMessage }}
        </h2>
        <h2 class="text-3xl font-bold text-center mb-6 text-blue-600">
          {{ correctStreak >= 5 ? '🏆' : '🐿️' }}
        </h2>

        <div class="stats-grid grid gap-4 text-center">
          <div class="stat-item bg-blue-50 rounded-lg p-4">
            <div class="text-4xl font-bold text-blue-500 mb-2">
              {{ correctStreak }}
            </div>
            <div class="text-gray-600">Questions Solved</div>
          </div>

          <div class="stat-item bg-green-50 rounded-lg p-4">
            <div class="text-4xl font-bold text-green-500 mb-2">
              {{ formatTime(timeElapsed) }}
            </div>
            <div class="text-gray-600">Time Played</div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-4 mt-8">
          <button
            @click="goToHome"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-xl font-bold transition-colors"
          >
            Home
          </button>
          <button
            @click="restartGame"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-xl font-bold transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>

      <!-- Regular Game View -->
      <div v-else class="regular-game-container flex-1 w-full flex flex-row items-center justify-end">
        <!-- Feedback Text -->
        <div class="feedback-container w-96 mb-8" v-if="feedback">
          <div class="bg-yellow-50 p-4 rounded-lg shadow-md">
            <div
              class="text-xl font-bold text-center"
              :class="{
                'text-green-600': feedback.includes('Correct'),
                'text-red-600': feedback.includes('Oops'),
              }"
            >
              {{ feedback }}
            </div>
          </div>
        </div>

        <!-- Seesaw Imagery -->
        <div class="imagery-container w-full flex items-center justify-around">
          <div class="seesaw-container relative">
            <!-- Seesaw beam -->
            <div
              class="see-saw h-6 w-full bg-gradient-to-b from-yellow-500 to-yellow-700 absolute top-1/2 rounded-md shadow-md"
              :style="{ transform: `rotate(${scaleRotation}deg)`, transformOrigin: 'center' }"
            >
              <!-- Sliding Squirrel -->
              <div
                class="sliding-squirrel absolute -top-16 h-24 left-1/2 z-50"
                :style="{ transform: `translateX(${squirrelPosition}px) translateX(-50%)` }">
                <img :src="squirrelImage" class="h-16 w-16 drop-shadow-xl transform translate-y-2" />
              </div>

              <!-- Nuts containers -->
              <div class="flex flex-row w-full justify-between">
                <!-- LHS nuts -->
                <div class="left-shapes flex-1 relative -top-16" style="min-height: 56px">
                  <div
                    v-for="(shape, index) in leftShapes"
                    :key="'left-nut-' + index"
                    :style="shape.style"
                  >
                    <img :src="shape.image" class="h-14 w-14 drop-shadow-xl transform translate-y-2" />
                  </div>
                </div>

                <!-- RHS nuts -->
                <div class="right-shapes flex flex-row-reverse items-end flex-1 relative -top-16"
                  style="min-height: 56px"
                >
                  <div
                    v-for="(shape, index) in rightShapes"
                    :key="'right-nut-' + index"
                    :style="shape.style"
                  >
                    <img :src="shape.image" class="h-14 w-14 drop-shadow-xl transform translate-y-2" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Seesaw base -->
            <div
              class="scale-base h-80 w-10 mt-48 transform translate-y-14 bg-gradient-to-b from-yellow-700 to-yellow-900 mx-auto rounded-t-lg shadow-lg"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- CONTROL BOARD -->
    <div v-if="!isGameEnded" class="control-board w-full bg-brown-100 flex flex-col items-center justify-center px-4 py-8 z-50">
      <div class="drag-options-container flex justify-center gap-6 mb-6">
        <div
          v-for="number in dragOptions"
          :key="number"
          draggable="true"
          @dragstart="handleDragStart($event, number)"
          class="drag-tile flex items-center justify-center w-16 h-16
                    bg-white rounded-xl shadow-lg cursor-move
                    text-3xl font-bold text-blue-600
                    hover:shadow-xl transform hover:-translate-y-1 transition-all
                    py-4
                    border-4 border-blue-400"
        >
          {{ number }}
        </div>
      </div>
      <div class="inputs flex flex-row w-1/2 justify-between py-4">
        <!-- LHS Inputs -->
        <div class="lhs flex flex-row gap-4">
          <div
            v-for="(input, index) in lhsInputs"
            :key="index"
            class="input-container flex flex-row"
          >
            <input
              type="text"
              v-model="input.value"
              :disabled="activeSide === 'rhs'"
              :class="{ 'bg-gray-200': activeSide === 'rhs' }"
              class="w-16 h-16 border-2 border-gray-300 rounded-xl text-center text-3xl"
              maxlength="1"
              @input="filterInput('lhs', index)"
              @dragover="handleDragOver"
              @drop="handleDropLhs($event, index)"
            />
            <span v-if="index < lhsInputs.length - 1" class="plus-sign flex items-center justify-center pl-4">
              <div class="text-3xl font-bold">+</div>
            </span>
          </div>
        </div>

        <p class="text-3xl font-bold content-center">=</p>

        <!-- RHS Inputs -->
        <div class="rhs flex flex-row gap-4">
          <div
            v-for="(input, index) in rhsInputs"
            :key="index"
            class="input-container flex flex-row"
          >
            <input
              type="text"
              v-model="input.value"
              :disabled="activeSide === 'lhs'"
              :class="{ 'bg-gray-200': activeSide === 'lhs' }"
              class="w-16 h-16 border-2 border-gray-300 rounded-xl text-center text-3xl"
              maxlength="1"
              @input="filterInput('rhs', index)"
              @dragover="handleDragOver"
              @drop="handleDropRhs($event, index)"
            />
            <span v-if="index < rhsInputs.length - 1" class="plus-sign flex items-center justify-center pl-4">
              <div class="text-3xl font-bold">+</div>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<!-- =========================================================================================== -->

<script lang="ts">
import { defineComponent} from 'vue';
import gsap from 'gsap';
import { useUserStore } from '../stores/userStore.ts';
import { useCurrentGameConfigStore } from '../stores/currentGameConfigStore.ts';
import { loadUserFromLocalStorage } from '../authService.ts';
import { getFirebaseToken } from '../firebaseConfig.ts';
const API_URL = import.meta.env.VITE_API_URL;

interface GameData {
  // sliding squirrel's position (float)
  // the see-saw is currently hard-coded to be 1000px wide
  // the position is between -500 and +500
  squirrelPosition: number;

  // sliding squirrel's speed multiplier
  // higher is more difficult
  // can thus be adjusted as part of game config
  squirrelSpeed: number;

  // for canceling movement if scale is balanced before squirrel reaches end of previous animation
  squirrelIsMoving: boolean;

  // numerical inputs
  lhsInputs: Array<{ value: string | null }>;
  rhsInputs: Array<{ value: string | null }>;

  // number of questions solved
  currentQuestionIndex: number;

  //questions array
  questions: {
    targetSum: number;
    solved: boolean;
    correct: boolean;
  }[];

  // active side of inputs - the side containing the targetSum is inactive, and is greyed out & disabled
  // this alternates between lhs and rhs between questions
  activeSide: 'lhs' | 'rhs';
  // no. of lives the player has
  lives: number;
  // questions answered correctly without losing all lives
  correctStreak: number; //display in gameEnd()
  isEnteringAnswer: boolean; //not used atm, can be used to pause timer briefly when giving feedback
  squirrelImage: string;
  nutImages: string[];
  // for the timer
  timeElapsed: number;
  scaleRotation: number;
  leftShapes: Array<any>;
  rightShapes: Array<any>;
  isGameEnded: boolean;
  feedback: string;
  hint: string;
  dragOptions: number[];
  minSum: number;
  maxSum: number;
  timerInterval: number | null;
  endMessage: string;
}

export default defineComponent({
  name: 'GameSlidingSquirrel',

  setup() {
    //load user and game config stores
    const userStore = useUserStore();
    const currentGameConfigStore = useCurrentGameConfigStore();
    return { userStore, currentGameConfigStore };
  },

  data(): GameData {
    return {
      squirrelPosition: 0,
      squirrelSpeed: 1,
      squirrelIsMoving: false,

      // Timer state
      timeElapsed: 0,
      timerInterval: null as number | null,

      // Game state
      currentQuestionIndex: 0,
      questions: [] as GameData['questions'],

      // Input state
      lhsInputs: [] as Array<{ value: string | null }>,
      rhsInputs: [] as Array<{ value: string | null }>,
      scaleRotation: 0,
      leftShapes: [],
      rightShapes: [],
      isEnteringAnswer: true,
      isGameEnded: false,
      feedback: '',
      hint: '',
      activeSide: 'lhs',
      lives: -1, // unitialized is -1 because 0 means inf lives
      correctStreak: 0,

      squirrelImage: '/src/assets/squirrel1.png',
      nutImages: [
        '/src/assets/nut.png',
      ],
      dragOptions: [0,1,2,3,4,5,6,7,8,9],
      //these two sums are placeholders, will be read onMounted()
      minSum: 0,
      maxSum: 0,
      endMessage: '',
    };
  },

  computed: {
    // various game progress tracking vars
    timer(): string {
      const minutes = Math.floor(this.timeElapsed / 60);
      const seconds = this.timeElapsed % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    currentAnswer(): number {
      return this.questions[this.currentQuestionIndex]?.targetSum;
    },

    allQuestionsAnswered(): boolean {
      return this.questions.every((q) => q.solved);
    },

    hasValidInput(): boolean {
      const leftValid = this.lhsInputs.some(
        (input) => input.value !== null && input.value !== '' && Number(input.value) > 0
      );
      const rightValid = this.rhsInputs.some(
        (input) => input.value !== null && input.value !== '' && Number(input.value) > 0
      );
      return leftValid && rightValid;
    },
  },

  // there are validation checks for user and game config at created()
  // in a prod env, all relevant fields should be checked, not just an indicative field - which is just for the demo
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
      console.log('Game.vue: Game config couldnt be loaded, returning home');
      this.goToHome();
    }

    console.log('Game initialized with config:', {
      userId: this.userStore.userId,
      gameConfigId: this.currentGameConfigStore.gameConfigId,
      questions: this.questions,
    });

  },

  watch: {
    //watching squirrel position to detect falloff
    squirrelPosition(newValue) {
      if (newValue >= 500 || newValue <= -500) {
        // only reduce lives if lives enabled i.e. gameConfig lives != 0
        if (this.currentGameConfigStore.lives != 0){
          this.lives--;
          if (this.lives > 0) {
            this.squirrelPosition = 0;
            gsap.killTweensOf(this, 'squirrelPosition');
            this.feedback = `Oops! Lives left: ${this.lives}`;
            this.updateVisualization();
          } else {
            this.endGame('fell');
          }
        }
        else {
          // infinite lives mode
          this.squirrelPosition = 0;
          gsap.killTweensOf(this, 'squirrelPosition');
          this.feedback = "The Squirrel fell off!";
          this.updateVisualization();
        }
      }
    },
  },

  mounted() {
    const gameConfigStore = useCurrentGameConfigStore();
    this.minSum = gameConfigStore.minSum;
    this.maxSum = gameConfigStore.maxSum;
    this.resetGameState();
  },

  unmounted() {
    this.stopGameTimer();
  },

  methods: {

    startGameTimer() {
      this.timeElapsed = 0;
      this.timerInterval= setInterval(() => {
        if (this.isEnteringAnswer) {
          this.timeElapsed++;
        }
      }, 1000);
    },

    stopGameTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    formatTime(seconds: number): string {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(remainingSeconds).padStart(2, '0');
      return `${formattedMinutes}:${formattedSeconds}`;
    },

    // generate a random targetSum for the question given the min and max sum
    // this is the main target value that the user has to match with their input
    generateRandomTargetSum(): number {
      const min = this.currentGameConfigStore.minSum;
      const max = this.currentGameConfigStore.maxSum;
      // if not first question, avoid repeating previous question
      // set previousTargetSum to null if first Q, otherwise the prev target sum value
      let previousTargetSum =
        this.currentQuestionIndex > 0 ? this.questions[this.currentQuestionIndex - 1].targetSum : null;
      // an array from minSum to maxSum
      let possibleSums = Array.from({ length: max - min + 1 }, (_, i) => i + min);
      // remove previousTarget (if present) from the possibleSums
      if (previousTargetSum !== null) {
        possibleSums = possibleSums.filter((sum) => sum !== previousTargetSum);
      }
      // choose randomly from the filtered possibleSums
      const randomIndex = Math.floor(Math.random() * possibleSums.length);
      return possibleSums[randomIndex];
    },

    // update the visualizer based on the current input values
    updateVisualization() {
      // sum extracted from inputs
      // value || 0 because values might be empty and should be read as 0
      const lhsSum = this.lhsInputs.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
      const rhsSum = this.rhsInputs.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

      // Calculate new shapes array for LHS (for nuts)
      const newLeftShapes = [];
      for (let i = 0; i < lhsSum; i++) {
        const row = Math.floor(i / 4);
        const posInRow = i % 4;

        //this arranges nuts with a max width on the LHS and gives them the appearance of stacking over one another on overflow (also is set: flex overflow)
        newLeftShapes.push({
          image: this.nutImages[Math.floor(Math.random() * this.nutImages.length)],
          style: {
            transform: `translate(${posInRow * 60}px, ${-row * 60}px)`,
            zIndex: row,
            position: 'absolute',
          },
        });
      }
      this.leftShapes = newLeftShapes;

      // Calculate new shapes array for RHS (for nuts)
      const newRightShapes = [];
      for (let i = 0; i < rhsSum; i++) {
        //max 4 nut width
        const row = Math.floor(i / 4);
        const posInRow = i % 4;

        //this arranges nuts with a max width on the LHS and gives them the appearance of stacking over one another on overflow (also is set: flex overflow)
        newRightShapes.push({
          image: this.nutImages[Math.floor(Math.random() * this.nutImages.length)],
          style: {
            transform: `translate(${-posInRow * 60}px, ${-row * 10}px)`,
            zIndex: row,
            position: 'absolute',
          },
        });
      }
      this.rightShapes = newRightShapes;

      // rotation of the seesaw
      const rotation = Math.min(Math.max((rhsSum - lhsSum) * 5, -30), 30);
      gsap.to(this, {
        scaleRotation: rotation,
        duration: 0.5,
        ease: 'power2.out',
      });

      // kill gsap animation running on squirrelPosition
      // e.g. if user balances the seesaw before squirrel reaches end of previous animation
      gsap.killTweensOf(this, 'squirrelPosition');

      // animate squirrel movement if seesaw not balanced
      if (rotation !== 0) {
        // stop animation if already running
        // handle sliding squirrel movement
        const finalPosition = rotation > 0 ? 500 : -500;
        const initialPosition = this.squirrelPosition;
        const distance = Math.abs(finalPosition - initialPosition);
        //not providing for rotation = 0 case causes glitches, so we set it to 1 in case it is 0
        const calc_rotation = Math.abs(rotation) == 0 ? 1 : Math.abs(rotation);
        //this is where we take the given speed into account
        const duration = distance / (calc_rotation * this.squirrelSpeed);
        console.log(
          'Squirrel moving from',
          initialPosition,
          'to',
          finalPosition,
          'in',
          duration,
          'seconds',
          distance,
          rotation
        );
        // actual gsap animation
        gsap.to(this, {
          squirrelPosition: finalPosition,
          duration: duration,
          // easing out will slow squirrel down near the corners
          ease: 'power2.out',
        });
      }
    },

    // Method for checking the answer
    // Called after valid input is passed
    checkAnswer() {
      this.updateVisualization();

      // get current question and active side (lhs / rhs)
      const currentQuestion = this.questions[this.currentQuestionIndex];
      const activeSum =
        this.activeSide === 'lhs'
          ? this.lhsInputs.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
          : this.rhsInputs.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

      const isCorrect = activeSum === currentQuestion.targetSum;
      currentQuestion.solved = true;
      currentQuestion.correct = isCorrect;

      if (isCorrect) {
        this.correctStreak++; //only updates correct streak on correct answer
        this.feedback = 'Correct!';
        //small timeout after answering correctly
        setTimeout(() => {
          if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.resetInputs();
          } else {
            this.endGame('pass');
          }
        }, 1000);
      } else {
        this.feedback = 'Try again!';
      }
    },

    // Method for resetting the input fields
    resetInputs() {
      // get current question info
      const currentQuestion = this.questions[this.currentQuestionIndex];
      this.activeSide = this.currentQuestionIndex % 2 === 0 ? 'lhs' : 'rhs';

      // hard coded num of inputs = 3 based on spec
      this.lhsInputs = Array(3)
        .fill(null)
        .map(() => ({ value: '' }));

      this.rhsInputs = Array(3)
        .fill(null)
        .map(() => ({ value: '' }));

      // place random combination of 3 numbers that sum to targetSum in the inactive input fields
      const combination = this.generateSumCombination(currentQuestion.targetSum);
      if (this.activeSide === 'lhs') {
        this.rhsInputs = combination.map((value) => ({ value: value.toString() }));
      } else {
        this.lhsInputs = combination.map((value) => ({ value: value.toString() }));
      }

      // reset feedback
      this.leftShapes = [];
      this.rightShapes = [];
      this.updateVisualization();

    },

    // generates a random combination of 3 numbers that sum to targetSum
    // to be placed in the inactive (question-side) input fields
    generateSumCombination(targetSum: number): number[] {
      let num1, num2, num3;
      let a, b;
      // generate two random nums a and b between 1 and N - 1 (both inclusive)
      a = 1 + Math.floor(Math.random() * (targetSum - 2));
      b = 1 + Math.floor(Math.random() * (targetSum - 2));
      if (a > b) {
        // ensure a <= b
        [a, b] = [b, a];
      }
      // it is possible here to get a = b, and that would make an input = 0, which is fine
      num1 = a;
      num2 = b - a;
      num3 = targetSum - b;
      return [num1, num2, num3];
    },

    // Method for ending the game and logging the game completion
    async endGame(endCause: string) {
      this.stopGameTimer();
      this.isGameEnded = true;
      this.endMessage = endCause === 'fell' ? 'The squirrel fell!' : 'Well done!';
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
          numAttempted: this.correctStreak,
          numCorrect: this.correctStreak,
          timeElapsed: this.timeElapsed,
        };
	const response = await fetch(`${API_URL}/game_logs`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gameLog),
        });
        if (!response.ok) {
          throw new Error('Failed to log game completion');
        } else {
          console.log('Successfully logged game completion');
        }
      } catch (error) {
        console.error('Error logging game completion:', error);
      }
    },

    // Method for filtering input to only allow digits
    filterInput(side: 'lhs' | 'rhs', index: number) {
      if (side === 'lhs') {
        const lhsValue = this.lhsInputs[index].value;
        this.lhsInputs[index].value = lhsValue?.replace(/\D/g, '') || '';
      } else {
        const rhsValue = this.rhsInputs[index].value;
        this.rhsInputs[index].value = rhsValue?.replace(/\D/g, '') || '';
      }
      this.checkAnswer();
    },
    goToLogin() {
      this.$router.push({ name: 'Login' });
    },

    goToHome() {
      if (!this.isGameEnded) {
        if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
          this.stopGameTimer();
          this.$router.push({ name: 'Home' });
        }
      } else {
        this.$router.push({ name: 'Home' });
      }
    },
    // resets the entire game state
    // used when starting or restarting the game
    resetGameState() {
      //reset correct answer streak
      this.correctStreak = 0;
      //empty questions array
      this.questions = Array(this.currentGameConfigStore.numOfQuestions)
        .fill(null)
        .map(() => ({
          targetSum: this.generateRandomTargetSum(),
          solved: false,
          correct: false,
        }));
      //reset current question index
      this.currentQuestionIndex = 0;
      this.timeElapsed = 0;
      this.isGameEnded = false; //legacy, not used atm
      this.isEnteringAnswer = true;
      this.feedback = '';
      this.hint = '';
      this.endMessage = ''; // Reset end message
      // tracking the squirrel's position - used for detecting falloff in watch
      this.squirrelPosition = 0;
      //read lives from config
      this.lives = this.currentGameConfigStore.lives;
      this.resetInputs();
      this.stopGameTimer();
      this.startGameTimer();
    },

    // Method to generate draggable options for the input fields
    // constant list of numbers from 0-9
    // generateDragOptions() {
    //   const allOptions = Array.from({ length: 10 }, (_, i) => i);
    //   this.dragOptions = allOptions;
    // },

    //methods below for drag and drop functionality
    handleDragStart(e: DragEvent, number: number) {
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', number.toString());
      }
    },

    handleDropLhs(e: DragEvent, index: number) {
      e.preventDefault();
      if (e.dataTransfer) {
        const number = e.dataTransfer.getData('text/plain');
        this.lhsInputs[index].value = number;
        this.checkAnswer();
      }
    },
    handleDropRhs(e: DragEvent, index: number) {
      e.preventDefault();
      if (e.dataTransfer) {
        const number = e.dataTransfer.getData('text/plain');
        this.rhsInputs[index].value = number;
        this.checkAnswer();
      }
    },

    handleDragOver(e: DragEvent) {
      e.preventDefault();
    },
    restartGame() {
      this.resetGameState();
    },
  },
});
</script>

<!-- ====================================================== -->

<style scoped>
.check-button {
  align-self: center;
  font: 'Comic Sans';
  background: linear-gradient(to bottom, #4caf50, #45a049);
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

.regular-game-container {
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

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

.see-saw {
  background: linear-gradient(to bottom, #8b4513, #654321);
}

.left-shapes {
  max-width: 500px;
}

.right-shapes {
  max-width: 500px;
}

.control-board {
  min-height: 300px;
  background: linear-gradient(to bottom, rgb(217, 188, 146), rgb(220, 187, 121));
}
</style>
