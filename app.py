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
from PIL import Image
from basic_augmentation.basic_aug import basic_rotate, scale_image, flip_image
import tempfile
from advanced_augmentation.adv_augmentation import augment_image

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
def rotate_batch_image():
    if "image" not in request.files:
        return jsonify({"error":"no image uploaded"}) ,400
        
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
    




@app.route("/augment/basic", methods=["POST"])
def basic_augmentation():
    if "image" not in request.files:
        return jsonify({"error": "no image uploaded"}), 400
        
    image_file = request.files['image']
    
    operation = request.form.get('operation')  
    
    if not operation:
        return jsonify({"error": "operation parameter is required"}), 400

    try:

        image = Image.open(image_file)
        
        if operation == 'rotate':
            angle = float(request.form.get('angle', 90))
            augmented_image = basic_rotate(image, angle)
            
        elif operation == 'scale':
            scale_factor = float(request.form.get('scale_factor', 1.5))
            augmented_image = scale_image(image, scale_factor)
            
        elif operation == 'flip':
            direction = request.form.get('direction', 'horizontal')
            augmented_image = flip_image(image, direction)
            
        else:
            return jsonify({"error": "Invalid operation. Use 'rotate', 'scale', or 'flip'"}), 400
        
        # Save the augmented image to a buffer
        img_buffer = io.BytesIO()
        augmented_image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        return send_file(
            img_buffer,
            mimetype='image/png',
            as_attachment=True,
            download_name=f'basic_augmented_{operation}.png'
        )
        
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/augment/advanced', methods=['POST'])
def augment():
    image_file = request.files['image']
    params = request.form

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_in:
        image_file.save(temp_in)
        input_path = temp_in.name

    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_out:
        output_path = temp_out.name

    augment_image(
        image_path=input_path,
        output_path=output_path,
        brightness=float(params.get('brightness', 1.0)),
        contrast=float(params.get('contrast', 1.0)),
        blur=params.get('blur') == 'on',
        grayscale=params.get('grayscale') == 'on'
    )

    os.remove(input_path)
    return send_file(output_path, mimetype='image/png')


if __name__ == '__main__':
    app.run(debug=True,port=5000)