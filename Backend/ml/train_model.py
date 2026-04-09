# ============================================================
# train_model.py — AgroGuard AI Plant Disease Detector
# ============================================================
# What this script does (step by step):
#   1. Loads images from dataset/train and dataset/validate
#   2. Resizes every image to 224x224 pixels
#   3. Normalizes pixel values from 0-255 to 0.0-1.0
#   4. Builds a CNN model for multi-class classification
#   5. Trains the model with progress shown each epoch
#   6. Plots training vs validation accuracy + loss graphs
#   7. Saves the trained model to model/model.h5
#   8. Saves class label names to model/labels.json
#
# Requirements:
#   pip install tensorflow pillow matplotlib
#
# Usage:
#   python train_model.py
# ============================================================

import os
import json
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

# ── Reproducibility ─────────────────────────────────────────
tf.random.set_seed(42)
np.random.seed(42)

# ============================================================
# SECTION 1 — CONFIGURATION
# All settings you might want to change are right here.
# ============================================================

# Paths are relative to where train_model.py lives (Backend/ml/)
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
TRAIN_DIR     = os.path.join(BASE_DIR, "..", "..", "Datasets", "Train")
VAL_DIR       = os.path.join(BASE_DIR, "..", "..", "Datasets", "Validation")
MODEL_DIR     = BASE_DIR                                  # Save model alongside predict.py
MODEL_PATH    = os.path.join(MODEL_DIR, "plant_model.h5") # predict.py looks for this exact name
LABELS_PATH   = os.path.join(MODEL_DIR, "labels.json")

IMG_HEIGHT    = 224
IMG_WIDTH     = 224
CHANNELS      = 3
BATCH_SIZE    = 32
EPOCHS        = 5           # Reduced to 5 for fast transfer learning
LEARNING_RATE = 0.001

print("=" * 60)
print("  AgroGuard AI — Plant Disease Model Training")
print("=" * 60)
print(f"\n  Train folder  : {TRAIN_DIR}")
print(f"  Val folder    : {VAL_DIR}")
print(f"  Image size    : {IMG_HEIGHT}x{IMG_WIDTH}")
print(f"  Batch size    : {BATCH_SIZE}")
print(f"  Max epochs    : {EPOCHS}")

os.makedirs(MODEL_DIR, exist_ok=True)

# ============================================================
# SECTION 2 — DATA LOADING AND AUGMENTATION
# ImageDataGenerator automatically:
#   - Reads images from subfolders (folder name = class label)
#   - Resizes images to target_size
#   - Returns batches of (image_array, one_hot_label)
# ============================================================

print("\n[1/5] Loading and preparing dataset...")

from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Training: apply augmentation to help the model generalize
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input, # MobileNetV2 specific preprocessing
    rotation_range=20,          # Rotate images randomly up to 20 degrees
    width_shift_range=0.1,      # Shift image left/right by up to 10%
    height_shift_range=0.1,     # Shift image up/down by up to 10%
    shear_range=0.1,            # Apply shear transformation
    zoom_range=0.15,            # Zoom in or out by up to 15%
    horizontal_flip=True,       # Randomly flip images left/right
    fill_mode="nearest",        # Fill new pixels after rotation/shift
    validation_split=0.2,       # Automatically reserve 20% of images for validation
)

# Validation: apply preprocessing and hook into the internal 20% split
val_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training",
    shuffle=True,
    seed=42,
)

val_generator = val_datagen.flow_from_directory(
    TRAIN_DIR,    # Use main training dir to ensure the exact same 20 classes are found
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation",
    shuffle=False,
)

NUM_CLASSES = train_generator.num_classes
CLASS_NAMES = list(train_generator.class_indices.keys())

print(f"\n  Found {NUM_CLASSES} disease classes:")
for i, name in enumerate(CLASS_NAMES):
    print(f"    [{i}] {name}")

# ============================================================
# SECTION 3 — SAVE CLASS LABELS
# Saves a JSON file mapping index to class name.
# predict.py will load this file to convert model output
# (e.g. index 2) back to a disease name (e.g. "Early_Blight")
# ============================================================

index_to_class = {str(v): k for k, v in train_generator.class_indices.items()}

with open(LABELS_PATH, "w") as f:
    json.dump(index_to_class, f, indent=2)

print(f"\n  Saved class labels to: {LABELS_PATH}")

# ============================================================
# SECTION 4 — BUILD THE ENHANCED CNN MODEL (Transfer Learning)
#
# Architecture overview:
#   Base Model: MobileNetV2 (Pre-trained on ImageNet)
#   Custom Head: GlobalAveragePooling -> Dense layers -> Softmax
# ============================================================

print("\n[2/5] Building Enhanced CNN model (MobileNetV2)...")

