from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import tensorflow.keras as keras
import numpy as np

from utils.image_utils import preprocess_image

app = Flask(__name__)
CORS(app)

MODEL_PATH = "model/keras_model.h5"
LABELS_PATH = "model/labels.txt"

# Load model once
model = keras.models.load_model(MODEL_PATH)

with open(LABELS_PATH, "r") as f:
    labels = [line.strip().split(" ", 1)[1] for line in f.readlines()]

@app.route("/", methods=["GET"])
def home():
    return "DinarSight Backend is running", 200

# 👉 Frontend UI route
@app.route("/app")
def frontend():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        image_file = request.files["image"]
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
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run()