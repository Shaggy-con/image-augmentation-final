import io
import zipfile

from PIL import Image


def _rotate_and_zip(image_file, num_images=36):
    """
    Rotate an image multiple times and package into a ZIP file.
    """
    image = Image.open(image_file).convert('RGB')

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
        step = 360 / num_images
        for i in range(num_images):
            angle = step * i
            rotated = image.rotate(angle, expand=True)

            img_bytes = io.BytesIO()
            rotated.save(img_bytes, format='JPEG')
            img_bytes.seek(0)
            
            zipf.writestr(f"rotated_{int(angle)}.jpg", img_bytes.read())

    zip_buffer.seek(0)
    return zip_buffer