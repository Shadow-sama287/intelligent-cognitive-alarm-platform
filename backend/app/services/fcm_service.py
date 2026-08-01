import logging
import os
import firebase_admin
from firebase_admin import credentials, messaging

logger = logging.getLogger("fcm_service")

# Initialize Firebase Admin SDK
_firebase_app = None
CRED_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")

if os.path.exists(CRED_PATH):
    try:
        cred = credentials.Certificate(CRED_PATH)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        logger.warning(f"Failed to initialize Firebase Admin SDK: {e}")
else:
    logger.info(f"Firebase credentials key file '{CRED_PATH}' not found. Operating in Mock mode.")


class FCMService:
    @staticmethod
    async def send_alarm_push(fcm_token: str, alarm_title: str, alarm_id: str) -> bool:
        """Dispatches high-priority push notification payload via Firebase Admin SDK."""
        if not fcm_token:
            logger.warning("No FCM token provided. Skipping push notification.")
            return False

        logger.info(f"Sending FCM Push to token {fcm_token[:10]}... for alarm {alarm_id}")

        if _firebase_app:
            try:
                # Build FCM Android & APNS high-priority payload
                message = messaging.Message(
                    notification=messaging.Notification(
                        title=alarm_title or "Alarm Alert!",
                        body="It's time to wake up! Complete your cognitive challenge.",
                    ),
                    data={
                        "alarm_id": str(alarm_id),
                        "type": "ALARM_TRIGGER",
                        "priority": "high",
                    },
                    android=messaging.AndroidConfig(
                        priority="high",
                        notification=messaging.AndroidNotification(
                            sound="default",
                            channel_id="alarm-channel",
                        ),
                    ),
                    token=fcm_token,
                )
                response = messaging.send(message)
                logger.info(f"Successfully dispatched FCM push: {response}")
                return True
            except Exception as e:
                logger.error(f"Error dispatching FCM notification: {e}")
                return False
        else:
            # Fallback for local development / testing without live credentials
            logger.info(f"[DEV MOCK] Simulated FCM Push sent to token {fcm_token[:10]}... for alarm {alarm_id}")
            return True


fcm_service = FCMService()
