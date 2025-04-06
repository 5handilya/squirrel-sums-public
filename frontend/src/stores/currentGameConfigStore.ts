import { defineStore } from 'pinia';

export interface GameConfig {
    gameConfigId: string;
    createdBy: string;
    minSum: number;
    maxSum: number;
    numOfAddends: number;
    numOfQuestions: number;
    createdAt: string;  // datetime as string
    visualizerEnabled: boolean;
    visualizerType: string;
    hints_enabled: boolean;
    hint_too_high: string;
    hint_too_low: string;
    description: string;
    isFlagged: boolean;
    isStarred: boolean;
    thumbsDowns: number;
    thumbsUps: number;
    timelimitEnabled: boolean;
    timelimitSeconds: number;
    lives: number; //added for sliding squirrel game mode. 0 = inf.  
}

export const useCurrentGameConfigStore = defineStore('currentGameConfig', {
    state: () => ({
        gameConfigId: '',
        createdBy: '',
        minSum: 0,
        maxSum: 0,
        numOfAddends: 2,
        numOfQuestions: 0,
        createdAt: '',
        visualizerEnabled: false,
        visualizerType: 'seesaw',
        hintsEnabled: false,
        hintTooHigh: '',
        hintTooLow: '',
        description: '',
        isFlagged: false,
        isStarred: false,
        thumbsDowns: 0,
        thumbsUps: 0,
        timelimitEnabled: false,
        timelimitSeconds: 0,
        lives: -1, // -1 default because 0 = inf lives
    }),
    actions: {
        setGameConfig(config: GameConfig) {
            Object.assign(this, config);
            localStorage.setItem('currentGameConfig', JSON.stringify(config));
        },
        loadFromLocalStorage() {
            const stored = localStorage.getItem('currentGameConfig');
            if (stored) {
                console.log("gameConfigStore found locally saved config");
                const config = JSON.parse(stored);
                Object.assign(this, config);
            }
        }
    }
}); 