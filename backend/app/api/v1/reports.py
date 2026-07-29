import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
import pandas as pd
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/excel")
def export_excel_report(current_user: User = Depends(get_current_user)):
    data = [
        {"Date": "2026-07-01", "Wake Time": "07:00 AM", "Puzzle Category": "Math", "Solved (s)": 14, "Snoozed": 0},
        {"Date": "2026-07-02", "Wake Time": "07:05 AM", "Puzzle Category": "Logic", "Solved (s)": 22, "Snoozed": 1},
    ]
    df = pd.DataFrame(data)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Habit Report")
    output.seek(0)

    headers = {"Content-Disposition": f'attachment; filename="habit_report_{current_user.id}.xlsx"'}
    return StreamingResponse(output, headers=headers, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
