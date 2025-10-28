"""Database initialization and connection management."""
from pymongo import MongoClient

from config import Config


client = None
db = None
user_collection = None
log_collection = None


def init_db(app):
    """
    Initialize MongoDB connection and collections.
    """
    global client, db, user_collection, log_collection
    try:
        client = MongoClient(
            Config.MONGO_URI,
            serverSelectionTimeoutMS=5000
        )
        db = client["users"]
        user_collection = db["users"]
        log_collection = db["logs"]

        # Test connection
        client.admin.command('ping')
        print("MongoDB connected successfully")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise


def get_users_collection():
    """
    Get the users collection.
    """
    if user_collection is None:
        raise ValueError("Database is not initialized")
    return user_collection


def get_log_collection():
    """
    Get the logs collection.
    """
    if log_collection is None:
        raise ValueError("Database is not initialized")
    return log_collection