import io
from flask import jsonify
from config import Config

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

def error_response(message, status_code=400):
    return jsonify({"error": message}), status_code

def validate_image_size(image_file):
    """
    Checks if the given size of file is correct or not
    """
    # 1. Seek to end to get file size
    image_file.seek(0, io.SEEK_END)
    file_size = image_file.tell()
    # 2. Reset the stream position to start
    image_file.seek(0)

    # Checks if file size is 0
    if file_size == 0:
        return False, "Uploaded image is empty"
    
    # Checks file size
    if file_size > Config.MAX_CONTENT_LENGTH:
        return False, " Uploaded file is too large"
    
    # No error found 
    return True, None