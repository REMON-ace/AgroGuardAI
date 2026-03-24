#!/usr/bin/env python3
# ============================================================
# ml/predict.py - Plant Disease Detection ML Model
# ============================================================
# This script receives an image path as argument,
# runs it through a trained model, and prints JSON to stdout.
#
# Node.js backend calls this via child_process.spawn().
#
# HOW TO INTEGRATE YOUR REAL MODEL:
#   1. Replace the stub logic below with your actual model code
#   2. Install dependencies: pip install tensorflow pillow numpy
#   3. Load your saved model (e.g. model.h5 or SavedModel folder)
#   4. Run inference and print JSON to stdout
# ============================================================

import sys
import json
import os

# ── Stub disease classes (replace with your model's classes) ──
DISEASE_CLASSES = [
    "Healthy",
    "Early Blight",
    "Late Blight",
    "Powdery Mildew",
    "Leaf Spot",
    "Bacterial Blight",
    "Rust",
    "Mosaic Virus",
]

REMEDY_MAP = {
    "Healthy":          "Your plant looks healthy! Keep up the good care.",
    "Early Blight":     "Apply fungicide (chlorothalonil). Remove infected leaves. Avoid overhead watering.",
    "Late Blight":      "Apply systemic fungicide (metalaxyl). Destroy infected material. Ensure good drainage.",
    "Powdery Mildew":   "Spray neem oil or potassium bicarbonate. Improve air circulation.",
    "Leaf Spot":        "Apply copper-based fungicide. Remove affected leaves. Avoid wetting foliage.",
    "Bacterial Blight": "Use copper bactericide. Sanitize tools. Avoid working when plants are wet.",
    "Rust":             "Apply triazole fungicide. Remove infected leaves. Avoid evening watering.",
    "Mosaic Virus":     "No cure – remove infected plants. Control aphids with neem oil.",
}


def predict_disease(image_path):
    """
    ── REAL MODEL INTEGRATION ──────────────────────────────────
    Uncomment and adapt this block when your model is ready:

    import numpy as np
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing import image as keras_image

    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'plant_model.h5')
    model = load_model(MODEL_PATH)

    img = keras_image.load_img(image_path, target_size=(224, 224))
    img_array = keras_image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)[0]
    class_idx   = int(np.argmax(predictions))
    confidence  = float(predictions[class_idx])

    disease = DISEASE_CLASSES[class_idx]
    remedy  = REMEDY_MAP.get(disease, "Consult an agronomist.")

    return {"disease": disease, "confidence": round(confidence * 100, 2), "remedy": remedy}
    ── END REAL MODEL ───────────────────────────────────────────
    """

    # ── STUB: returns a mock result until real model is added ──
    # Uses filename hash to pick a consistent (fake) disease
    file_hash   = sum(ord(c) for c in os.path.basename(image_path))
    idx         = file_hash % len(DISEASE_CLASSES)
    disease     = DISEASE_CLASSES[idx]
    confidence  = round(70.0 + (file_hash % 25), 2)  # 70–95%
    remedy      = REMEDY_MAP.get(disease, "Consult an agronomist.")

    return {
        "disease":    disease,
        "confidence": confidence,
        "remedy":     remedy,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(json.dumps({"error": f"File not found: {image_path}"}))
        sys.exit(1)

    result = predict_disease(image_path)
    print(json.dumps(result))   # Node.js reads this stdout
