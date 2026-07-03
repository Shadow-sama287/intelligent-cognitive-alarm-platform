import enum
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ChallengeCategory(str, enum.Enum):
    MATH = "math"
    LOGIC = "logic"
    MEMORY = "memory"
    WORD_GAME = "word_game"
    PATTERN = "pattern"
    RIDDLE = "riddle"
    QUIZ = "quiz"

class DifficultyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"

class CognitiveChallengeModel(BaseModel):
    title: str
    category: ChallengeCategory
    difficulty: DifficultyLevel
    time_limit_seconds: int = 60
    prompt: str
    content_data: Dict[str, Any]  # Dynamic payload (e.g., math formula, puzzle options, memory sequence)
    correct_answer: str
    hints: List[str] = []
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)