import time

class TimePenaltyEvaluator:
    @staticmethod
    def is_time_expired(session_data: dict, time_penalty_seconds: int = 0) -> bool:
        start_time = session_data.get("start_time", time.time())
        base_time_limit = session_data.get("time_limit_seconds", 60)
        
        # Apply the snooze penalty to their total allowed time
        actual_time_limit = max(10, base_time_limit - time_penalty_seconds)
        
        time_elapsed = time.time() - start_time
        
        return time_elapsed > actual_time_limit

evaluator_service = TimePenaltyEvaluator()