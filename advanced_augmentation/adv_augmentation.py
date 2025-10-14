from PIL import Image, ImageEnhance, ImageOps, ImageFilter

def augment_image(
    image_path: str,
    output_path: str,
    brightness: float = 1.0,
    contrast: float = 1.0,
    blur: bool = False,
    grayscale: bool = False
):
    try:
        with Image.open(image_path) as img:
            img = img.convert("RGBA")
            if brightness != 1.0:
                enhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(brightness)
            if contrast != 1.0:
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(contrast)
            if blur:
                img = img.filter(ImageFilter.BLUR)
            if grayscale:
                img = ImageOps.grayscale(img).convert("RGBA")
            final_img = img.convert("RGB")
            final_img.save(output_path)
    except FileNotFoundError:
        print(f"Error: The file '{image_path}' was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")