"""Utility functions for file validation and error handling."""
import io

from flask import jsonify

from config import Config


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}


def allowed_file(filename):
    """
    Check if the file has an allowed extension.
    """
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def error_response(message, status_code=400):
    """
    Create a JSON error response.
    """
    return jsonify({"error": message}), status_code


def validate_image_size(image_file):
    """
    Validate the size of an uploaded image file.
    """
    # Seek to end to get file size
    image_file.seek(0, io.SEEK_END)
    file_size = image_file.tell()
    # Reset the stream position to start
    image_file.seek(0)

    # Check if file size is 0
    if file_size == 0:
        return False, "Uploaded image is empty"
    
    # Check file size limit
    if file_size > Config.MAX_CONTENT_LENGTH:
        return False, "Uploaded file is too large"
    
    # No error found
    return True, None