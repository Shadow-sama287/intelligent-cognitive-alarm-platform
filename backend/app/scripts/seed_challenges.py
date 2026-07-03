from app.db.mongo import mongo_client
from app.models.challenge import ChallengeCategory, DifficultyLevel
from datetime import datetime

sample_challenges = [
    {
        "title": "Quick Arithmetic",
        "category": ChallengeCategory.MATH,
        "difficulty": DifficultyLevel.EASY,
        "time_limit_seconds": 30,
        "prompt": "What is 14 * 6 + 12?",
        "content_data": {"equation": "14 * 6 + 12"},
        "correct_answer": "96",
        "hints": ["Multiply 14 by 6 first (84), then add 12"],
        "tags": ["math", "arithmetic"],
        "created_at": datetime.utcnow()
    },
    {
        "title": "Classic Riddle",
        "category": ChallengeCategory.RIDDLE,
        "difficulty": DifficultyLevel.MEDIUM,
        "time_limit_seconds": 45,
        "prompt": "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        "content_data": {"type": "riddle_text"},
        "correct_answer": "echo",
        "hints": ["It repeats sound"],
        "tags": ["riddle", "logic"],
        "created_at": datetime.utcnow()
    },
    {
        "title": "Number Sequence",
        "category": ChallengeCategory.PATTERN,
        "difficulty": DifficultyLevel.MEDIUM,
        "time_limit_seconds": 40,
        "prompt": "Find the next number: 2, 4, 8, 16, 32, ?",
        "content_data": {"sequence": [2, 4, 8, 16, 32]},
        "correct_answer": "64",
        "hints": ["Each number doubles"],
        "tags": ["pattern", "numbers"],
        "created_at": datetime.utcnow()
    }
]

def seed_db():
    challenges_col = mongo_client.get_collection("challenges")
    challenges_col.delete_many({}) # Clear existing
    result = challenges_col.insert_many(sample_challenges)
    print(f"Successfully seeded {len(result.inserted_ids)} cognitive challenges into MongoDB!")

if __name__ == "__main__":
    seed_db()