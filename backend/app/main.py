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
from app.db.session import engine, Base
# Ensure models are imported so SQLAlchemy metadata is populated
from app.db import base as _models

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API. Visit /docs for OpenAPI documentation."}


@app.on_event("startup")
def on_startup():
    # Create DB tables if they don't exist (development convenience)
    Base.metadata.create_all(bind=engine)