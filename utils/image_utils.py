import numpy as np
from PIL import Image

def preprocess_image(image_file):
    image = Image.open(image_file).convert("RGB")
    image = image.resize((224, 224))

    image_array = np.asarray(image).astype(np.float32)
    image_array = (image_array / 127.5) - 1  # normalization

    image_array = np.expand_dims(image_array, axis=0)
    return image_array