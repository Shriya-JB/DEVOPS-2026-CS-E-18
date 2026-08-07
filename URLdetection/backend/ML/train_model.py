import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Load your full dataset (place the CSV in the same folder)
df = pd.read_csv("phishing_dataset.csv")

# Clean column names (strip stray spaces from headers/values)
df.columns = [c.strip() for c in df.columns]

# Drop the index column if present
if "index" in df.columns:
    df = df.drop(columns=["index"])

FEATURE_COLUMNS = [c for c in df.columns if c != "Result"]

X = df[FEATURE_COLUMNS]
y = df["Result"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, preds))
print(classification_report(y_test, preds))

# Save the model AND the exact feature order it expects
joblib.dump(model, "phishing_model.pkl")
joblib.dump(FEATURE_COLUMNS, "feature_columns.pkl")
print("Saved phishing_model.pkl and feature_columns.pkl")