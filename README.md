# Operational Intelligence Platform

An AI-powered web application that helps engineering teams investigate operational anomalies faster.

The platform allows users to upload telemetry data, detect anomalous system behavior, and generate AI-powered operational explanations using Retrieval-Augmented Generation (RAG).

It demonstrates how machine learning, modern APIs, semantic retrieval, and large language models can be combined into an end-to-end AI product.

---

# Live Demo

## 🌐 Product

https://operational-intelligence-five.vercel.app/

Interactive web application for anomaly detection and AI-powered incident investigation.

## 📖 API Documentation

https://anomaly-detection-api-z41e.onrender.com/docs

Swagger documentation for the backend inference API.

---

# The Problem

Modern engineering teams monitor thousands of operational metrics every minute.

Monitoring platforms can detect unusual behavior, but engineers still spend valuable time investigating:

- What happened?
- Why did it happen?
- How serious is it?
- Where should I begin investigating?

Most telemetry is unlabeled, making automated interpretation difficult.

---

# The Solution

The Operational Intelligence Platform separates anomaly detection from AI reasoning.

Machine learning identifies statistically unusual behavior while Retrieval-Augmented Generation (RAG) retrieves operational knowledge and an LLM generates structured explanations.

The result is a workflow that helps engineers move from **alert → explanation → investigation** much faster.

---

# How It Works

### Step 1 — Upload Telemetry

Open the web application and upload a CSV file containing an ordered numeric time-series.

Example CSV

| timestamp | value |
|-----------|------:|
| 1 | 42.1 |
| 2 | 42.3 |
| 3 | 42.2 |
| 4 | 89.7 |
| 5 | 42.5 |

---

### Step 2 — Detect Anomalies

Click **Analyze**.

The backend:

- validates the data
- performs rolling statistical feature engineering
- handles warm-up periods
- runs Isolation Forest
- calculates anomaly scores

---

### Step 3 — Review Results

The dashboard displays:

- anomaly labels
- anomaly scores
- anomaly visualization
- statistical summary

---

### Step 4 — Generate AI Explanation

Click **Generate AI Explanation**.

The system:

- retrieves relevant operational knowledge using FAISS
- sends contextual information to OpenAI
- generates a structured explanation

The response includes:

- probable root causes
- operational impact
- recommended next steps
- assumptions
- uncertainty level

---

# Product Workflow

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
Generate AI Explanation
      │
      ▼
Operational Recommendations
```

---

# System Architecture

```
               React Frontend
                      │
                      ▼
               FastAPI Backend
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
Isolation Forest            RAG Pipeline
          │                       │
          ▼                       ▼
   Anomaly Results          FAISS Retrieval
                                  │
                                  ▼
                             OpenAI GPT
                                  │
                                  ▼
                     Operational Explanation
```

---

# Features

- Interactive React dashboard
- CSV upload interface
- Time-series anomaly detection
- Isolation Forest inference
- Rolling statistical features
- Warm-up handling
- Retrieval-Augmented Generation (RAG)
- AI-generated operational explanations
- REST API
- Dockerized backend
- Production-style architecture

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

## Backend

- FastAPI
- Python
- Uvicorn

## Machine Learning

- Isolation Forest
- Scikit-learn
- Pandas
- NumPy

## AI & Retrieval

- OpenAI API
- Sentence Transformers
- FAISS
- Retrieval-Augmented Generation (RAG)

## Deployment

- Vercel
- Render
- Docker

---

# API

## POST `/predict`

Detect anomalies from ordered telemetry.

Example request

```json
{
  "values": [
    42.1,
    42.3,
    42.2,
    89.7,
    42.5
  ]
}
```

Returns

- anomaly labels
- anomaly scores
- warm-up metadata

---

## POST `/explain-anomaly`

Generate an AI-powered operational explanation.

Example request

```json
{
  "anomaly_output": {
    "anomalies": [20],
    "scores": [0.95],
    "mean": 42.3
  }
}
```

Returns

- probable root causes
- operational impact
- recommended actions
- assumptions
- uncertainty level

---

# Design Decisions

## Why Isolation Forest?

Production telemetry rarely contains labeled anomalies.

Isolation Forest provides efficient unsupervised anomaly detection while remaining fast and interpretable.

## Why separate ML from LLMs?

The machine learning model detects anomalies.

The LLM only explains them.

This separation keeps anomaly detection deterministic, explainable, and independently testable.

## Why RAG?

Rather than relying only on the language model, Retrieval-Augmented Generation grounds explanations using operational knowledge retrieved through semantic search, improving consistency and reducing hallucinations.

---

# Validation

Validated using:

- AWS EC2 CPU utilization telemetry
- Synthetic anomaly injection
- Swagger API testing
- End-to-end testing through the React application

---

# Future Improvements

- Streaming telemetry ingestion (Kafka)
- Prometheus & Grafana integration
- Drift detection and model monitoring
- User feedback loop
- Authentication
- Batch processing
- Real-time alerting
- Kubernetes deployment
- CI/CD pipeline

---

# License

MIT License
