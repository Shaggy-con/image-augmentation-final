from flask import Flask, jsonify, request,send_file
from dotenv import load_dotenv
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import(
    JWTManager,create_access_token,jwt_required,get_jwt_identity
)
import logging
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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app,origins=["http://localhost:5173"],supports_credentials=True)
bcrypt = Bcrypt(app)

# JWT Configuration
app.config['JWT_SECRET_KEY']= os.getenv("JWT_SECRET_KEY")
if not app.config['JWT_SECRET_KEY']:
    raise ValueError("JWT_SECRET_KEY environment variable not set")
app.config['JWT_ACCESS_TOKEN_EXPIRES']= timedelta(days=1)
jwt=JWTManager(app)

app.config['MAX_CONTENT_LENGTH']=5 * 1024 * 1024  # 5 MB limit

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

# Helpers
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

def error_response(message, status_code=400):
    return jsonify({"error": message}), status_code


@app.route("/register", methods=["POST"])
def register():
    data= request.get_json()
    email=data.get("email")
    password=data.get("password")

    if not email or not password:
        return jsonify({"error":"Email and password are required"}),400
    
    if users_collection.find_one({"email":email}):
        return jsonify({"error":"User already exists"}),400

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
@jwt_required()
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
@jwt_required()
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
@jwt_required()
def basic_augmentation():
    if "image" not in request.files:
        return error_response("No image uploaded", 400)
    
    image_file = request.files['image']
    if not allowed_file(image_file.filename):
        return error_response("Invalid file type. Use PNG/JPG/JPEG", 400)
    
    try:
        image = Image.open(image_file)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Multi-operation support via JSON (extension); fallback to single form-data
        operations = []
        json_data = request.get_json()
        if json_data and 'operations' in json_data:
            operations = json_data['operations']
            if not isinstance(operations, list) or not operations:
                return error_response("Operations must be a non-empty list", 400)
        else:
            single_op = request.form.get('operation')
            if not single_op:
                return error_response("Operation parameter is required (or 'operations' list in JSON)", 400)
            if single_op == 'rotate':
                angle = float(request.form.get('angle', 90))
                operations = [{'type': 'rotate', 'angle': angle}]
            elif single_op == 'scale':
                scale_factor = float(request.form.get('scale_factor', 1.5))
                operations = [{'type': 'scale', 'scale_factor': scale_factor}]
            elif single_op == 'flip':
                direction = request.form.get('direction', 'horizontal')
                operations = [{'type': 'flip', 'direction': direction}]
            else:
                return error_response("Invalid operation. Use 'rotate', 'scale', or 'flip'", 400)
        
        # Apply operations sequentially
        op_names = []
        for op in operations:
            op_type = op.get('type')
            if op_type == 'rotate':
                angle = float(op.get('angle', 0))
                if not 0 <= angle <= 360:
                    return error_response("Angle must be between 0 and 360 degrees", 400)
                image = basic_rotate(image, angle)
                op_names.append('rotate')
            elif op_type == 'scale':
                scale_factor = float(op.get('scale_factor', 1.0))
                if not 0.1 <= scale_factor <= 2.0:
                    return error_response("Scale factor must be between 0.1 and 2.0", 400)
                image = scale_image(image, scale_factor)
                op_names.append('scale')
            elif op_type == 'flip':
                direction = op.get('direction', 'horizontal')
                if direction not in ['horizontal', 'vertical']:
                    return error_response("Direction must be 'horizontal' or 'vertical'", 400)
                image = flip_image(image, direction)
                op_names.append('flip')
            else:
                return error_response(f"Invalid operation type: {op_type}", 400)
        
        filename_suffix = '_'.join(op_names) if op_names else 'basic'
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        return send_file(
            img_buffer,
            mimetype='image/png',
            as_attachment=True,
            download_name=f'basic_augmented_{filename_suffix}.png'
        )
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        logger.error(f"Basic augmentation error: {e}")
        return error_response(str(e), 500)
    
@app.route('/augment/advanced', methods=['POST'])
@jwt_required()
def advanced_augmentation():
    if "image" not in request.files:
        return error_response("No image uploaded", 400)
    
    image_file = request.files['image']
    if not allowed_file(image_file.filename):
        return error_response("Invalid file type. Use PNG/JPG/JPEG", 400)
    
    params = request.form
    
    try:
        image = Image.open(image_file)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        augmented_image = augment_image(
            image=image,
            brightness=float(params.get('brightness', 1.0)),
            contrast=float(params.get('contrast', 1.0)),
            saturation=float(params.get('saturation', 1.0)),
            blur=params.get('blur') == 'on',
            grayscale=params.get('grayscale') == 'on'
        )
        
        img_buffer = io.BytesIO()
        augmented_image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        return send_file(
            img_buffer,
            mimetype='image/png',
            as_attachment=True,
            download_name='advanced_augmented_image.png'
        )
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        logger.error(f"Advanced augmentation error: {e}")
        return error_response(str(e), 500)


if __name__ == '__main__':
    app.run(debug=True,port=5000)