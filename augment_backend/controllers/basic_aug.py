from PIL import Image


def _basic_rotate(image, angle):
    
    rotated = image.rotate(angle, expand=True)
    return rotated


def _scale_image(image, scale_factor):
    
    width, height = image.size
    new_width = int(width * scale_factor)
    new_height = int(height * scale_factor)
    scaled = image.resize((new_width, new_height))
    return scaled


def _flip_image(image, direction="horizontal"):
    
    if direction == "horizontal":
        flipped = image.transpose(Image.FLIP_LEFT_RIGHT)
    elif direction == "vertical":
        flipped = image.transpose(Image.FLIP_TOP_BOTTOM)
    else:
        raise ValueError(
            "Invalid direction. Use 'horizontal' or 'vertical'."
        )

    return flipped