def build_cnn(num_classes, img_height, img_width, channels):
    from tensorflow.keras.applications import MobileNetV2
    
    # Load the pre-trained MobileNetV2 model, excluding its top classification layer
    base_model = MobileNetV2(
        weights="imagenet", 
        include_top=False, 
        input_shape=(img_height, img_width, channels)
    )
    
    # Freeze the base model layers so they don't get updated during early training
    base_model.trainable = False
    
    model = models.Sequential([
        base_model,
        # Convert feature maps to a flat vector
        layers.GlobalAveragePooling2D(),

        # Fully connected layers for classification
        layers.Dense(512, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.5),

        layers.Dense(256, activation="relu"),
        layers.Dropout(0.3),

        # Output: one probability per class
        layers.Dense(num_classes, activation="softmax"),
    ])
    return model

model = build_cnn(NUM_CLASSES, IMG_HEIGHT, IMG_WIDTH, CHANNELS)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

model.summary()
print(f"\n  Total parameters: {model.count_params():,}")

# ============================================================
# SECTION 5 — CALLBACKS
# Three callbacks run automatically during training:
#
#   ModelCheckpoint  — saves model.h5 when val_accuracy improves
#   EarlyStopping    — stops training if no improvement for 7 epochs
#   ReduceLROnPlateau — halves learning rate if val_loss is stuck
# ============================================================

callbacks = [
    ModelCheckpoint(
        filepath=MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        mode="max",
        verbose=1,
    ),
    EarlyStopping(
        monitor="val_accuracy",
        patience=7,
        restore_best_weights=True,
        verbose=1,
    ),
    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=4,
        min_lr=1e-7,
        verbose=1,
    ),
]

# ============================================================
# SECTION 6 — TRAIN
# ============================================================

print("\n[3/5] Training model...")
print(f"  Train images : {train_generator.samples}")
print(f"  Val images   : {val_generator.samples}")
print("-" * 60)

history = model.fit(
    train_generator,
    steps_per_epoch=100,      # Train on a random subset of 3,200 images per epoch for speed
    epochs=EPOCHS,
    validation_data=val_generator,
    validation_steps=20,      # Validate on a subset of 640 images
    callbacks=callbacks,
    verbose=2,
)

# ============================================================
# SECTION 7 — PRINT RESULTS
# ============================================================

print("\n[4/5] Training complete!")

best_val_acc   = max(history.history["val_accuracy"])
best_train_acc = max(history.history["accuracy"])
epochs_run     = len(history.history["accuracy"])

print("\n" + "=" * 60)
print("  RESULTS")
print("=" * 60)
print(f"  Epochs trained      : {epochs_run}")
print(f"  Best train accuracy : {best_train_acc * 100:.2f}%")
print(f"  Best val accuracy   : {best_val_acc  * 100:.2f}%")
print(f"  Model saved to      : {MODEL_PATH}")
print(f"  Labels saved to     : {LABELS_PATH}")
print("=" * 60)

# ============================================================
# SECTION 8 — PLOT ACCURACY AND LOSS CURVES
#
# Accuracy plot: train and val accuracy over epochs
#   - Both rising together = good
#   - Val much lower than train = overfitting
#
# Loss plot: train and val loss over epochs
#   - Both falling together = good
#   - Val loss rising while train loss falls = overfitting
# ============================================================

print("\n[5/5] Saving accuracy and loss plots...")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle("AgroGuard AI — Training History", fontsize=14, fontweight="bold")

epochs_range = range(1, epochs_run + 1)

# Accuracy
ax1.plot(epochs_range, history.history["accuracy"],
         label="Train Accuracy", color="#2E7D32", linewidth=2)
ax1.plot(epochs_range, history.history["val_accuracy"],
         label="Validation Accuracy", color="#8BC34A", linewidth=2, linestyle="--")
ax1.axhline(y=best_val_acc, color="#8BC34A", linestyle=":", alpha=0.5)
ax1.set_title("Accuracy per Epoch")
ax1.set_xlabel("Epoch")
ax1.set_ylabel("Accuracy")
ax1.set_ylim([0, 1.05])
ax1.legend()
ax1.grid(True, alpha=0.3)

# Loss
ax2.plot(epochs_range, history.history["loss"],
         label="Train Loss", color="#1565C0", linewidth=2)
ax2.plot(epochs_range, history.history["val_loss"],
         label="Validation Loss", color="#42A5F5", linewidth=2, linestyle="--")
ax2.set_title("Loss per Epoch")
ax2.set_xlabel("Epoch")
ax2.set_ylabel("Loss")
ax2.legend()
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plot_path = os.path.join(MODEL_DIR, "training_history.png")
plt.savefig(plot_path, dpi=150, bbox_inches="tight")
plt.show()

print(f"  Plot saved to: {plot_path}")
print("\n  All done! Model is ready to use with predict.py")
print("=" * 60)