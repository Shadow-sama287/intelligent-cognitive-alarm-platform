import pandas as pd
import numpy as np

class RecommendationEngine:
    @staticmethod
    def generate_recommendations(breakdown: dict, telemetry_history: list = None) -> list[str]:
        tips = []

        # Pandas/Numpy Behavioral Analytics (Snooze, Wake-up, Sleep patterns)
        if telemetry_history:
            df = pd.DataFrame(telemetry_history)
            if not df.empty and 'snooze_count' in df.columns:
                avg_snooze = np.mean(df['snooze_count'])
                if avg_snooze > 2.0:
                    tips.append(f"You're snoozing an average of {avg_snooze:.1f} times per alarm. Consider an earlier bedtime.")

        if breakdown.get("snooze_reduction", 100) < 70:
            tips.append("You tend to snooze frequently on Mondays. Try setting your bedtime 30 minutes earlier on Sunday night.")

        if breakdown.get("challenge_success", 100) < 80:
            tips.append("Switch your alarm challenge category to 'Memory Matrix' for a gentler morning brain wake-up.")

        if breakdown.get("wake_up_consistency", 100) > 85:
            tips.append("Outstanding wake-up consistency! You qualify for 'Hardcore Mode' to unlock bonus habit points.")

        return tips or ["Keep up your healthy wake-up routine!"]

recommendation_engine = RecommendationEngine()