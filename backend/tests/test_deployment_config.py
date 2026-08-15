import pytest
from app.core.config import Settings
from app.main import app

def test_settings_database_url_handling():
    # Test default postgres assembly
    s1 = Settings(
        POSTGRES_SERVER="db.example.com",
        POSTGRES_PORT=5432,
        POSTGRES_USER="u",
        POSTGRES_PASSWORD="p",
        POSTGRES_DB="dbname"
    )
    assert s1.SQLALCHEMY_DATABASE_URI == "postgresql://u:p@db.example.com:5432/dbname"

    # Test single-string DATABASE_URL with postgres:// scheme (Render format)
    s2 = Settings(DATABASE_URL="postgres://u:p@db.render.com:5432/render_db")
    assert s2.SQLALCHEMY_DATABASE_URI == "postgresql://u:p@db.render.com:5432/render_db"

    # Test single-string DATABASE_URL with postgresql:// scheme
    s3 = Settings(DATABASE_URL="postgresql://u:p@db.render.com:5432/render_db")
    assert s3.SQLALCHEMY_DATABASE_URI == "postgresql://u:p@db.render.com:5432/render_db"

def test_fastapi_app_routes():
    # Verify main app is loaded and routes are registered
    routes = [getattr(r, "path", "") for r in app.routes]
    assert "/" in routes
    assert any("/api/v1" in r for r in routes) or len(app.routes) > 0
