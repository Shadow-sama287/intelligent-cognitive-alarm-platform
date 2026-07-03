from pymongo import MongoClient
from app.core.config import settings

class MongoDBClient:
    def __init__(self):
        self.client = MongoClient(settings.MONGODB_URL)
        self.db = self.client.get_database()

    def get_collection(self, collection_name: str):
        return self.db[collection_name]

mongo_client = MongoDBClient()

def get_mongo_db():
    return mongo_client.db