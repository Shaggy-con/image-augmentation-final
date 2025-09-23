from flask import Flask, jsonify, request
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt

app = Flask(__name__)
CORS(app)  # allow frontend (localhost:3000) to call API

app.config["JWT_SECRET_KEY"] = "super-secret-key"  # use env var in prod
jwt = JWTManager(app)

# MongoDB connection (local or Atlas)
client = MongoClient("mongodb://localhost:27017/")
db = client["auth_demo"]
users = db["users"]

# ---------- Register ----------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if users.find_one({"email": email}):
        return jsonify({"msg": "User already exists"}), 400

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users.insert_one({"email": email, "password": hashed_pw})
    return jsonify({"msg": "User registered successfully"}), 201

# ---------- Login ----------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_access_token(identity=email)
    return jsonify(access_token=token), 200

# ---------- Protected ----------
@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user}), 200

if __name__ == "__main__":
    app.run(debug=True)
