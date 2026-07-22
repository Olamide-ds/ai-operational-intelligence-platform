# Operational Intelligence Platform

An AI-powered web application that helps engineering teams investigate operational anomalies faster.

Upload telemetry data, detect anomalous system behavior, and generate AI-powered operational explanations using Retrieval-Augmented Generation (RAG).

The project demonstrates how machine learning, modern APIs, and large language models can be combined into an end-to-end AI product.

---

# Live Demo

### 🌐 Product

https://operational-intelligence-five.vercel.app/

Experience the full application by uploading telemetry data, detecting anomalies, and generating AI-powered incident explanations.

### 📖 Backend API

https://anomaly-detection-api-z41e.onrender.com/docs

Swagger documentation for the FastAPI backend.

---

# Screenshots

> Add screenshots here.

### Dashboard

*(Dashboard screenshot)*

### Detect Anomalies

*(Results page showing anomaly detection)*

### AI Explanation

*(AI explanation page)*

---

# The Problem

Engineering teams continuously monitor operational telemetry, but identifying an anomaly is only the beginning.

Engineers still need to understand:

- What happened?
- Why did it happen?
- What should I investigate first?

This investigation process is often manual and time-consuming.

---

# The Solution

The Operational Intelligence Platform combines machine learning with AI to help engineers move from **alert → explanation → investigation** faster.

The platform:

- Detects anomalies in operational telemetry
- Visualizes abnormal system behavior
- Generates AI-powered operational explanations
- Suggests likely root causes and recommended next steps

---

# How to Use

### Step 1

Open the application and upload a CSV file containing ordered telemetry data.

### Step 2

Click **Analyze** to detect anomalies.

The platform automatically performs feature engineering and identifies anomalous observations.

### Step 3

Review the anomaly visualization and detection summary.

### Step 4

Click **Generate AI Explanation** to receive:

- probable root causes
- operational impact
- recommended next steps
- assumptions
- uncertainty level

---

# Architecture

```
Upload CSV
      │
      ▼
Feature Engineering
      │
      ▼
Isolation Forest
      │
      ▼
Anomaly Detection
      │
      ▼
RAG + OpenAI
      │
      ▼
AI Operational Explanation
```

---

# Technology Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Vite

### Backend

- FastAPI
- Python

### Machine Learning

- Isolation Forest
- Scikit-learn
- Pandas
- NumPy

### AI

- OpenAI
- Sentence Transformers
- FAISS
- Retrieval-Augmented Generation (RAG)

### Deployment

- Vercel
- Render
- Docker

---

# Future Improvements

- Live telemetry ingestion
- Drift detection and model monitoring
- Prometheus & Grafana integration
- Authentication
- Real-time alerting
- Kubernetes deployment

---

# License

MIT License
