import enum
from fastapi import HTTPException

class AlarmState(str, enum.Enum):
    IDLE = "idle"
    RINGING = "ringing"
    SNOOZED = "snoozed"
    SOLVED = "solved"
    FAILED = "failed"

class AlarmStateMachine:
    VALID_TRANSITIONS = {
        AlarmState.IDLE: [AlarmState.RINGING],
        AlarmState.RINGING: [AlarmState.SNOOZED, AlarmState.SOLVED, AlarmState.FAILED],
        AlarmState.SNOOZED: [AlarmState.RINGING],
        AlarmState.SOLVED: [AlarmState.IDLE],
        AlarmState.FAILED: [AlarmState.RINGING, AlarmState.IDLE]
    }

    @classmethod
    def transition(cls, current_state: AlarmState, new_state: AlarmState) -> AlarmState:
        allowed = cls.VALID_TRANSITIONS.get(current_state, [])
        if new_state not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid state transition from {current_state} to {new_state}"
            )
        return new_state