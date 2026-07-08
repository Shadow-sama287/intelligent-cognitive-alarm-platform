from app.services.generators.llm_gen import llm_gen
from app.db.session import SessionLocal, engine, Base
import app.db.base

# Ensure tables are created for tests
Base.metadata.create_all(bind=engine)

db = SessionLocal()
print("Testing AI Math (Hard):")
print(llm_gen.generate(db, user_id="dummy_id", difficulty="hard", category="math"))

print("\nTesting AI Riddle (Medium):")
print(llm_gen.generate(db, user_id="dummy_id", difficulty="medium", category="riddles"))