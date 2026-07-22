class DynamicDifficultyEngine:
    TIERS = ["beginner", "easy", "medium", "hard", "expert"]

    def predict_next_difficulty(self, history: list[dict]) -> str:
        if not history:
            return "medium" # Default initial recommendation

        total_score = 0.0
        for record in history:
            time_penalty = max(0, (record["solve_time"] - 15) / 45) # 15s optimal
            attempt_penalty = (record["attempts"] - 1) * 0.25
            snooze_penalty = record["snooze_count"] * 0.3

            # Calculate individual session score (1.0 = perfect speed & zero errors)
            session_score = max(0.0, 1.0 - (time_penalty + attempt_penalty + snooze_penalty))
            total_score += session_score

        avg_score = total_score / len(history)

        # Map average score to tier
        if avg_score >= 0.85:
            return "expert"
        elif avg_score >= 0.70:
            return "hard"
        elif avg_score >= 0.50:
            return "medium"
        elif avg_score >= 0.30:
            return "easy"
        else:
            return "beginner"

dda_engine = DynamicDifficultyEngine()