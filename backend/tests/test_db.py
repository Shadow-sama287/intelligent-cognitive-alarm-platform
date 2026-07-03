from app.db.session import engine, Base
from app.models.user import User

print("Creating tables in PostgreSQL...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")