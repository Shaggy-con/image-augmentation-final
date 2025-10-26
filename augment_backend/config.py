import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    #JWT Configuration
    JWT_SECRET_KEY= os.getenv("JWT_SECRET_KEY")
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY environment variable not set")
    JWT_ACCESS_TOKEN_EXPIRES= timedelta(days=1)


    #MongoDB
    MONGO_URI = os.getenv("MONGOURI")
    if not MONGO_URI:
        raise ValueError("MONGOURI environment variable not set")
    
    # File upload limit
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024

    # Mail configuration
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")

    if not MAIL_USERNAME or not MAIL_PASSWORD:
        raise ValueError("MAIL_USERNAME and MAIL_PASSWORD environment variables must be set")