import io
import random

from PIL import Image, ImageEnhance


def _generate_random_augmentation(image_file):
    """
    Apply random augmentation to an uploaded image.
    """
    original_image = Image.open(image_file).convert('RGB')

    augmented_image = _apply_random_transformations(original_image)
    
    img_bytes = io.BytesIO()
    augmented_image.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes


def _apply_random_transformations(image):
    """
    Apply random transformations to an image.
    """
    # Random rotation (0-360 degrees)
    rotation_angle = random.randint(0, 360)
    image = image.rotate(rotation_angle, expand=True)
    
    # Random scaling (0.1x to 10x)
    scale_factor = random.uniform(0.1, 10.0)
    new_width = int(image.width * scale_factor)
    new_height = int(image.height * scale_factor)

    if new_width > 0 and new_height > 0:
        image = image.resize(
            (new_width, new_height),
            Image.Resampling.LANCZOS
        )
    
    # Random horizontal flip
    if random.choice([True, False]):
        image = image.transpose(Image.FLIP_LEFT_RIGHT)
    
    # Random vertical flip
    if random.choice([True, False]):
        image = image.transpose(Image.FLIP_TOP_BOTTOM)
    
    # Random brightness adjustment (0.0 to 3.0)
    brightness_factor = random.uniform(0.0, 3.0)
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(brightness_factor)
    
    # Random contrast adjustment (0.0 to 3.0)
    contrast_factor = random.uniform(0.0, 3.0)
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(contrast_factor)
    
    # Random saturation adjustment (0.0 to 3.0)
    saturation_factor = random.uniform(0.0, 3.0)
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(saturation_factor)
    
    # Random grayscale conversion
    if random.choice([True, False]):
        image = image.convert('L').convert('RGB')
    
    return image