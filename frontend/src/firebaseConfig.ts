/**
 * firebaseConfig: Firebase configuration object with API key and other details
 * 
 * methods:
 * 1. getFirebaseToken(): returns the Firebase token for the current user
 * 2. onAuthStateChanged(): listens for changes in the user's sign-in state to persist login
 * 3. setPersistence(): sets the local persistence for the user's login state
 */

import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { fetchUserData } from './authService';

// Firebase configuration with environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set local persistence for user login
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Local persistence set');
  })
  .catch((error) => {
    console.error(error);
  });

// Listen for changes in user sign-in state - useful when user refreshes the page
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('AuthStateChange: User is signed in. ID:', user.uid);
    fetchUserData(user.uid);
  } else {
    console.log('AuthStateChanged: User is signed out');
  }
});

// Get Firebase access token for the current user
export async function getFirebaseToken(): Promise<string> {
    // wait for auth completion
    const currentUser = auth.currentUser || await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
    if (!currentUser) {
        throw new Error('No user is signed in');
    }
    try {
        const token = await currentUser.getIdToken();
        return token;
    } catch (error) {
        console.error('Error getting Firebase token:', error);
        throw error;
    }
}
export { auth, db };