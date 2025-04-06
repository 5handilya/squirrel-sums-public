/** authServices.ts contains functions for user authentication and user data management
    It is a helper for firebaseConfig.ts so that file only contains core firestore functions

    The main methods included are:
    1. loginWithGoogle/Email() - handles the "user" returned by the firebase login function (E-mail not currently implemented)
    2. createUserIfNotExists() - the backend checks if user exists for the given ID in firestore and creates a new user with default values if not
    3. fetchUserData() - fetches the user Doc from firestore for the given ID
    4. logout() - signs out the user and clears the local storage and pinia store
    5. loadUserFromLocalStorage() - loads the user data from local storage to pinia store
*/


import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { useUserStore } from './stores/userStore';
import { useCurrentGameConfigStore } from './stores/currentGameConfigStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();
    
    // here, the backend handles user creation with default values if user does not exist
    // extend to signup flow here
    await axios.post(`${API_URL}/users/login_or_register`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userData = await fetchUserData(user.uid);
    localStorage.setItem('userStore', JSON.stringify(userData));

    return user;

  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // await createUserIfNotExists(user.uid);
    const userData = await fetchUserData(user.uid);
    localStorage.setItem('userStore', JSON.stringify(userData));
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//fetch user data from firestore
export const fetchUserData = async (uid: string) => {
  console.log("AuthServ: fetching user data from firestore");
  const userDoc = doc(db, 'users', uid);
  const userSnapshot = await getDoc(userDoc);
  if (userSnapshot.exists()) {
    console.log("AuthServ: user data fetched from firestore", userSnapshot.data());
    return userSnapshot.data();
  } else {
    throw new Error('User does not exist');
  }
};

//firebase signout and clear local storage + pinia
export const logout = async () => {
  try {
    const userStore = useUserStore();
    const currentGameConfigStore= useCurrentGameConfigStore();
    await signOut(auth);
    localStorage.removeItem('userStore');
    localStorage.removeItem('userId');
    localStorage.removeItem('currentGameConfig');
    userStore.$reset();
    currentGameConfigStore.$reset();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//restores both user ID and userData from local storage to pinia
export function loadUserFromLocalStorage() {
  const userStore = useUserStore();
  const currentGameConfigStore = useCurrentGameConfigStore();
  const storedUser = localStorage.getItem('userStore');
  const storedUid = localStorage.getItem('userId');
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    console.log("authService reads user info from local storage: ", userData);
    if (storedUid){
      userStore.setUserId(storedUid);
    }
    userStore.setUserEmail(userData.email);
    userStore.setUserDisplayName(userData.displayName);
    userStore.setUserType(userData.userType);
    userStore.setLevel(userData.level);
    userStore.setXp(userData.xp);
    userStore.setIsBanned(userData.isBanned);
    userStore.setHasCompletedTutorial(userData.hasCompletedTutorial);
    userStore.setHasUnlockedArena(userData.hasUnlockedArena);
    console.log("user info rewritten to pinia from loadPiniaFunc", userStore.userId);
  } else {
    console.log("cant load pinia from local storage: no local user store found");
  }

  // Load game config
  currentGameConfigStore.loadFromLocalStorage();
}