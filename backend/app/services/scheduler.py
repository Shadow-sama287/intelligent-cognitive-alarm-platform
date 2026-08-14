from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging
from zoneinfo import ZoneInfo

from app.db.session import SessionLocal
from app.models.alarm import Alarm
from app.models.user import UserProfile
from app.services.fcm_service import fcm_service

logger = logging.getLogger("scheduler")
scheduler = AsyncIOScheduler()

WEEKDAYS_MAP = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

async def check_pending_alarms():
    """Periodic background task checking due alarms and triggering remote FCM pushes."""
    db = SessionLocal()
    try:
        active_alarms = db.query(Alarm).filter(Alarm.is_active == True).all()
        if not active_alarms:
            return

        now_utc = datetime.utcnow()
        for alarm in active_alarms:
            profile = db.query(UserProfile).filter(UserProfile.user_id == alarm.user_id).first()
            if not profile or not profile.fcm_token:
                continue

            tz_str = profile.time_zone if profile and profile.time_zone else "UTC"
            try:
                user_tz = ZoneInfo(tz_str)
            except Exception:
                user_tz = ZoneInfo("UTC")

            local_now = now_utc.replace(tzinfo=ZoneInfo("UTC")).astimezone(user_tz)
            today_code = WEEKDAYS_MAP[local_now.weekday()]

            alarm_days = [d.strip() for d in (alarm.days_of_week or "").split(",") if d.strip()]
            if alarm_days and today_code not in alarm_days:
                continue

            current_time_str = local_now.strftime("%H:%M")
            if alarm.alarm_time == current_time_str:
                logger.info(f"Triggering scheduled push notification for alarm {alarm.id}")
                await fcm_service.send_alarm_push(
                    fcm_token=profile.fcm_token,
                    alarm_title=alarm.title or "Scheduled Wake-Up Call",
                    alarm_id=str(alarm.id)
                )
    except Exception as e:
        logger.error(f"Error checking pending alarms in scheduler: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(check_pending_alarms, 'interval', seconds=30)
    scheduler.start()
    logger.info("APScheduler initialized successfully.")
