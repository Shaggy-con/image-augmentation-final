from pymongo import MongoClient
from config import Config

client = None
db = None
user_collection = None

def init_db(app):
    global client, db, user_collection
    try:
        client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client["users"]
        user_collection = db["users"]
        # Test connection
        client.admin.command('ping')
        print("MongoDB connected successfully")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise

def get_users_collection():
    if user_collection is None:
        raise ValueError("Database is not initialized")
    return user_collection