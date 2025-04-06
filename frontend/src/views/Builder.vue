<!-- Builder.vue: for creating new game configurations, for admins only -->
<!-- UI and functions described below -->

<template>
  <div class="builder-container min-h-screen h-screen fixed w-full bg-cover bg-center overflow-hidden" 
     style="background-image: url('/src/assets/home_background.png')">
  <!-- Form Container -->
  <div class="w-auto bg-brown-100/90 shadow-xl px-8 py-8 max-h-screen overflow-y-auto">
      <div class="header flex flex-row justify-between mb-8">
          <div class="justify-between">
              <h1 class="text-2xl font-bold">Activity Builder</h1>
              <h3 class="font-bold">Squirrel Sums - Addition Game</h3>
          </div>
          <button @click="confirmHome" class="home-button flex items-center bg-white rounded-md h-10 py-0 px-4 hover:bg-gray-300">
            Home
          </button>
      </div>

    <!-- Live validation feedback - displays errors in input instantly -->
    <div v-if="Object.keys(validationErrors).length > 0" 
         class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p v-for="(error, field) in validationErrors" 
         :key="field" 
         class="text-sm">
        {{ error }}
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Settings -->
      <div class="grid grid-cols-4 grid-rows-1 gap-4">
          <div>
          <label class="block text-brown-700 mb-2">Minimum Sum</label>
          <input 
            type="number" 
            v-model.number="config.minSum"
            class="w-48 px-3 py-2 border rounded"
            min="1"
            :max="config.maxSum - 1"
          >
          </div>
          <div>
          <label class="block text-brown-700 mb-2">Maximum Sum</label>
          <input 
            type="number" 
            v-model.number="config.maxSum"
            class="w-48 px-3 py-2 border rounded"
            :min="config.minSum + 1"
            max="100"
          >
          </div>
          <div v-if="config.visualizerType != 'sliding squirrel'">
          <label class="block text-brown-700 mb-2">Number of Addends</label>
          <input 
            type="number" 
            v-model.number="config.numOfAddends"
            class="w-48 px-3 py-2 border rounded"
            min="2" 
            max="4"
          >
          </div>
          <div>
          <label class="block text-brown-700 mb-2">Number of Questions</label>
          <input 
            type="number" 
            v-model.number="config.numOfQuestions"
            class="w-48 px-3 py-2 border rounded"
            min="1" 
            max="10"
          >
          </div>
          <div v-if="config.visualizerType === 'sliding squirrel'">
            <label class="block text-brown-700 mb-2">Lives (0 = infinite)</label>
            <input 
              type="number" 
              v-model.number="config.lives"
              class="w-48 px-3 py-2 border rounded"
              min="0"
              max="10"
            >
          </div>
      </div>


      <!-- Visualizer Settings -->
      <div class="space-y-4">
        <div class="flex items-center">
            <input 
            type="checkbox" 
            v-model="config.visualizerEnabled"
            class="mr-2"
            disabled
            >
          <label class="text-brown-700">Enable Visualizer</label>
        </div>
        
        <div v-if="config.visualizerEnabled">
          <label class="block text-brown-700 mb-2">Visualizer Type</label>
          <select 
            v-model="config.visualizerType"
            class="w-full px-3 py-2 border rounded"
          >
            <option value="seesaw">Seesaw</option>
            <option value="sliding squirrel">Sliding Squirrel (Continuous Mode)</option>
          </select>
        </div>
      </div>

      <!-- Hints Settings -->
      <div class="space-y-4">
        <div class="flex items-center">
          <input 
            type="checkbox" 
            v-model="config.hintsEnabled"
            class="mr-2"
          >
          <label class="text-brown-700">Enable Hints</label>
        </div>
        
        <div v-if="config.hintsEnabled">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="block text-brown-700 mb-2">Hint: Answer too high</label>
              <input 
                type="text" 
                v-model="config.hintTooHigh"
                class="w-full px-3 py-2 border rounded"
              >
            </div>
            
            <div class="form-group">
              <label class="block text-brown-700 mb-2">Hint: Answer too low</label>
              <input 
                type="text" 
                v-model="config.hintTooLow"
                class="w-full px-3 py-2 border rounded"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Time Limit Settings -->
      <div v-if="config.visualizerType==='seesaw'" class="space-y-4">
        <div class="flex items-center">
          <input 
            type="checkbox" 
            v-model="config.timelimitEnabled"
            class="mr-2"
          >
          <label class="text-brown-700">Enable Time Limit</label>
        </div>
        
        <div v-if="config.timelimitEnabled">
          <label class="block text-brown-700 mb-2">Time Limit (seconds)</label>
          <input 
            type="number" 
            v-model.number="config.timelimitSeconds"
            class="w-full px-3 py-2 border rounded"
            min="1"
          >
        </div>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="block text-brown-700 mb-2">Description</label>
        <textarea 
          v-model="config.description"
          class="w-full px-3 py-2 border rounded"
          rows="3"
        ></textarea>
      </div>

      <!-- Star Setting -->
      <div class="flex items-center">
        <input 
          type="checkbox" 
          v-model="config.isStarred"
          class="mr-2"
        >
        <label class="text-brown-700">Star this configuration</label>
      </div>

    <!-- Submit button which is activated when form has been filled with valid data -->
      <button 
        type="submit"
        class="w-fit bg-brown-600 text-white py-2 px-4 rounded hover:bg-brown-700 disabled:opacity-50"
        :disabled="!isValid || !hasChanges"
      >
        {{ !hasChanges ? 'No Changes Made' : 'Create Configuration' }}
      </button>
    </form>
  </div>

  <!-- Result Dialog : option to go home or add another configuration -->
  <div v-if="showResultDialog" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4">Result</h2>
      <p class="mb-6">{{ resultMessage }}</p>
      <div class="flex gap-4">
        <button @click="goToHome" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-xl font-bold transition-colors">
          Home
        </button>
        <button @click="addAnother" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-xl font-bold transition-colors">
          Add Another
        </button>
      </div>
    </div>
  </div>

  <!-- Confirmation dialog shown when exiting Home with unsubmitted form -->
  <div v-if="showConfirmDialog" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4">Confirm</h2>
      <p class="mb-6">You have unsaved changes. Do you want to discard them?</p>
      <div class="flex gap-4">
        <button @click="discardChanges" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-bold transition-colors">
          Discard
        </button>
        <button @click="continueEditing" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors">
          Continue Editing
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from '../stores/userStore';
import { getFirebaseToken } from '../firebaseConfig';
const API_URL = import.meta.env.VITE_API_URL;

