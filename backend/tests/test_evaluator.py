import time
from app.services.evaluation_service import evaluator_service

# Simulate a session that started 30 seconds ago with a 60s limit
session = {
    "start_time": time.time() - 30,
    "time_limit_seconds": 60
}

# No penalty (60s limit > 30s elapsed -> Not Expired)
print("No Penalty:", evaluator_service.is_time_expired(session, 0))

# 15s penalty (45s limit > 30s elapsed -> Not Expired)
print("15s Penalty:", evaluator_service.is_time_expired(session, 15))

# 45s penalty (15s limit < 30s elapsed -> Expired!)
print("45s Penalty:", evaluator_service.is_time_expired(session, 45))