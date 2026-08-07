import io
from datetime import datetime, timezone
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)

from app.db.session import get_db
from app.models.user import User, Role, UserProfile
from app.models.telemetry import SolveTelemetry
from app.models.challenge_history import UserChallengeHistory
from app.models.alarm import Alarm
from app.api.deps import get_current_user
from app.services.habit_service import habit_service, HabitScoringService
from app.services.telemetry_service import telemetry_service
from app.ml.recommendation_engine import recommendation_engine

router = APIRouter()


def _get_target_user(
    user_id_param: Optional[str],
    current_user: User,
    db: Session,
) -> User:
    """Helper to enforce role permissions when querying target user report data."""
    if not user_id_param or user_id_param == str(current_user.id):
        return current_user

    if current_user.role not in [Role.ADMIN, Role.COACH]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to export reports for other users.",
        )

    try:
        target_uuid = uuid.UUID(user_id_param)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id UUID format."
        )

    target_user = db.query(User).filter(User.id == target_uuid).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found."
        )

    return target_user


@router.get("/export/pdf")
async def export_pdf_report(
    user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates a professionally formatted PDF sleep & habit summary report using ReportLab.
    Includes 7-day daily solve & snooze logs, cognitive sector performance, and configured alarm schedules.
    Allows Coaches/Admins to pull reports for target users via `user_id`.
    """
    target_user = _get_target_user(user_id, current_user, db)

    # 1. Fetch Habit Score & Analytics Data
    score_data = habit_service.calculate_habit_score(target_user.id)
    overall_score = score_data.get("habit_score", 0.0)
    breakdown = score_data.get("breakdown", {})

    streak_days = HabitScoringService.calculate_streak_days(db, target_user.id)
    history = telemetry_service.get_user_solve_history(target_user.id, limit=10)
    recommendations = recommendation_engine.generate_recommendations(score_data, history)
    trends = telemetry_service.get_daily_trends(target_user.id, days=7)
    cat_perf = telemetry_service.get_category_performance(target_user.id, days=30)
    user_alarms = db.query(Alarm).filter(Alarm.user_id == target_user.id).all()

    # 2. Extract Profile & Sleep Config
    profile: Optional[UserProfile] = target_user.profile
    pref_wake = profile.preferred_wake_time if profile else "07:00"
    target_sleep = f"{profile.target_sleep_hours} hrs" if profile else "8.0 hrs"
    timezone_str = profile.time_zone if profile else "UTC"
    productivity_goals = (profile.productivity_goals if profile and profile.productivity_goals else "General Consistency")

    # 3. Build PDF Document with ReportLab
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1E293B"),
        fontName="Helvetica-Bold",
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748B"),
        fontName="Helvetica",
        spaceAfter=12,
    )
    section_title = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0F172A"),
        fontName="Helvetica-Bold",
        spaceBefore=10,
        spaceAfter=6,
    )
    cell_bold = ParagraphStyle(
        "CellBold",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=11,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#334155"),
    )
    cell_normal = ParagraphStyle(
        "CellNormal",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=11,
        fontName="Helvetica",
        textColor=colors.HexColor("#1E293B"),
    )
    rec_title = ParagraphStyle(
        "RecTitle",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=11,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#2563EB"),
    )

    story = []

    # Title Banner
    story.append(
        Paragraph("Intelligent Cognitive Alarm — Sleep & Habit Summary Report", title_style)
    )
    generated_at_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
    story.append(
        Paragraph(
            f"Generated for: <b>{target_user.full_name}</b> ({target_user.email}) | Date: {generated_at_str}",
            subtitle_style,
        )
    )
    story.append(
        HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceAfter=10)
    )

    # Section 1: User Profile & Sleep Schedule
    story.append(Paragraph("1. User Information & Sleep Schedule", section_title))
    user_info_data = [
        [
            Paragraph("Full Name", cell_bold),
            Paragraph(target_user.full_name or "N/A", cell_normal),
            Paragraph("Preferred Wake Time", cell_bold),
            Paragraph(pref_wake, cell_normal),
        ],
        [
            Paragraph("Email", cell_bold),
            Paragraph(target_user.email, cell_normal),
            Paragraph("Target Sleep Hours", cell_bold),
            Paragraph(target_sleep, cell_normal),
        ],
        [
            Paragraph("Timezone", cell_bold),
            Paragraph(timezone_str, cell_normal),
            Paragraph("Current Streak", cell_bold),
            Paragraph(f"{streak_days} days", cell_normal),
        ],
        [
            Paragraph("Role", cell_bold),
            Paragraph(str(target_user.role.value if hasattr(target_user.role, 'value') else target_user.role), cell_normal),
            Paragraph("Productivity Goal", cell_bold),
            Paragraph(productivity_goals, cell_normal),
        ],
    ]
    user_info_table = Table(user_info_data, colWidths=[110, 160, 130, 140])
    user_info_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1E293B")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("PADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ]
        )
    )
    story.append(user_info_table)
    story.append(Spacer(1, 8))

    # Section 2: Habit Score & Performance Breakdown
    story.append(Paragraph("2. Habit Score & Performance Breakdown", section_title))
    habit_score_data = [
        [
            Paragraph("Metric Indicator", cell_bold),
            Paragraph("Score / Value", cell_bold),
            Paragraph("Description", cell_bold),
        ],
        [
            Paragraph("Overall Habit Score", cell_bold),
            Paragraph(f"<b>{overall_score} / 100</b>", cell_normal),
            Paragraph(
                "Weighted score combining wake consistency, snooze penalty, challenge speed, & adherence.",
                cell_normal,
            ),
        ],
        [
            Paragraph("Wake-Up Consistency", cell_normal),
            Paragraph(f"{breakdown.get('wake_consistency', 0.0)}%", cell_normal),
            Paragraph("Consistency of challenge solves around scheduled alarm times.", cell_normal),
        ],
        [
            Paragraph("Average Snooze Count", cell_normal),
            Paragraph(f"{breakdown.get('avg_snoozes', 0.0)} snoozes", cell_normal),
            Paragraph(f"Snooze Penalty Score: {breakdown.get('snooze_penalty', 0.0)} / 100.", cell_normal),
        ],
        [
            Paragraph("Challenge Speed Score", cell_normal),
            Paragraph(f"{breakdown.get('challenge_speed', 0.0)} / 100", cell_normal),
            Paragraph("Calculated speed score based on challenge solve duration.", cell_normal),
        ],
        [
            Paragraph("Goal Adherence", cell_normal),
            Paragraph(f"{breakdown.get('goal_adherence', 0.0)}%", cell_normal),
            Paragraph("Variance and schedule adherence stability over recent days.", cell_normal),
        ],
    ]
    habit_score_table = Table(habit_score_data, colWidths=[150, 110, 280])
    habit_score_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFF6FF")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("PADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    story.append(habit_score_table)
    story.append(Spacer(1, 8))

    # Section 3: 7-Day Chronological Daily Solve & Snooze Logs
    story.append(Paragraph("3. 7-Day Daily Solve & Snooze Logs", section_title))
    solve_log_headers = [
        Paragraph("Date", cell_bold),
        Paragraph("Day", cell_bold),
        Paragraph("Daily Score", cell_bold),
        Paragraph("Avg Solve Time", cell_bold),
        Paragraph("Total Snoozes", cell_bold),
    ]
    solve_log_rows = [solve_log_headers]

    if trends:
        for t in trends:
            solve_log_rows.append([
                Paragraph(t.get("date", "N/A"), cell_normal),
                Paragraph(t.get("day", "N/A"), cell_normal),
                Paragraph(f"<b>{t.get('score', 0)} pts</b>", cell_normal),
                Paragraph(f"{t.get('avg_solve_time', 0.0)}s", cell_normal),
                Paragraph(f"{t.get('snoozes', 0)} snoozes", cell_normal),
            ])
    else:
        solve_log_rows.append([
            Paragraph("N/A", cell_normal),
            Paragraph("N/A", cell_normal),
            Paragraph("0 pts", cell_normal),
            Paragraph("0.0s", cell_normal),
            Paragraph("0 snoozes", cell_normal),
        ])

    solve_log_table = Table(solve_log_rows, colWidths=[100, 80, 110, 120, 130])
    solve_log_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("PADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ]
        )
    )
    story.append(solve_log_table)
    story.append(Spacer(1, 8))

    # Section 4: Cognitive Sector Performance
    story.append(Paragraph("4. Cognitive Sector Performance & Accuracy", section_title))
    cat_perf_headers = [
        Paragraph("Sector Category", cell_bold),
        Paragraph("Total Solves", cell_bold),
        Paragraph("Avg Solve Speed", cell_bold),
        Paragraph("1st-Try Accuracy (%)", cell_bold),
    ]
    cat_perf_rows = [cat_perf_headers]

    if cat_perf:
        for c in cat_perf:
            cat_perf_rows.append([
                Paragraph(c.get("category", "N/A").capitalize(), cell_normal),
                Paragraph(f"{c.get('count', 0)} attempts", cell_normal),
                Paragraph(f"{c.get('avg_speed', 0.0)}s", cell_normal),
                Paragraph(f"<b>{c.get('accuracy', 0.0)}%</b>", cell_normal),
            ])
    else:
        cat_perf_rows.append([
            Paragraph("General", cell_normal),
            Paragraph("0 attempts", cell_normal),
            Paragraph("0.0s", cell_normal),
            Paragraph("100.0%", cell_normal),
        ])

    cat_perf_table = Table(cat_perf_rows, colWidths=[140, 120, 140, 140])
    cat_perf_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F8FAFC")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("PADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    story.append(cat_perf_table)
    story.append(Spacer(1, 8))

    # Section 5: Configured Alarms & Schedule
    story.append(Paragraph("5. Active Alarm Schedules & Configuration", section_title))
    alarm_headers = [
        Paragraph("Alarm Title", cell_bold),
        Paragraph("Alarm Time", cell_bold),
        Paragraph("Days Active", cell_bold),
        Paragraph("Category & Difficulty", cell_bold),
        Paragraph("Status", cell_bold),
    ]
    alarm_rows = [alarm_headers]

    if user_alarms:
        for a in user_alarms:
            cat_diff = f"{a.challenge_category.capitalize()} ({a.difficulty_override or 'Default'})"
            status_text = "Active" if a.is_active else "Disabled"
            alarm_rows.append([
                Paragraph(a.title or "Alarm", cell_normal),
                Paragraph(a.alarm_time, cell_normal),
                Paragraph(a.days_of_week, cell_normal),
                Paragraph(cat_diff, cell_normal),
                Paragraph(status_text, cell_normal),
            ])
    else:
        alarm_rows.append([
            Paragraph("Default Morning Alarm", cell_normal),
            Paragraph("07:00", cell_normal),
            Paragraph("MON,TUE,WED,THU,FRI", cell_normal),
            Paragraph("Math (Medium)", cell_normal),
            Paragraph("Active", cell_normal),
        ])

    alarm_table = Table(alarm_rows, colWidths=[120, 90, 140, 120, 70])
    alarm_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("PADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ]
        )
    )
    story.append(alarm_table)
    story.append(Spacer(1, 8))

    # Section 6: Personalized Recommendations
    story.append(Paragraph("6. AI & Cognitive Performance Recommendations", section_title))
    rec_table_data = [
        [
            Paragraph("Category", cell_bold),
            Paragraph("Actionable Recommendation", cell_bold),
        ]
    ]

    if isinstance(recommendations, list):
        for idx, item in enumerate(recommendations):
            cat_name = f"Recommendation #{idx + 1}"
            text = item.get("text", str(item)) if isinstance(item, dict) else str(item)
            rec_table_data.append([Paragraph(cat_name, rec_title), Paragraph(text, cell_normal)])
    elif isinstance(recommendations, dict):
        for cat_name, val in recommendations.items():
            text = val.get("advice", str(val)) if isinstance(val, dict) else str(val)
            rec_table_data.append([Paragraph(cat_name.replace("_", " ").title(), rec_title), Paragraph(text, cell_normal)])

    rec_table = Table(rec_table_data, colWidths=[140, 400])
    rec_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F8FAFC")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    story.append(rec_table)

    # Build PDF
    doc.build(story)
    pdf_buffer.seek(0)

    filename = f"sleep_summary_report_{target_user.id}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/export/excel")
@router.get("/excel")
async def export_excel_report(
    user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Exports telemetry, daily solve logs, habit progression, challenge history,
    configured alarms, and habit scores into a multi-sheet Excel workbook (.xlsx).
    """
    target_user = _get_target_user(user_id, current_user, db)

    score_data = habit_service.calculate_habit_score(target_user.id)
    overall_score = score_data.get("habit_score", 0.0)
    breakdown = score_data.get("breakdown", {})
    streak_days = HabitScoringService.calculate_streak_days(db, target_user.id)

    profile: Optional[UserProfile] = target_user.profile
    pref_wake = profile.preferred_wake_time if profile else "07:00"
    target_sleep = profile.target_sleep_hours if profile else 8.0
    timezone_str = profile.time_zone if profile else "UTC"

    # Sheet 1: Sleep & Habit Summary Data
    summary_data = [
        {"Attribute": "User ID", "Value": str(target_user.id)},
        {"Attribute": "Full Name", "Value": target_user.full_name or "N/A"},
        {"Attribute": "Email", "Value": target_user.email},
        {"Attribute": "Role", "Value": str(target_user.role.value if hasattr(target_user.role, 'value') else target_user.role)},
        {"Attribute": "Timezone", "Value": timezone_str},
        {"Attribute": "Preferred Wake Time", "Value": pref_wake},
        {"Attribute": "Target Sleep Hours", "Value": target_sleep},
        {"Attribute": "Current Streak (Days)", "Value": streak_days},
        {"Attribute": "Overall Habit Score", "Value": overall_score},
        {"Attribute": "Wake Consistency (%)", "Value": breakdown.get("wake_consistency", 0.0)},
        {"Attribute": "Avg Snoozes", "Value": breakdown.get("avg_snoozes", 0.0)},
        {"Attribute": "Snooze Penalty Score", "Value": breakdown.get("snooze_penalty", 0.0)},
        {"Attribute": "Challenge Speed Score", "Value": breakdown.get("challenge_speed", 0.0)},
        {"Attribute": "Goal Adherence (%)", "Value": breakdown.get("goal_adherence", 0.0)},
        {"Attribute": "Report Generated At", "Value": datetime.now(timezone.utc).isoformat()},
    ]
    df_summary = pd.DataFrame(summary_data)

    # Sheet 2: Solve Telemetry Logs
    telemetry_logs = db.query(SolveTelemetry).filter(SolveTelemetry.user_id == target_user.id).order_by(SolveTelemetry.created_at.desc()).limit(100).all()
    if telemetry_logs:
        df_telemetry = pd.DataFrame([
            {
                "Log ID": str(t.id),
                "Category": t.category,
                "Difficulty": t.difficulty,
                "Solve Time (seconds)": t.solve_time_seconds,
                "Attempts": t.attempts,
                "Snooze Count": t.snooze_count,
                "Timestamp": t.created_at.isoformat() if t.created_at else "N/A"
            }
            for t in telemetry_logs
        ])
    else:
        df_telemetry = pd.DataFrame([{"Message": "No telemetry logs recorded."}])

    # Sheet 3: Daily Analytics Trends
    trends = telemetry_service.get_daily_trends(target_user.id, days=30)
    df_trends = pd.DataFrame(trends) if trends else pd.DataFrame([{"Message": "No daily trend data available."}])

    # Sheet 4: Category Performance
    cat_perf = telemetry_service.get_category_performance(target_user.id, days=30)
    df_cat_perf = pd.DataFrame(cat_perf) if cat_perf else pd.DataFrame([{"Message": "No category performance data available."}])

    # Sheet 5: User Challenge History (Prompts & Answers)
    history_logs = db.query(UserChallengeHistory).filter(UserChallengeHistory.user_id == str(target_user.id)).order_by(UserChallengeHistory.solved_at.desc()).limit(100).all()
    if history_logs:
        df_history = pd.DataFrame([
            {
                "History ID": str(h.id),
                "Category": h.category,
                "Difficulty": h.difficulty,
                "Prompt": h.prompt,
                "Correct Answer": h.correct_answer,
                "Time Taken (seconds)": h.time_taken_seconds,
                "Attempts": h.attempts,
                "Solved At": h.solved_at.isoformat() if h.solved_at else "N/A"
            }
            for h in history_logs
        ])
    else:
        df_history = pd.DataFrame([{"Message": "No challenge history logs recorded."}])

    # Sheet 6: Configured Alarms
    user_alarms = db.query(Alarm).filter(Alarm.user_id == target_user.id).all()
    if user_alarms:
        df_alarms = pd.DataFrame([
            {
                "Alarm ID": str(a.id),
                "Title": a.title,
                "Alarm Time": a.alarm_time,
                "Days of Week": a.days_of_week,
                "Is Active": a.is_active,
                "Challenge Category": a.challenge_category,
                "Difficulty Override": a.difficulty_override or "Use Preference",
                "Snooze Limit": a.snooze_limit,
                "Created At": a.created_at.isoformat() if a.created_at else "N/A"
            }
            for a in user_alarms
        ])
    else:
        df_alarms = pd.DataFrame([{"Message": "No alarms configured."}])

    # Write to Excel stream using pandas and openpyxl
    excel_buffer = io.BytesIO()
    with pd.ExcelWriter(excel_buffer, engine="openpyxl") as writer:
        df_summary.to_excel(writer, sheet_name="Habit Summary", index=False)
        df_telemetry.to_excel(writer, sheet_name="Solve Telemetry Logs", index=False)
        df_trends.to_excel(writer, sheet_name="30-Day Trends", index=False)
        df_cat_perf.to_excel(writer, sheet_name="Category Performance", index=False)
        df_history.to_excel(writer, sheet_name="Challenge History", index=False)
        df_alarms.to_excel(writer, sheet_name="Configured Alarms", index=False)

    excel_buffer.seek(0)
    filename = f"sleep_habit_report_{target_user.id}.xlsx"

    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


