from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging

from app.db.session import SessionLocal
from app.models.user import UserProfile
from app.services.fcm_service import fcm_service

logger = logging.getLogger("scheduler")
scheduler = AsyncIOScheduler()

async def check_pending_alarms():
    """Periodic background task checking due alarms and triggering remote FCM pushes."""
    logger.info("Checking pending real-time alarm triggers...")
    
    db = SessionLocal()
    try:
        # Example query for users with an active FCM token
        profiles = db.query(UserProfile).filter(UserProfile.fcm_token.isnot(None)).all()
        for profile in profiles:
            await fcm_service.send_alarm_push(
                fcm_token=profile.fcm_token,
                alarm_title="Scheduled Wake-Up Call",
                alarm_id="scheduled-trigger-id"
            )
    except Exception as e:
        logger.error(f"Error checking pending alarms in scheduler: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(check_pending_alarms, 'interval', seconds=30)
    scheduler.start()
    logger.info("APScheduler initialized successfully.")