export default defineComponent({
name: 'Builder',

setup() {
  const userStore = useUserStore();
  return { userStore };
},

data() {
  return {
    config: {
      gameConfigId: '',
      createdAt: new Date().toISOString(),
      createdBy: '',
      hintsEnabled: true,
      hintTooHigh: 'Too many!',
      hintTooLow: 'Need more!',
      isStarred: false,
      isFlagged: false,
      minSum: 5,
      maxSum: 10,
      numOfAddends: 2,
      numOfQuestions: 3,
      thumbsUps: 0,
      thumbsDowns: 0,
      visualizerEnabled: true,
      visualizerType: 'seesaw',
      description: '',
      timelimitEnabled: false,
      timelimitSeconds: 60,
      lives: 5
    },
    errors: [] as string[],
    showResultDialog: false,
    resultMessage: '',
    showConfirmDialog: false,
    hasUnsavedChanges: false,
    initialConfig: null,
    validationErrors: {} as Record<string, string>,
  };
},

computed: {
  hasChanges(): boolean {
    return JSON.stringify(this.config) !== JSON.stringify(this.initialConfig);
  },
  
  isValid(): boolean {
    this.validationErrors = {};
    
    if (this.config.minSum >= this.config.maxSum) {
      this.validationErrors.minSum = 'Minimum sum must be less than maximum';
    }
    
    if (this.config.minSum < 2) {
      this.validationErrors.minSum = 'Minimum sum must be at least 2';
    }
    
    if (this.config.maxSum > 27) {
      this.validationErrors.maxSum = 'Maximum sum can be at most 27';
    }
    
    
    if(this.config.visualizerType === 'sliding squirrel'){
      this.config.numOfAddends = -1;
    }
    if (this.config.visualizerType === 'seesaw' && (this.config.numOfAddends < 2 || this.config.numOfAddends > 4)) {
      this.validationErrors.numOfAddends = 'Must be between 2 and 4';
    }
    
     if (this.config.numOfQuestions < 1 || this.config.numOfQuestions > 10) {
      this.validationErrors.numOfQuestions = 'Number of questions must be between 1 and 10';
     }
    
    if (this.config.hintsEnabled) {
      if (!this.config.hintTooHigh) {
        this.validationErrors.hintTooHigh = 'Required when hints enabled';
      }
      if (!this.config.hintTooLow) {
        this.validationErrors.hintTooLow = 'Required when hints enabled';
      }
    }

    if (this.config.visualizerType === 'sliding squirrel' && (this.config.lives < 0 || this.config.lives > 10)) {
      this.validationErrors.lives = 'Lives must be between 0 and 10';
    }

    return Object.keys(this.validationErrors).length === 0;
  }
},

mounted() {
  // Store initial config to know if data has been entered - used for exit confirmation and submit button activation
  this.initialConfig = JSON.parse(JSON.stringify(this.config));
},

methods: {
  // Submit form data to backend with auth token in header
  async handleSubmit() {
    if (!this.isValid) return;
    this.config.createdBy=''; // this will be validated in the backend as well
    const token = await getFirebaseToken();
    try {
      const response = await fetch(`${API_URL}/game_configs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : `Bearer ${token}`
        },
        body: JSON.stringify(this.config)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      //show result dialog with game config ID (for demo purposes)
      this.resultMessage = `Game config created successfully: ${result.message}`;
      this.showResultDialog = true;
      this.resetForm();
    } catch (error) {
      console.error('Failed to create game config:', error);
      this.errors.push('Failed to create game configuration');
    }
  },
  // Reset form to initial state for new configuration
  resetForm() {
    this.config = {
      gameConfigId: '',
      createdAt: new Date().toISOString(),
      createdBy: '',
      hintsEnabled: true,
      hintTooHigh: 'Too many!',
      hintTooLow: 'Need more!',
      isStarred: false,
      isFlagged: false,
      minSum: 5,
      maxSum: 10,
      numOfAddends: 2,
      numOfQuestions: 3,
      thumbsUps: 0,
      thumbsDowns: 0,
      visualizerEnabled: true,
      visualizerType: 'seesaw',
      description: '',
      timelimitEnabled: false,
      timelimitSeconds: 60,
      lives: 0
    };
    //reset change & validity tracking variables
    this.hasUnsavedChanges = false;
    this.initialConfig = JSON.parse(JSON.stringify(this.config));
    this.validationErrors = {};
  },

  goToHome() {
    this.$router.push({ name: 'Home' });
  },

  addAnother() {
    this.showResultDialog = false;
  },

  confirmHome() {
    if (this.hasUnsavedChanges) {
      this.showConfirmDialog = true;
    } else {
      this.goToHome();
    }
  },

  discardChanges() {
    this.showConfirmDialog = false;
    this.goToHome();
  },

  continueEditing() {
    this.showConfirmDialog = false;
  }
},

//Vue.js watcher to track changes in form data
watch: {
  config: {
    handler() {
      this.hasUnsavedChanges = true;
    },
    deep: true
  }
}
});
</script>

<style scoped>
* {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.builder-container {
display: flex;
flex-direction: column;
align-items: center;
}

.home-button {
transition: background-color 0.3s;
}

.home-button:hover {
background-color: #e2e8f0;
}

.bg-brown-100 { background-color: #f5f0eb; }
.text-brown-700 { color: #594a42; }
.text-brown-900 { color: #2c1810; }
.bg-brown-600 { background-color: #795548; }
.hover\:bg-brown-700:hover { background-color: #5d4037; }
.bg-brown-100\/90 { 
background-color: rgba(245, 240, 235, 0.95);
}
</style>
