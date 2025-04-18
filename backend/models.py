

from pydantic import BaseModel
from datetime import datetime
from typing import Tuple

class User(BaseModel):
    user_id: str
    account_type: str  # 'admin' or 'student'
    xp: int
    level: int

class GameConfig(BaseModel):
    gameConfigId: str
    createdAt: datetime
    createdBy: str
    minSum: int
    maxSum: int
    numOfAddends: int
    numOfQuestions: int
    visualizerEnabled: bool
    visualizerType: str # only 'seesaw' atm, but expandable
    lives: int # added with sliding squirrel mode. ranges from 0 to n, 0 meaning inf
    hintsEnabled: bool
    hintTooHigh: str
    hintTooLow: str
    description: str
    isFlagged: bool
    isStarred: bool
    thumbsDowns: int
    thumbsUps: int
    timelimitEnabled: bool
    timelimitSeconds: int

class GameLog(BaseModel): #ID of log autogenerated
    gameLogTimestamp: datetime
    gameConfigId: str
    userId: str
    numQuestions: int
    numAttempted: int
    numCorrect: int
    timeElapsed: int
