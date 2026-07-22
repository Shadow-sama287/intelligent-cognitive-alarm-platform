from app.ml.dda_engine import dda_engine

def test_dda_predictions():
    # 1. Fast solver -> Expert
    fast_history = [
        {"solve_time": 10.0, "attempts": 1, "snooze_count": 0} for _ in range(5)
    ]
    assert dda_engine.predict_next_difficulty(fast_history) == "expert"
    print("Fast history correctly returned 'expert'")

    # 2. Slow/snoozing solver -> Beginner
    slow_history = [
        {"solve_time": 60.0, "attempts": 3, "snooze_count": 3} for _ in range(5)
    ]
    assert dda_engine.predict_next_difficulty(slow_history) == "beginner"
    print("Slow history correctly returned 'beginner'")

if __name__ == "__main__":
    test_dda_predictions()
