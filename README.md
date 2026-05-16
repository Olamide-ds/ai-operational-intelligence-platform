# Anomaly Detection API (Time-Series)

Production-style anomaly detection service for univariate time-series monitoring data using rolling statistical features, Isolation Forest, FastAPI, and GenAI-powered operational explanations.

The API is designed to detect unusual patterns in continuous telemetry streams such as:
- CPU utilization
- Latency metrics
- IoT sensor readings
- Operational monitoring signals

---

## Live Demo
- Swagger Docs: https://anomaly-detection-api-z41e.onrender.com/docs

---

## Why This Project Matters

Monitoring metrics are continuous, mostly unlabeled, and anomaly-sparse.  
This project demonstrates how unsupervised anomaly detection can be exposed through a production-style API with:
- rolling-window feature engineering
- warm-up handling
- aligned anomaly scoring
- GenAI-powered operational explanations

---

## Dataset (AWS EC2 CPU Utilization)

The project was developed and tested using an EC2 CPU utilization time-series dataset representing typical cloud infrastructure telemetry.

Although development used CPU utilization data, the API is dataset-agnostic and accepts any univariate numeric time-series.

### Development & Validation
Validation included:
- Synthetic and sample sequences with injected spikes
- Manual testing through Swagger UI
- Spot-checking anomaly scores during normal vs abnormal periods

### Dataset Characteristics
- Signal: CPU utilization (%)
- Granularity: Time-ordered metric values sampled at fixed intervals
- Input Used: Univariate numeric sequence
- Labels: Not required (unsupervised learning)

### Preprocessing
- Sorted by timestamp
- Missing values handled
- Rolling-window statistical features generated:
  - rolling mean
  - rolling standard deviation

---

## Key Features

- Rolling statistical feature engineering
- Isolation Forest anomaly detection
- Warm-up handling for rolling windows
- REST API inference endpoint
- Dockerized deployment
- GenAI-powered anomaly explanations
- Retrieval-Augmented Generation (RAG)
- Structured JSON outputs

---

## Tech Stack

- FastAPI
- Python
- Scikit-learn
- Isolation Forest
- Pandas / NumPy
- Docker
- Sentence Transformers
- FAISS
- LLM-based structured generation

---

## How It Works

1. Input ordered numeric time-series values
2. Generate rolling statistical features
3. Apply Isolation Forest scoring
4. Return aligned anomaly flags and anomaly scores
5. Generate operational explanations using RAG + LLMs

---

## API

### `POST /predict`
Detect anomalies from an ordered list of time-series values.

#### Request Body
```json
{
  "values": [
    42.1, 42.3, 42.2, 42.4, 42.3,
    42.5, 42.4, 42.2, 42.3, 42.4,
    42.5, 42.6, 42.4, 42.3, 42.5,
    42.6, 42.4, 42.5, 42.3, 42.4,
    89.7, 42.5, 42.6, 42.4, 42.3
  ]
}
```

#### Response Interpretation
- `warmup_points_dropped`
  - Initial observations excluded while generating rolling-window features

- `anomaly`
  - `1` = anomaly detected
  - `0` = normal point
  - `null` = not scored during warm-up

- `anomaly_score`
  - More negative values indicate stronger anomalies

---
### `POST /explain-anomaly`
Generate a structured GenAI explanation for detected anomalies.

#### Request Body
```json
{
  "anomaly_output": {
    "anomalies": [20],
    "scores": [0.95],
    "mean": 42.3
  }
}
```

#### Response Interpretation
The GenAI explanation converts the raw anomaly output into an operational summary. It returns:

- `root_causes`: likely technical or operational reasons behind the anomaly
- `impact`: operational and business consequences of the anomaly
- `recommended_actions`: suggested next steps for investigation or mitigation
- `assumptions`: context the model used when generating the explanation
- `uncertainty`: confidence level and limitations of the explanation

This makes the API more useful for incident triage because it does not only flag abnormal behavior; it also helps teams understand what might have happened and what to do next.
