import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "raw",
    "PhishingData.csv"
)

MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# -----------------------------
# Load Dataset
# -----------------------------
print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

# Remove spaces from column names
df.columns = df.columns.str.strip()

# Remove unwanted index column if present
if "index" in df.columns:
    df = df.drop(columns=["index"])

print("Dataset Shape :", df.shape)

# -----------------------------
# Features & Target
# -----------------------------
X = df.drop(columns=["Result"])
y = df["Result"]

feature_columns = list(X.columns)

# -----------------------------
# Split Dataset
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("Training Samples :", len(X_train))
print("Testing Samples  :", len(X_test))

# -----------------------------
# Train Model
# -----------------------------
print("Training Random Forest...")

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# -----------------------------
# Evaluation
# -----------------------------
predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nAccuracy :", round(accuracy * 100, 2), "%")

print("\nClassification Report")
print(classification_report(y_test, predictions))

print("\nConfusion Matrix")
print(confusion_matrix(y_test, predictions))

# -----------------------------
# Save Model
# -----------------------------
joblib.dump(
    model,
    os.path.join(MODEL_DIR, "phishing_model.pkl")
)

joblib.dump(
    feature_columns,
    os.path.join(MODEL_DIR, "feature_columns.pkl")
)

print("\nModel Saved Successfully!")

print(os.path.join(MODEL_DIR, "phishing_model.pkl"))
print(os.path.join(MODEL_DIR, "feature_columns.pkl"))