from PIL import Image, ImageEnhance, ImageOps, ImageFilter
import logging

logger = logging.getLogger(__name__)


def _augment_image(
    image: Image.Image,
    brightness: float = 1.0,
    contrast: float = 1.0,
    saturation: float = 1.0,
    blur: bool = False,
    grayscale: bool = False
) -> Image.Image:
    """
    Apply advanced augmentations to a PIL Image
    """
    if not 0.1 <= brightness <= 3.0:
        raise ValueError("Brightness must be between 0.1 and 3.0")
    if not 0.1 <= contrast <= 3.0:
        raise ValueError("Contrast must be between 0.1 and 3.0")
    if not 0.1 <= saturation <= 3.0:
        raise ValueError("Saturation must be between 0.1 and 3.0")

    try:
        # Enforce RGB early (SRS constraint)
        img = image.copy().convert('RGB')

        if brightness != 1.0:
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(brightness)

        if contrast != 1.0:
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(contrast)

        if saturation != 1.0:
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(saturation)

        if blur:
            img = img.filter(ImageFilter.BLUR)

        if grayscale:
            img = ImageOps.grayscale(img)

        return img

    except Exception as e:
        logger.error(f"Advanced augmentation error: {e}")
        raise