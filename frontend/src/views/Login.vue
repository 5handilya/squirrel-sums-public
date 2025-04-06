<!-- This view allows logging in with Google -->
<!-- E-mail login has not been implemented at the moment but should be easy to -->
<!-- The login flow involves fetching the firebase token, extracting the user id from it (both using functions provided by authServices.ts), and storing the pulled data to pinia (userStore) and local storage -->

<template>
  <div class="login-container flex items-center justify-center min-h-screen bg-cover bg-center"
       style="background-image: url('/src/assets/home_background.png')">
    <div class="login-box bg-center bg-contain bg-no-repeat p-8 w-full max-w-md">
      <!-- Wooden Sign -->
      <div class="sign-container">
        <img src="/src/assets/home_plaque.png" alt="Wooden sign" class="wooden-sign">
        <div class="buttons-container">
            <button @click="loginWithGoogle" class="w-fit text-xl bg-red-500 text-white py-2 px-4 rounded mb-4 flex items-center justify-center">
              Login with Google
            </button>
        </div>
      </div>
      
      <!-- Email login section - Hidden at the moment -->
      <!-- <div class="flex items-center justify-between mb-4">
        <hr class="w-full border-gray-300" />
        <span class="px-2 text-gray-500">or</span>
        <hr class="w-full border-gray-300" />
      </div>
      <form @submit.prevent="loginWithEmail">
        <div class="mb-4">
          <label for="email" class="block text-gray-700">Email</label>
          <input type="email" v-model="email" id="email" class="w-full px-3 py-2 border rounded" placeholder="Email" required />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700">Password</label>
          <input type="password" v-model="password" id="password" class="w-full px-3 py-2 border rounded" placeholder="Password" required />
        </div>
        <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded">Login with Email</button>
      </form> -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { loginWithGoogle, loginWithEmail, fetchUserData } from '../authService';
import { useUserStore } from '../stores/userStore';

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  data() {
    return {
      //used for loginWithEmail
      email: '',
      password: ''
    };
  },
  methods: {
    //two main methods: loginWithGoogle and loginWithEmail
    async loginWithGoogle() {
      try {
        //user returned by the authService login method
        const user = await loginWithGoogle();
        //firebase data pulled using the authService method
        const userData = await fetchUserData(user.uid);
        console.log("Login.vue reads user data: ", userData);
        console.log("Login.vue storing ID:", user.uid);
        //we always store the uid to the userStore along with other firestore data
        //we are basically storing the key of the user document fields in the userStore with them
        this.userStore.setUserId(user.uid);
        if (user.displayName){
          this.userStore.setUserDisplayName(userData.displayName);
        }
        if (user.email){
          this.userStore.setUserEmail(user.email);
        }
        this.userStore.setUserType(userData.userType);
        this.userStore.setLevel(userData.level);
        this.userStore.setXp(userData.xp);
        this.userStore.setIsBanned(userData.isBanned);
        this.userStore.setHasCompletedTutorial(userData.hasCompletedTutorial);
        this.userStore.setHasUnlockedArena(userData.hasUnlockedArena);

        //we store the user data in localStorage as well
        localStorage.setItem('userStore', JSON.stringify(userData));
        localStorage.setItem('userId', user.uid);

        //lastly, we redirect to the home page
        this.$router.push({ name: 'Home' });

      } catch (error) {
        console.error(error);
      }
    },
    async loginWithEmail() {
      try {
        const user = await loginWithEmail(this.email, this.password);
        const userData = await fetchUserData(user.uid);
        this.userStore.setUserId(user.uid);
        //todo : store email
        this.userStore.setUserType(userData.userType);
        this.userStore.setLevel(userData.level);
        this.userStore.setXp(userData.xp);
        this.userStore.setIsBanned(userData.isBanned);
        this.userStore.setHasCompletedTutorial(userData.hasCompletedTutorial);
        this.userStore.setHasUnlockedArena(userData.hasUnlockedArena);
        this.$router.push({ name: 'Home' });

      } catch (error) {
        console.error(error);
      }
    }
  }
});
</script>

<style scoped>
.login-container {
  background-size: cover;
  background-position: center;
  background-color: #f7fafc;
}
.login-box {
  min-height: 400px;
  padding-top: 60px;
  max-width: 400px;
  width: 100%;
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
</style>