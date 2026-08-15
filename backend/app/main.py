from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.health import router as health_router
from app.api.v1.challenges import router as challenges_router
from app.api.v1.auth import router as auth_router
from app.api.v1.alarms import router as alarms_router
from app.api.v1.sessions import router as sessions_router
from app.api.v1.verify import router as verify_router
from app.api.v1.profile import router as profile_router
from app.api.v1.admin import router as admin_router
from app.api.v1.snooze import router as snooze_router
from app.api.v1.performance import router as performance_router
from app.api.v1.ml import router as ml_router
from app.api.v1.telemetry import router as telemetry_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.coach import router as coach_router
from app.api.v1.reports import router as reports_router
from app.services.scheduler import start_scheduler

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True if origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(health_router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(challenges_router, prefix=f"{settings.API_V1_STR}/challenges", tags=["Challenges"])
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(alarms_router, prefix=f"{settings.API_V1_STR}/alarms", tags=["Alarms"])
app.include_router(sessions_router, prefix=f"{settings.API_V1_STR}/sessions", tags=["Sessions"])
app.include_router(verify_router, prefix=f"{settings.API_V1_STR}/challenges", tags=["Verification"])
app.include_router(profile_router, prefix=f"{settings.API_V1_STR}/profile", tags=["Profile"])
app.include_router(admin_router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin"])
app.include_router(snooze_router, prefix=f"{settings.API_V1_STR}/sessions", tags=["Snooze"])
app.include_router(performance_router, prefix=f"{settings.API_V1_STR}/performance", tags=["Performance"])
app.include_router(ml_router, prefix=f"{settings.API_V1_STR}/ml", tags=["ML Engine"])
app.include_router(telemetry_router, prefix=f"{settings.API_V1_STR}/telemetry", tags=["Telemetry"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics"])
app.include_router(coach_router,prefix=f"{settings.API_V1_STR}/coach",tags=["Coach"])
app.include_router(reports_router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API. Visit /docs for OpenAPI documentation."}


@app.on_event("startup")
def on_startup():
    start_scheduler()

