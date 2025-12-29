from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from tensorflow import keras
import numpy as np
import logging

from utils.image_utils import preprocess_image

# -------------------------
# App configuration
# -------------------------
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

# -------------------------
# Model & labels loading
# -------------------------
MODEL_PATH = "model/keras_model.h5"
LABELS_PATH = "model/labels.txt"

try:
    model = keras.models.load_model(MODEL_PATH)
    logging.info("Model loaded successfully")

    with open(LABELS_PATH, "r") as f:
        labels = [line.strip().split(" ", 1)[1] for line in f.readlines()]

    logging.info("Labels loaded successfully")

except Exception as e:
    logging.error(f"Failed to load model or labels: {e}")
    raise RuntimeError("Model initialization failed")

# -------------------------
# Routes
# -------------------------
@app.route("/", methods=["GET"])
def home():
    # Serve frontend
    return render_template("index.html")


@app.route("/health", methods=["GET"])
def health_check():
    # Useful for Render monitoring
    return jsonify({"status": "ok"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]

    try:
        processed_image = preprocess_image(image_file)
        predictions = model.predict(processed_image)

        confidence = float(np.max(predictions))
        predicted_index = int(np.argmax(predictions))
        predicted_label = labels[predicted_index]

        return jsonify({
            "denomination": predicted_label,
            "confidence": round(confidence * 100, 2)
        })

    except Exception as e:
        logging.error(f"Prediction failed: {e}")
        return jsonify({"error": "Prediction failed"}), 500


# -------------------------
# Local development only
# -------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)