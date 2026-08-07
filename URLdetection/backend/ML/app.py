from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

from feature_extractor import extract_features

model = joblib.load("phishing_model.pkl")
FEATURE_COLUMNS = joblib.load("feature_columns.pkl")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten this to your frontend's origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)


class URLRequest(BaseModel):
    url: str


@app.post("/analyze")
def analyze(req: URLRequest):
    features = extract_features(req.url)
    row = pd.DataFrame([[features[c] for c in FEATURE_COLUMNS]], columns=FEATURE_COLUMNS)

    prediction = model.predict(row)[0]          # 1 = legitimate, -1 = phishing
    proba = model.predict_proba(row)[0]
    classes = list(model.classes_)
    phishing_prob = proba[classes.index(-1)] if -1 in classes else 0

    is_danger = prediction == -1
    risk = "High" if phishing_prob > 0.7 else ("Medium" if phishing_prob > 0.4 else "Low")

    # surface the features that most looked "phishing-like" for this URL
    suspicious_flags = [k for k, v in features.items() if v == -1]

    return {
        "url": req.url,
        "status": "Phishing Threat" if is_danger else "Fine",
        "isDanger": is_danger,
        "risk": risk,
        "phishingProbability": round(float(phishing_prob), 3),
        "reasons": suspicious_flags[:6],
        "features": features,
    }