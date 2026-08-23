from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

from feature_extractor import extract_features

from pathlib import Path


# --------------------------------------------------
# Model paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

# Docker:
# /app/app.py
# /app/models/
#
# Local:
# CyberAI/URLdetection/backend/ML/app.py
# CyberAI/URLdetection/models/

if (BASE_DIR / "models").exists():
    MODEL_DIR = BASE_DIR / "models"
else:
    MODEL_DIR = BASE_DIR.parents[2] / "models"


model = joblib.load(MODEL_DIR / "phishing_model.pkl")
FEATURE_COLUMNS = joblib.load(MODEL_DIR / "feature_columns.pkl")


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI()


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request model
# --------------------------------------------------

class URLRequest(BaseModel):
    url: str


# --------------------------------------------------
# URL Analysis Endpoint
# --------------------------------------------------

@app.post("/analyze")
def analyze(req: URLRequest):

    # Extract URL features
    features = extract_features(req.url)

    # Create dataframe in the exact feature order
    row = pd.DataFrame(
        [[features[c] for c in FEATURE_COLUMNS]],
        columns=FEATURE_COLUMNS
    )

    # ML prediction
    prediction = model.predict(row)[0]

    # Prediction probabilities
    proba = model.predict_proba(row)[0]
    classes = list(model.classes_)

    # Get phishing probability
    phishing_prob = (
        proba[classes.index(-1)]
        if -1 in classes
        else 0
    )

    # Convert NumPy boolean to native Python bool
    is_danger = bool(prediction == -1)

    # Determine risk level
    risk = (
        "High"
        if phishing_prob > 0.7
        else (
            "Medium"
            if phishing_prob > 0.4
            else "Low"
        )
    )

    # Find suspicious features
    suspicious_flags = [
        key
        for key, value in features.items()
        if value == -1
    ]

    # Convert NumPy values to JSON-safe Python values
    safe_features = {
        key: (
            value.item()
            if hasattr(value, "item")
            else value
        )
        for key, value in features.items()
    }

    # Return analysis result
    return {
        "url": req.url,
        "status": "Phishing Threat" if is_danger else "Fine",
        "isDanger": is_danger,
        "risk": risk,
        "phishingProbability": round(float(phishing_prob), 3),
        "reasons": suspicious_flags[:6],
        "features": safe_features,
    }