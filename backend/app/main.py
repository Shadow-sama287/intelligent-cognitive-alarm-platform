from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.health import router as health_router
from app.api.v1.challenges import router as challenge_router
from app.api.v1.auth import router as auth_router
from app.api.v1.alarms import router as alarms_router
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
app.include_router(challenge_router, prefix=settings.API_V1_STR, tags=["Challenges"])  # <-- 2. Register router
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(alarms_router, prefix=f"{settings.API_V1_STR}/alarms", tags=["Alarms"])

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API. Visit /docs for OpenAPI documentation."}


@app.on_event("startup")
def on_startup():
    # Create DB tables if they don't exist (development convenience)
    Base.metadata.create_all(bind=engine)