import { defineStore } from 'pinia';

export enum UserType {
    ADMIN = 'admin',
    STUDENT = 'student',
    GUEST = 'guest'
}

interface UserState {
    userId: string;
    email: string | null;
    displayName: string;
    userType: UserType;
    level: number;
    xp: number;
    isBanned: boolean,
    completedTutorial: boolean;
    unlockedArena: boolean;
}

// Storage key for local storage
const STORAGE_KEY = 'userStore';

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        userId: localStorage.getItem('userId') || '',
        email: null,
        userType: UserType.GUEST,
        displayName: '',
        level: -1, //used in home.vue to see if state exists in pinia
        xp: 0,
        isBanned: false,
        completedTutorial: false,
        unlockedArena: false,
    }),

    getters: {
        isLoggedIn: (state): boolean => !!state.userId,
        isAdmin: (state): boolean => state.userType === UserType.ADMIN,
        canAccessArena: (state): boolean => 
            state.unlockedArena && state.completedTutorial,
        displayNameOrGuest: (state): string => 
            state.displayName || 'Guest User',
        userProgress: (state): string => 
            `Level: ${state.level}, XP: ${state.xp}`,
    },

    actions: {
        setUserId(userId: string) {
            this.userId = userId;
        },
        //might deprecate email
        setUserEmail(userEmail: string) {
            this.email = userEmail;
        },
        setUserDisplayName(userDisplayName: string) {
            this.displayName = userDisplayName;
        },
        setUserType(userType: UserType) {
            this.userType = userType;
        },
        setLevel(level: number) {
            this.level = level;
        },
        setXp(xp: number) {
            this.xp = xp;
        },
        setIsBanned(isBanned: boolean) {
            this.isBanned = isBanned;
        },
        setHasCompletedTutorial(hasCompleted: boolean) {
            this.completedTutorial = hasCompleted;
        },
        setHasUnlockedArena(hasUnlocked: boolean) {
            this.unlockedArena = hasUnlocked;
        },
        saveToLocalStorage(): void {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state));
                console.log("User data saved to local storage.");
            } catch (error) {
                console.error('Error saving user data:', error);
            }
        },
        loadFromLocalStorage(): boolean {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const data = JSON.parse(stored) as Partial<UserState>;
                    this.$patch(data);
                    console.log("User data loaded from local storage.");
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error loading user data:', error);
                return false;
            }
        }
    }
});