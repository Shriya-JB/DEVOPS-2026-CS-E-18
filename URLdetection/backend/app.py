from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

from feature_extractor import extract_features

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent

if (BASE_DIR / "models").exists():
    MODEL_DIR = BASE_DIR / "models"
else:
    MODEL_DIR = BASE_DIR.parents[2] / "models"


model = joblib.load(MODEL_DIR / "phishguard_model.pkl")
FEATURE_COLUMNS = joblib.load(MODEL_DIR / "feature_columns.pkl")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class URLRequest(BaseModel):
    url: str


@app.post("/analyze")
def analyze(req: URLRequest):

    features = extract_features(req.url)

    row = pd.DataFrame(
        [[features[c] for c in FEATURE_COLUMNS]],
        columns=FEATURE_COLUMNS
    )

    prediction = model.predict(row)[0]

    proba = model.predict_proba(row)[0]
    classes = list(model.classes_)

    # 1 = phishing in our model
    phishing_prob = proba[classes.index(1)] if 1 in classes else 0

    is_danger = bool(prediction == 1)

    risk = (
        "High" if phishing_prob > 0.7
        else "Medium" if phishing_prob > 0.4
        else "Low"
    )

    # Flag features that are meaningfully high/suspicious (not -1 based)
    suspicious_flags = []
    if features.get("has_ip"):
        suspicious_flags.append("has_ip")
    if features.get("num_hyphens", 0) > 2:
        suspicious_flags.append("num_hyphens")
    if features.get("num_subdomains", 0) > 3:
        suspicious_flags.append("num_subdomains")
    if not features.get("has_https"):
        suspicious_flags.append("has_https")
    if features.get("suspicious_words", 0) > 0:
        suspicious_flags.append("suspicious_words")
    if features.get("digit_ratio", 0) > 0.3:
        suspicious_flags.append("digit_ratio")

    safe_features = {
        key: (value.item() if hasattr(value, "item") else value)
        for key, value in features.items()
    }

    return {
        "url": req.url,
        "status": "Phishing Threat" if is_danger else "Fine",
        "isDanger": is_danger,
        "risk": risk,
        "phishingProbability": round(float(phishing_prob), 3),
        "reasons": suspicious_flags[:6],
        "features": safe_features,
    }