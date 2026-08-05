import pandas as pd
import numpy as np

class RecommendationEngine:
    @staticmethod
    def generate_recommendations(
        breakdown: dict,
        telemetry_history: list = None
    ) -> list[str]:
        tips = []

        # Pandas/Numpy Behavioral Analytics
        if telemetry_history:
            df = pd.DataFrame(telemetry_history)

            if not df.empty:

                if "snooze_count" in df.columns:
                    avg_snooze = np.mean(df["snooze_count"])
                    if avg_snooze > 2.0:
                        tips.append(
                            f"You're snoozing an average of {avg_snooze:.1f} times per alarm. Consider an earlier bedtime."
                        )

                if "solve_time" in df.columns:
                    avg_time = np.mean(df["solve_time"])
                    if avg_time > 45:
                        tips.append(
                            "Your average puzzle solve time is high. Try starting with easier challenges to build consistency."
                        )

                if "attempts" in df.columns:
                    avg_attempts = np.mean(df["attempts"])
                    if avg_attempts > 2:
                        tips.append(
                            "You often require multiple attempts to solve challenges. Regular practice can improve your morning performance."
                        )

        if breakdown.get("snooze_reduction", 100) < 70:
            tips.append(
                "You tend to snooze frequently on Mondays. Try setting your bedtime 30 minutes earlier on Sunday night."
            )

        if breakdown.get("challenge_success", 100) < 80:
            tips.append(
                "Switch your alarm challenge category to 'Memory Matrix' for a gentler morning brain wake-up."
            )

        if breakdown.get("wake_up_consistency", 100) > 85:
            tips.append(
                "Outstanding wake-up consistency! You qualify for 'Hardcore Mode' to unlock bonus habit points."
            )

        return tips or ["Keep up your healthy wake-up routine!"]


recommendation_engine = RecommendationEngine()