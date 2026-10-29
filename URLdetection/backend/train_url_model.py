import os
import sys

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from feature_extractor import extract_features

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "raw", "malicious_phish.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(DATASET_PATH)
df.columns = df.columns.str.strip()

# Keep only benign vs phishing; 1 = phishing (what app.py expects)
df = df[df["type"].isin(["benign", "phishing"])].copy()
df["label"] = (df["type"] == "phishing").astype(int)
print("Rows:", len(df))
print(df["label"].value_counts())

print("Extracting features (this can take a minute or two)...")
features = pd.DataFrame([extract_features(u) for u in df["url"].astype(str)])
FEATURE_COLUMNS = list(features.columns)
y = df["label"].values

X_train, X_test, y_train, y_test = train_test_split(
    features, y, test_size=0.2, random_state=42, stratify=y
)

print("Training...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    min_samples_leaf=5,   # keeps the model file small enough for GitHub/Render
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print("Accuracy:", round(accuracy_score(y_test, preds), 4))
print(classification_report(y_test, preds))

joblib.dump(model, os.path.join(MODEL_DIR, "phishguard_model.pkl"))
joblib.dump(FEATURE_COLUMNS, os.path.join(MODEL_DIR, "feature_columns.pkl"))
print("Saved to", MODEL_DIR)