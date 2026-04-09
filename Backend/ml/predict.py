import sys
import json
import os
import numpy as np

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(SCRIPT_DIR, "plant_model.h5")
LABELS_PATH = os.path.join(SCRIPT_DIR, "labels.json")

def generate_remedy(plant, condition):
    if condition.lower() == "healthy":
        return [
            f"Your {plant} plant is perfectly healthy! No treatment needed.",
            "Maintain a regular watering schedule tailored to climate conditions.",
            "Ensure the plant continues to receive proper sunlight and soil nutrients.",
            "Periodically check under leaves and around stems for early pest signs."
        ]
    
    if "spot" in condition.lower() or "blight" in condition.lower():
        return [
            f"Apply an appropriate fungicide (like Copper-based or Chlorothalonil) specifically for {plant}.",
            "Immediately prune and safely destroy any severely infected leaves.",
            "Water the plant at the base to keep foliage dry, avoiding overhead irrigation.",
            "Ensure adequate spacing between plants to significantly improve air circulation."
        ]
        
    if "virus" in condition.lower() or "mosaic" in condition.lower():
        return [
            "There is no chemical cure for viral infections in plants.",
            "Immediately remove and securely destroy the entire infected plant to protect others.",
            "Sanitize all gardening tools with a 10% bleach solution after handling.",
            "Control aphid and insect vectors using insecticidal soaps or neem oil."
        ]
        
    if "mite" in condition.lower():
        return [
            "Apply a targeted miticide or pure neem oil to both sides of the leaves.",
            "Regularly spray the foliage with a strong jet of water to physically dislodge mites.",
            "Increase environmental humidity if possible, as mites thrive in extremely dry conditions.",
            "Prune heavily infested growth to save the rest of the plant."
        ]
        
    if "mold" in condition.lower() or "mildew" in condition.lower():
        return [
            "Apply a sulfur-based fungicide or potassium bicarbonate spray.",
            "Dramatically improve air ventilation around the foliage by selective pruning.",
            "Avoid dampness by watering only in the morning.",
            "Clear away fallen debris from the base of the plant to eliminate spore resting sites."
        ]

    # General diseased remedy fallback
    return [
        f"Isolate the affected {plant} immediately to prevent spread to neighboring crops.",
        "Consult a local agronomist or extension office for highly targeted chemical controls.",
        "Remove all visually diseased foliage and stems using sterilized pruning shears.",
        "Apply a broad-spectrum organic biopesticide or neem oil as a first line of defense."
    ]

def clean_class_name(raw_name):
    if "PlantVillage" in raw_name or "background" in raw_name.lower():
        return "Unrecognized Pattern", "Unknown Background Object"
        
    lower_raw = raw_name.lower()
    if "cotton" in lower_raw:
        condition = "Diseased" if "disease" in lower_raw else "Healthy"
        return "Cotton", condition
        
    # Example: "Tomato___Spider_mites_Two_spotted_spider_mite"
    name = raw_name.replace("___", " - ").replace("__", " ").replace("_", " ")
    name = name.replace("Two spotted spider mite", "(Two Spotted Spider Mite)")
    
    parts = name.split(" - ")
    plant = parts[0].strip().title()
    condition = parts[1].strip().title() if len(parts) > 1 else "Unknown Issue"
        
    return plant, condition

def predict_disease(image_path):
    if os.path.exists(MODEL_PATH) and os.path.exists(LABELS_PATH):
        from tensorflow.keras.models import load_model
        from tensorflow.keras.preprocessing import image as keras_image
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

        with open(LABELS_PATH, "r") as f:
            index_to_class = json.load(f)

        try:
            model = load_model(MODEL_PATH)
        except Exception:
            return { "disease": "Error Loading Model", "confidence": 0, "remedy": ["System failure."] }

        img = keras_image.load_img(image_path, target_size=(224, 224))
        img_array = keras_image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        predictions = model.predict(img_array, verbose=0)[0]
        class_idx = int(np.argmax(predictions))
        confidence = float(predictions[class_idx])

        raw_label = index_to_class.get(str(class_idx), "Unknown")
        plant, condition = clean_class_name(raw_label)
        
        disease_string = f"{plant}: {condition}" if plant != "Unrecognized Pattern" else condition

        return {
            "disease":    disease_string,
            "confidence": round(confidence * 100, 2),
            "remedy":     "\n".join(generate_remedy(plant, condition)),
            "_debug_raw": raw_label
        }

    return {
        "disease":    "⚠️ Model Still Training",
        "confidence": 0,
        "remedy":     "The actual predictive AI is still physically training in the background.\nPlease wait for plant_model.h5 to generation completion.\nTry your image again in about 5 minutes."
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
    print(json.dumps(result))
