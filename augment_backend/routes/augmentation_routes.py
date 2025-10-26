from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required
from utils import allowed_file, error_response, validate_image_size
from controllers.random_generator import _generate_random_augmentation
from controllers.image_rotator import _rotate_and_zip
from controllers.basic_aug import basic_rotate, scale_image, flip_image
from controllers.adv_augmentation import _augment_image
import io
from PIL import Image
import logging

augmentation_bp = Blueprint('augmentation', __name__)
logger = logging.getLogger(__name__)

@augmentation_bp.route("/augment/random", methods=["POST"])
@jwt_required()
def random_augmentation():
    """
    Receives an image file via POST request
    Applies random augmentations and returns to frontend
    """
    # 1. File validation
    if "image" not in request.files:
        return jsonify({"error": "no image uploaded"}), 400
        
    image_file = request.files['image']
    
    # 2. Empty File validation
    if not image_file or image_file.filename == "":
        return jsonify({"Error":"No image file is uploaded"}), 400
    
    # 3. Size validation
    is_Valid, error_msg = validate_image_size(image_file)
    
    if not is_Valid:
        return jsonify({"error": error_msg}), 400

    try:
        img_buffer = _generate_random_augmentation(image_file)
        
        return send_file(
            img_buffer,
            mimetype='image/png',  
            as_attachment=True,
            download_name='random_augmented_image.png'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@augmentation_bp.route("/augment/rotate", methods=["POST"])
@jwt_required()
def rotate_batch_image():
    """
    Receives an image file and num_images via POST request
    Applies Batch Processing logic and returns batches of images to frontend
    """
    # 1. File validation
    if "image" not in request.files:
        return jsonify({"error":"no image uploaded"}) , 400
        
    image_file= request.files['image']
    
    # 2. File size validation
    is_valid, error_msg = validate_image_size(image_file)
    
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    # 3. Parameter validation
    num_images_str = request.form.get('num_images',36)

    if num_images_str is None:
        num_images = 36
    else:
        try:
            num_images = int(num_images_str)
        except ValueError:
            return jsonify({"error":"num_images must be an integer"}),400
        
    # 4. Limits Validation
    MIN_IMAGES = 4
    MAX_IMAGES = 360

    if not (MIN_IMAGES <= num_images <= MAX_IMAGES):
        return jsonify({"error":f"num_images must be between {MIN_IMAGES} and {MAX_IMAGES}"}),400
    
    # 5. Batch Processing and Error handling 

    try:
        zip_buffer=_rotate_and_zip(image_file, num_images)

        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='augmented_rotated_images.zip'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@augmentation_bp.route("/augment/basic", methods=["POST"])
@jwt_required()
def basic_augmentation():
    """
    Perform basic image augmentations such as rotate, scale, and flip.
    """
    if "image" not in request.files:
        return error_response("No image uploaded", 400)

    image_file = request.files["image"]

    if not allowed_file(image_file.filename):
        return error_response("Invalid file type. Use PNG/JPG/JPEG", 400)

    try:
        image = Image.open(image_file)
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Load operations list from JSON body or single form parameter
        json_data = request.get_json(silent=True)
        operations = []

        if json_data and "operations" in json_data:
            operations = json_data["operations"]
            if not isinstance(operations, list) or not operations:
                return error_response(
                    "Operations must be a non-empty list.", 400
                )
        else:
            single_op = request.form.get("operation")
            if not single_op:
                return error_response(
                    "Operation parameter is required (or 'operations' list "
                    "in JSON).", 400
                )

            # Handle each supported single operation type
            if single_op == "rotate":
                angle = float(request.form.get("angle", 90))
                operations = [{"type": "rotate", "angle": angle}]
            elif single_op == "scale":
                scale_factor = float(request.form.get("scale_factor", 1.5))
                operations = [{"type": "scale", "scale_factor": scale_factor}]
            elif single_op == "flip":
                direction = request.form.get("direction", "horizontal")
                operations = [{"type": "flip", "direction": direction}]
            else:
                return error_response(
                    "Invalid operation. Use 'rotate', 'scale', or 'flip'.", 400
                )

        # Apply operations sequentially
        op_names = []
        for op in operations:
            op_type = op.get("type")

            if op_type == "rotate":
                angle = float(op.get("angle", 0))
                if not 0 <= angle <= 360:
                    return error_response(
                        "Angle must be between 0 and 360 degrees.", 400
                    )
                image = basic_rotate(image, angle)
                op_names.append("rotate")

            elif op_type == "scale":
                scale_factor = float(op.get("scale_factor", 1.0))
                if not 0.1 <= scale_factor <= 2.0:
                    return error_response(
                        "Scale factor must be between 0.1 and 2.0.", 400
                    )
                image = scale_image(image, scale_factor)
                op_names.append("scale")

            elif op_type == "flip":
                direction = op.get("direction", "horizontal")
                if direction not in ["horizontal", "vertical"]:
                    return error_response(
                        "Direction must be 'horizontal' or 'vertical'.", 400
                    )
                image = flip_image(image, direction)
                op_names.append("flip")

            else:
                return error_response(f"Invalid operation type: {op_type}.", 400)

        # Prepare image for response
        filename_suffix = "_".join(op_names) if op_names else "basic"
        img_buffer = io.BytesIO()
        image.save(img_buffer, format="PNG")
        img_buffer.seek(0)

        return send_file(
            img_buffer,
            mimetype="image/png",
            as_attachment=True,
            download_name=f"basic_augmented_{filename_suffix}.png",
        )

    except ValueError as val_err:
        return error_response(str(val_err), 400)

    # pylint: disable=broad-exception-caught
    except Exception as exc:
        logger.error("Basic augmentation error: %s", exc)
        return error_response("Unexpected server error.", 500)
    # pylint: enable=broad-exception-caught
    
@augmentation_bp.route("/augment/advanced", methods=["POST"])
@jwt_required()
def advanced_augmentation():
    """Handle advanced image augmentation with multiple operations."""
    if "image" not in request.files:
        return error_response("No image uploaded", 400)

    image_file = request.files["image"]
    if not allowed_file(image_file.filename):
        return error_response("Invalid file type. Use PNG/JPG/JPEG", 400)

    # Add size validation (consistent with other endpoints)
    is_valid, error_msg = validate_image_size(image_file)
    if not is_valid:
        return error_response(error_msg, 400)

    try:
        image = Image.open(image_file)
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Default advanced parameters
        advanced_params = {
            "brightness": 1.0,
            "contrast": 1.0,
            "saturation": 1.0,
            "blur": False,
            "grayscale": False,
        }

        # Parse JSON operations (with silent=True to avoid 400 on non-JSON requests)
        json_data = request.get_json(silent=True)
        if json_data and "operations" in json_data:
            operations = json_data["operations"]
            if not isinstance(operations, list) or not operations:
                return error_response(
                    "Operations must be a non-empty list",
                    400
                )

            for op in operations:
                op_type = op.get("type")

                if op_type == "brightness":
                    value = float(op.get("value", 1.0))
                    if not 0.1 <= value <= 3.0:
                        return error_response(
                            "Brightness must be between 0.1 and 3.0",
                            400
                        )
                    advanced_params["brightness"] = value

                elif op_type == "contrast":
                    value = float(op.get("value", 1.0))
                    if not 0.1 <= value <= 3.0:
                        return error_response(
                            "Contrast must be between 0.1 and 3.0",
                            400
                        )
                    advanced_params["contrast"] = value

                elif op_type == "saturation":
                    value = float(op.get("value", 1.0))
                    if not 0.1 <= value <= 3.0:
                        return error_response(
                            "Saturation must be between 0.1 and 3.0",
                            400
                        )
                    advanced_params["saturation"] = value

                elif op_type == "blur":
                    advanced_params["blur"] = bool(op.get("enabled", True))

                elif op_type == "grayscale":
                    advanced_params["grayscale"] = bool(
                        op.get("enabled", True)
                    )

                else:
                    return error_response(
                        f"Invalid advanced operation type: {op_type}. "
                        "Use 'brightness', 'contrast', 'saturation', "
                        "'blur', or 'grayscale'",
                        400,
                    )

        else:
            # Backward compatibility: single params from form-data
            advanced_params["brightness"] = float(
                request.form.get("brightness", 1.0)
            )
            if not 0.1 <= advanced_params["brightness"] <= 3.0:
                return error_response(
                    "Brightness must be between 0.1 and 3.0",
                    400
                )

            advanced_params["contrast"] = float(
                request.form.get("contrast", 1.0)
            )
            if not 0.1 <= advanced_params["contrast"] <= 3.0:
                return error_response(
                    "Contrast must be between 0.1 and 3.0",
                    400
                )

            advanced_params["saturation"] = float(
                request.form.get("saturation", 1.0)
            )
            if not 0.1 <= advanced_params["saturation"] <= 3.0:
                return error_response(
                    "Saturation must be between 0.1 and 3.0",
                    400
                )

            advanced_params["blur"] = request.form.get("blur") == "on"
            advanced_params["grayscale"] = (
                request.form.get("grayscale") == "on"
            )

        # Apply augmentations
        augmented_image = _augment_image(
            image=image,
            brightness=advanced_params["brightness"],
            contrast=advanced_params["contrast"],
            saturation=advanced_params["saturation"],
            blur=advanced_params["blur"],
            grayscale=advanced_params["grayscale"],
        )

        # Prepare image for sending
        img_buffer = io.BytesIO()
        augmented_image.save(img_buffer, format="PNG")
        img_buffer.seek(0)

        return send_file(
            img_buffer,
            mimetype="image/png",
            as_attachment=True,
            download_name="advanced_augmented_image.png",
        )

    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        logger.error(f"Advanced augmentation error: {e}")
        return error_response(str(e), 500)