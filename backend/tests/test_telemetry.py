import uuid
import time
from app.db.session import engine, Base, SessionLocal
from app.models.user import User, Role
from app.models.telemetry import SolveTelemetry
from app.services.telemetry_service import telemetry_service

# Ensure all tables (users, solve_telemetry) exist in PostgreSQL
Base.metadata.create_all(bind=engine)

def run_test():
    db = SessionLocal()
    
    # 1. Create a dummy user in PostgreSQL to satisfy the foreign key constraint
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email=f"test_{user_id.hex[:8]}@example.com",
        hashed_password="fakehashpassword",
        full_name="Telemetry Test User",
        role=Role.USER
    )
    db.add(dummy_user)
    db.commit()
    db.close()

    print(f"Testing telemetry service with user_id: {user_id}\n")

    # 2. Insert 3 dummy telemetry records
    records_data = [
        {"category": "math", "difficulty": "easy", "solve_time": 12.5, "attempts": 1, "snooze_count": 0},
        {"category": "logic", "difficulty": "medium", "solve_time": 25.0, "attempts": 2, "snooze_count": 1},
        {"category": "memory", "difficulty": "hard", "solve_time": 45.2, "attempts": 3, "snooze_count": 2},
    ]

    for idx, data in enumerate(records_data, start=1):
        print(f"Inserting record {idx}: {data['category']} ({data['difficulty']})...")
        telemetry_service.log_solve(
            user_id=user_id,
            category=data["category"],
            difficulty=data["difficulty"],
            solve_time=data["solve_time"],
            attempts=data["attempts"],
            snooze_count=data["snooze_count"]
        )
        time.sleep(0.2)  # ensure timestamp separation

    # 3. Retrieve records (should be sorted by created_at DESC)
    print("\nFetching user solve history...")
    history = telemetry_service.get_user_solve_history(user_id=user_id, limit=10)
    
    print(f"Retrieved {len(history)} records:")
    for idx, r in enumerate(history, start=1):
        print(f"  {idx}. Difficulty: {r['difficulty']}, Solve Time: {r['solve_time']}s, Attempts: {r['attempts']}, Snoozes: {r['snooze_count']}")

    # Validation assertions
    assert len(history) == 3, f"Expected 3 records, got {len(history)}"
    assert history[0]["difficulty"] == "hard", f"Expected newest record difficulty 'hard', got {history[0]['difficulty']}"

    print("\nVerification successful! Telemetry records inserted and retrieved in correct descending timestamp order.")

if __name__ == "__main__":
    run_test()
