"""Authentication routes for user registration, login, and OTP verification."""
import random
from datetime import datetime, timezone, timedelta

from flask import Blueprint, current_app, jsonify, request
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_mail import Message

from database import get_users_collection


auth_bp = Blueprint('auth', __name__)


def generate_otp():
    """Generate a random 6-digit OTP.
    
    Returns:
        str: 6-digit OTP as a string.
    """
    return str(random.randint(100000, 999999))

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user and send OTP for email verification.
    
    Returns:
        tuple: JSON response and HTTP status code.
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    users_collection = get_users_collection()
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    otp = generate_otp()
    hashed_pw = generate_password_hash(password).decode('utf-8')

    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    users_collection.insert_one({
        "email": email,
        "password": hashed_pw,
        "is_verified": False,
        "otp": otp,
        "otp_expires_at": otp_expires_at
    })

    # Send OTP via mail
    msg = Message(
        "Verify Your Email - Your OTP",
        sender=current_app.config['MAIL_USERNAME'],
        recipients=[email]
    )
    msg.body = (
        f"Your OTP for registration is: {otp}\n"
        "It expires in 10 minutes."
    )
    mail = current_app.extensions['mail']
    mail.send(msg)

    return jsonify({
        "message": "User registered successfully. "
                   "Please check your email for OTP to verify."
    }), 201

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    """Verify user email using OTP.
    
    Returns:
        tuple: JSON response and HTTP status code.
    """
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400
    
    users_collection = get_users_collection()
    user = users_collection.find_one({"email": email})
    
    if not user:
        return jsonify(
            {"error": "User not found. Please register first."}
        ), 400
    
    if user.get("is_verified"):
        return jsonify({"error": "Email already verified."}), 400
    
    otp_expires_at = user["otp_expires_at"]
    if otp_expires_at.tzinfo is None:
        otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)

    if user["otp"] != otp or datetime.now(timezone.utc) > otp_expires_at:
        return jsonify({"error": "Invalid or expired OTP"}), 400

    # Verify and clean up
    users_collection.update_one(
        {"email": email},
        {
            "$set": {"is_verified": True},
            "$unset": {"otp": "", "otp_expires_at": ""}
        }
    )

    return jsonify({
        "message": "Email verified successfully. You can now log in."
    }), 200

@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return access token.
    
    Returns:
        tuple: JSON response with access token and HTTP status code.
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    users_collection = get_users_collection()
    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    
    if not user.get("is_verified"):
        return jsonify({
            "error": "Email not verified. "
                     "Please verify your email before logging in."
        }), 401
    
    if not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=email)
    return jsonify({"access_token": access_token}), 200