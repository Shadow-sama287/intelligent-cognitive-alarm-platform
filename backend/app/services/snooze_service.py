class AntiSnoozeService:
    DIFFICULTY_TIERS = ["beginner", "easy", "medium", "hard", "expert"]

    @classmethod
    def calculate_snooze_penalty(
        cls, 
        current_difficulty: str, 
        snooze_count: int,
        snooze_limit: int = 3,
        escalate_difficulty: bool = True,
        time_penalty_enabled: bool = True
    ) -> dict:
        curr_idx = cls.DIFFICULTY_TIERS.index(current_difficulty.lower()) if current_difficulty.lower() in cls.DIFFICULTY_TIERS else 2
        
        next_difficulty = current_difficulty
        if escalate_difficulty:
            # Escalate difficulty by 1 index per snooze
            next_idx = min(curr_idx + 1, len(cls.DIFFICULTY_TIERS) - 1)
            next_difficulty = cls.DIFFICULTY_TIERS[next_idx]
        
        time_penalty_seconds = 0
        if time_penalty_enabled:
            # Decrease time limit by 15 seconds per snooze
            time_penalty_seconds = snooze_count * 15

        return {
            "new_difficulty": next_difficulty,
            "time_penalty_seconds": time_penalty_seconds,
            "snooze_allowed": snooze_count <= snooze_limit
        }

snooze_service = AntiSnoozeService()