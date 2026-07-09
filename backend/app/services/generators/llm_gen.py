import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
from sqlalchemy.orm import Session
from app.models.challenge_history import UserChallengeHistory

class LLMChallengeGenerator:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.model_name = "gemini-3.1-flash-lite"
        self.categories = ["math", "memory", "logic", "vocabulary", "trivia", "riddles", "spatial"]

    def generate(self, db: Session, user_id: str, difficulty: str = "medium", category: str = "math") -> dict:
        if category not in self.categories:
            category = "math"

        # Fetch last 10 solved challenges to prevent repeats
        recent_history = db.query(UserChallengeHistory).filter(
            UserChallengeHistory.user_id == user_id,
            UserChallengeHistory.category == category
        ).order_by(UserChallengeHistory.solved_at.desc()).limit(10).all()
        
        avoid_prompts = [h.prompt for h in recent_history]
        avoid_instruction = f"Do NOT generate any of these exact questions: {avoid_prompts}" if avoid_prompts else ""

        prompt = f"""
        Generate a unique cognitive challenge for an alarm clock app.
        Category: {category}
        Difficulty: {difficulty} (Scale: beginner, easy, medium, hard, expert)
        {avoid_instruction}
        
        For 'memory', provide a sequence of items to remember. For 'spatial', provide a mental rotation or direction puzzle.
        """

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "title": types.Schema(type=types.Type.STRING),
                        "prompt": types.Schema(type=types.Type.STRING, description="The puzzle question"),
                        "correct_answer": types.Schema(type=types.Type.STRING, description="The exact exact string expected as answer"),
                        "time_limit_seconds": types.Schema(type=types.Type.INTEGER)
                    },
                    required=["title", "prompt", "correct_answer", "time_limit_seconds"]
                ),
            ),
        )

        data = json.loads(response.text)
        data["category"] = category
        data["difficulty"] = difficulty
        data["content_data"] = {"generated_by": "gemini"}
        return data

llm_gen = LLMChallengeGenerator()