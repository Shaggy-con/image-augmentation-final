"""Flask application configuration."""
import logging

from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail

from config import Config
from database import init_db
from routes.auth_routes import auth_bp
from routes.augmentation_routes import augmentation_bp


# Load environment variables (dotenv handled in config.py)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mail = Mail()
jwt = JWTManager()
bcrypt = Bcrypt()


def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    # Initialize JWT
    jwt.init_app(app)

    # Initialize database
    init_db(app)

    # Initialize Bcrypt
    bcrypt.init_app(app)

    # Initialize Mail
    mail.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/')
    app.register_blueprint(augmentation_bp, url_prefix='/')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001)