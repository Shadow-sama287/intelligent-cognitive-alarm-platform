import random
from typing import Optional, Dict, Any
from app.db.mongo import mongo_client


class ChallengeService:
    def __init__(self):
        self.collection = mongo_client.get_collection("challenges")

    @staticmethod
    def _normalize_filter(value: Optional[str]) -> Optional[str]:
        if value is None:
            return None

        normalized = str(value).strip().lower()
        if not normalized or normalized == "any":
            return None

        return normalized

    def get_random_challenge(self, category: Optional[str] = None, difficulty: Optional[str] = None) -> Optional[Dict[str, Any]]:
        normalized_category = self._normalize_filter(category)
        normalized_difficulty = self._normalize_filter(difficulty)

        query = {}
        if normalized_category:
            query["category"] = normalized_category
        if normalized_difficulty:
            query["difficulty"] = normalized_difficulty

        challenges = list(self.collection.find(query))

        # Fallback to category only if difficulty match yields 0 results
        if not challenges and normalized_difficulty:
            fallback_query = {key: value for key, value in query.items() if key != "difficulty"}
            challenges = list(self.collection.find(fallback_query))

        # Fallback to any challenge if still empty
        if not challenges:
            challenges = list(self.collection.find({}))

        if not challenges:
            return None

        selected = random.choice(challenges)
        if "_id" in selected:
            selected["_id"] = str(selected["_id"])
        return selected


challenge_service = ChallengeService()