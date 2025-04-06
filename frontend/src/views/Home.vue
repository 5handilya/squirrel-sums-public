<!-- This view is the Home page of the game. It displays a wooden signpost with two buttons: Play and Builder (for admins only) -->
<!-- The UI also shows Login status and a logout button -->
<!-- Most importantly, we fetch the next game using fetchNextGame() -->

<template>
    <div class="game-container">
        <!-- Add Top Bar -->
        <div class="fixed top-0 w-full flex justify-between items-center p-4 z-50">

            <!-- Music Control - To be implemented later -->
            <!-- <button @click="toggleMusic" 
                    class="w-12 h-12 rounded-full border-4 border-white bg-green-400 hover:bg-green-500 transition-all flex items-center justify-center">
                <img :src="isMusicPlaying ? '/src/assets/sound_on.png' : '/src/assets/sound_off.png'" 
                     alt="Sound" class="w-6 h-6">
            </button> -->

            <!-- User Info and Logout -->
            <div class="w-full flex flex-row justify-between items-center gap-4 z-50">
                <span class="text-white text-lg font-bold drop-shadow-lg">
                    Signed in as: {{ userStore.displayName }}
                </span>
                <button @click="logoutFromHome" 
                        class="logout-button w-fit h-fit p-2 rounded transition-all flex items-center justify-center">
                        Logout
                </button>
            </div>
        </div>

        <!-- Background Image -->
        <div class="forest-background"></div>
        
        <!-- Wooden Sign -->
        <div class="sign-container">
            <img src="/src/assets/home_plaque.png" alt="Wooden sign" class="wooden-sign">
            
            <!-- Buttons Container -->
            <div class="buttons-container">
                <!-- While not optimal to check if user type is builder using userstore and not the backend, I chose to go with the store here in favor of responsiveness. We will check userType with the backend when routing to Builder.vue and while receiving its submissions, so we should be good. -->
                <button v-if="userStore.userType === 'admin'" 
                        @click="startBuilder" 
                        class="builder-button py-0 px-4 rounded">
                    Builder
                </button>
                <button @click="startGame" 
                        class="start-button py-0 px-8 rounded text-xl">
                    Play
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useCurrentGameConfigStore } from '../stores/currentGameConfigStore';
import { logout } from '../authService';
import { getFirebaseToken } from '../firebaseConfig';
import axios from 'axios';

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    console.log("UserStore level read in Home.vue:", userStore.level);
    const currentGameConfigStore = useCurrentGameConfigStore();
    const isMusicPlaying = ref(false);
    const audio = new Audio('/src/assets/home_background.mp3');
    audio.loop = true;

    const toggleMusic = () => {
    //   isMusicPlaying.value = !isMusicPlaying.value;
    //   if (isMusicPlaying.value) {
    //     audio.play();
    //   } else {
    //     audio.pause();
    //   }
    };

    const fetchNextGame = async () => {
      try {
        const token = await getFirebaseToken();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/nextGame`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
          }
        );
        if (response.status !== 200) {
          throw new Error('Failed to fetch next game');
        }
        const gameConfig = response.data;
        console.log('Next game config:', gameConfig);
        currentGameConfigStore.setGameConfig(gameConfig);
      } catch (error) {
        console.error('Error fetching next game:', error);
      }
    };

    onMounted(async () => {
      if (userStore.level === -1) {
        if(userStore.loadFromLocalStorage()){
            console.log("User data loaded from local storage");
        }
        else{
            console.log("ERROR: User data not found in local storage");
        }
      }
      // Upon creation, fetch next game if user is logged in
      if (userStore.userId) {
        console.log("Fetching next game...");
        await fetchNextGame();
      }
    });

    return {
      userStore,
      currentGameConfigStore,
      isMusicPlaying,
      toggleMusic,
      fetchNextGame
    };
  },
  methods: {
    startGame() {
      if (this.currentGameConfigStore.visualizerEnabled){
        if (this.currentGameConfigStore.visualizerType==='sliding squirrel'){
          this.$router.push({ name: 'GameSlidingSquirrel' });
        }
        else if (this.currentGameConfigStore.visualizerType === 'seesaw'){
          this.$router.push({ name: 'GameSeeSaw' });
        }
      }
    },
    startBuilder() {
      this.$router.push({ name: 'Builder' });
    },
    logoutFromHome() {
      logout();
      window.location.reload();
    }
  }
});
</script>

<style scoped>
.start-button {
  background-color: #d00000;
  color: #ffffff;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}
.start-button:hover {
  background-color: #ff0d0d;
}
.builder-button {
  background-color: #fffafa;
  color: #220000;
  border-radius: 0.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}
.builder-button:hover {
  background-color: #ffe6e6;
}
.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.forest-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/src/assets/home_background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.sign-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wooden-sign {
  margin-top: 50px;
  width: 75%;
  height: 100%; 
}

.logout-button {
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background-color: #700000;
}

.buttons-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, +150%);
  display: flex;
  gap: 2rem;
  justify-content: center;
  width: 100%;
}

/* 1080p specific adjustments */
@media (min-width: 1920px) {
  .sign-container {
    max-width: 800px;
  }
  
  .wooden-sign {
    max-width: 600px;
  }
  
  .game-button {
    font-size: 1.5rem;
    padding: 1.25rem 2.5rem;
  }
}
</style>