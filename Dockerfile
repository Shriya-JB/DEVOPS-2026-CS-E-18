FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY URLdetection/backend/ML/app.py /app/app.py
COPY URLdetection/backend/ML/feature_extractor.py /app/feature_extractor.py

COPY URLdetection/models /app/models

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]