from flask import Flask, jsonify, request,send_file
from dotenv import load_dotenv
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import(
    JWTManager,create_access_token,jwt_required,get_jwt_identity
)
from datetime import timedelta
from random_processing.random_generator import generate_random_augmentation
from batch_processing.image_rotator import rotateandzip 
import io
import os
from pymongo import MongoClient

load_dotenv()
print("Loaded MONGOURI:", os.getenv("MONGOURI"))

app = Flask(__name__)
CORS(app,origins=["http://localhost:5173"],supports_credentials=True)
bcrypt = Bcrypt(app)

app.config['JWT_SECRET_KEY']= os.getenv("JWT_SECRET_KEY","your_super_secret_key")
app.config['JWT_ACCESS_TOKEN_EXPIRES']= timedelta(days=1)
jwt=JWTManager(app)

MONGO_URI = os.getenv("MONGOURI")
if not MONGO_URI:
    raise ValueError("MONGOURI environment variable not set")

try:
    client = MongoClient(MONGO_URI,serverSelectionTimeoutMS=5000)
    db = client["users"]
    users_collection = db["users"]
    # Test connection
    client.admin.command('ping')
    print("MongoDB connected successfully")
except Exception as e:
    print(f"MongoDB connection failed: {e}")



@app.route("/register", methods=["POST"])
def register():
    data= request.get_json()
    email=data.get("email")
    password=data.get("password")

    if not email or not password:
        return jsonify({"error":"Email and password are required"}),400

    hashed_pw= bcrypt.generate_password_hash(password).decode('utf-8')
    users_collection.insert_one({
        "email":email,
        "password":hashed_pw
    })

    return jsonify({"message":"User registered successfully"}),201


@app.route("/login",methods=["POST"])
def login():
    data=request.get_json()
    email=data.get("email")
    password=data.get("password")

    if not email or not password:
        return jsonify({"error":"Email and password are required"}),400
    
    user = users_collection.find_one({"email":email})
    if not user:
        return jsonify({"error":"Invalid email or password"}),401
    
    if not bcrypt.check_password_hash(user['password'],password):
        return jsonify({"error":"Invalid email or password"}),401

    access_token = create_access_token(identity= email)
    return jsonify({"access_token":access_token}),200


@app.route("/augment/random", methods=["POST"])
def random_augmentation():
    if "image" not in request.files:
        return jsonify({"error": "no image uploaded"})
        
    image_file = request.files['image']

    try:
        img_buffer = generate_random_augmentation(image_file)
        
        return send_file(
            img_buffer,
            mimetype='image/png',  
            as_attachment=True,
            download_name='random_augmented_image.png'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}),500


@app.route("/augment/rotate", methods=["POST"])
def rotate_image():
    if "image" not in request.files:
        return jsonify({"error":"no image uploaded"})
        
    image_file= request.files['image']
    num_images = int(request.form.get('num_images',36))

    try:
        zip_buffer=rotateandzip(image_file,num_images)
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='augmented_rotated_images.zip'
        )
    except Exception as e:
        return jsonify({"error": str(e)}),500
    



if __name__ == '__main__':
    app.run(debug=True,port=5000)