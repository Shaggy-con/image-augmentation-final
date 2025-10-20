import io 
import random 
from PIL import Image, ImageEnhance

def _generate_random_augmentation(image_file):
    # Public function that applies random augmentation for uploaded image
    
    original_image = Image.open(image_file).convert('RGB')

    augmented_image = _apply_random_transformations(original_image)
    
    img_bytes = io.BytesIO()
    augmented_image.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes


def _apply_random_transformations(image):
    # Non public helper function to apply random transformations
    
    rotation_angle = random.randint(0, 360)
    image = image.rotate(rotation_angle, expand=True)
    
    scale_factor = random.uniform(0.1, 10.0)
    new_width = int(image.width * scale_factor)
    new_height = int(image.height * scale_factor)

    if new_width > 0 and new_height > 0:
        image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    if random.choice([True, False]):
        image = image.transpose(Image.FLIP_LEFT_RIGHT)
    if random.choice([True, False]):
        image = image.transpose(Image.FLIP_TOP_BOTTOM)
    
    brightness_factor = random.uniform(0.0, 3.0)
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(brightness_factor)
    
    contrast_factor = random.uniform(0.0, 3.0)
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(contrast_factor)
    
    saturation_factor = random.uniform(0.0, 3.0)
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(saturation_factor)
    
    if random.choice([True, False]):
        image = image.convert('L').convert('RGB')
    
    return image