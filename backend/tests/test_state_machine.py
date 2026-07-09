from app.core.state_machine import AlarmStateMachine, AlarmState
from fastapi import HTTPException

print("Testing Valid Transition:")
new_state = AlarmStateMachine.transition(AlarmState.IDLE, AlarmState.RINGING)
print(f"IDLE -> RINGING successful. New state: {new_state}")

print("\nTesting Invalid Transition (should throw exception):")
try:
    AlarmStateMachine.transition(AlarmState.IDLE, AlarmState.SOLVED)
except HTTPException as e:
    print(f"Caught expected HTTP {e.status_code}: {e.detail}")