# AI-Powered Operational Intelligence Platform

A production-style AI application that detects anomalies in operational telemetry using Isolation Forest and accelerates incident investigation with Retrieval-Augmented Generation (RAG) and LLM-powered operational explanations.

This project demonstrates how modern AI systems combine machine learning, APIs, retrieval pipelines, and large language models into an end-to-end product for engineering and operations teams.

---

# Live Demo

## 🌐 Product

https://operational-intelligence-five.vercel.app/

Interactive dashboard for uploading telemetry, detecting anomalies, and generating AI-powered incident explanations.

## 📖 API Documentation

https://anomaly-detection-api-z41e.onrender.com/docs

FastAPI Swagger documentation for the backend inference service.

---

# Problem

Engineering teams continuously monitor telemetry generated from:

- Cloud infrastructure
- Application latency
- CPU utilization
- Memory usage
- IoT devices
- Operational monitoring systems

Although monitoring platforms can surface abnormal behavior, engineers still spend significant time manually investigating incidents to answer questions such as:

- What happened?
- Why did it happen?
- How severe is it?
- What should I investigate first?

Most operational telemetry is unlabeled, making automated interpretation difficult and slowing incident response.

---

# Solution

The Operational Intelligence Platform separates anomaly detection from AI reasoning.

A deterministic machine learning model identifies statistically unusual behavior, while a Retrieval-Augmented Generation (RAG) pipeline retrieves operational knowledge and uses a Large Language Model to generate structured incident explanations.

This architecture improves explainability while keeping anomaly detection reliable, interpretable, and independently testable.

The platform:

- Accepts ordered numeric time-series telemetry
- Engineers rolling statistical features
- Detects anomalies using Isolation Forest
- Exposes prediction services through FastAPI
- Retrieves operational knowledge using FAISS vector search
- Generates AI-powered operational explanations using OpenAI

---

# System Architecture

```
                Operational Telemetry
                        │
                        ▼
          Rolling Statistical Features
                        │
                        ▼
             Isolation Forest Model
                        │
                        ▼
            Anomaly Scores & Labels
                        │
                        ▼
                FastAPI REST API
                        │
                        ▼
         Retrieval-Augmented Generation
       (Sentence Transformers + FAISS)
                        │
                        ▼
               OpenAI GPT Generation
                        │
                        ▼
      AI Operational Incident Explanation
                        │
                        ▼
             React Frontend Dashboard
```

---

# Product Features

- Interactive React dashboard
- CSV telemetry upload
- Real-time anomaly detection
- Isolation Forest inference pipeline
- AI-powered incident explanations
- Retrieval-Augmented Generation (RAG)
- Structured operational recommendations
- REST API architecture
- Dockerized backend deployment
- Production-style modular design

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

- Scikit-learn
- Isolation Forest
- Pandas
- NumPy

## Retrieval

- Sentence Transformers
- FAISS

## Generative AI

- OpenAI API
- Retrieval-Augmented Generation (RAG)

## Deployment

- Vercel
- Render
- Docker

---

# Application Workflow

1. Upload operational telemetry through the web interface.

2. Backend performs rolling statistical feature engineering.

3. Isolation Forest detects anomalous observations.

4. Prediction results are returned through FastAPI.

5. Relevant operational knowledge is retrieved using semantic vector search.

6. GPT generates contextual explanations including:

- probable root causes
- operational impact
- recommended investigations
- assumptions
- uncertainty level

7. Results are visualized through the Operational Intelligence dashboard.

---

# API Endpoints

## POST `/predict`

Detect anomalies from ordered numeric telemetry.

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
- rolling feature metadata
- warm-up handling

---

## POST `/explain-anomaly`

Generate AI-powered operational explanations.

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

# Validation

The platform was validated using:

- AWS EC2 CPU utilization telemetry
- Synthetic anomaly injection
- Manual API testing via Swagger UI
- End-to-end testing through the React frontend

Isolation Forest was selected because production telemetry rarely contains labeled anomalies, making unsupervised learning an effective approach for identifying unusual operational behavior.

---

# Design Decisions

### Why Isolation Forest?

Isolation Forest provides efficient unsupervised anomaly detection without requiring labeled training data.

### Why separate ML from LLM reasoning?

The machine learning model is responsible only for anomaly detection.

The LLM never decides whether a data point is anomalous—it only explains results produced by the ML model.

This separation improves:

- reliability
- explainability
- maintainability
- testing

### Why Retrieval-Augmented Generation?

RAG grounds AI explanations in operational knowledge instead of relying solely on the language model's internal knowledge, reducing hallucinations and improving consistency.

---

# Repository Highlights

This project demonstrates:

- Production-style FastAPI development
- End-to-end AI application architecture
- Machine Learning inference pipelines
- Retrieval-Augmented Generation (RAG)
- LLM integration
- Semantic search using FAISS
- REST API development
- Docker containerization
- Operational Intelligence workflows
- Separation of deterministic ML from AI reasoning

---

# Future Improvements

- Streaming telemetry ingestion (Kafka)
- Prometheus & Grafana integration
- Drift detection and model monitoring
- User feedback loop for explanation quality
- Authentication & authorization
- Batch prediction endpoints
- Real-time anomaly alerting
- Kubernetes deployment
- CI/CD pipeline
- Observability dashboards

---

# License

MIT License
