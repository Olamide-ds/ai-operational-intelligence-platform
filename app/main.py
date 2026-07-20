import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import anomaly, explain

app = FastAPI(
    title="Operational Intelligence API",
    version="1.0.0"
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "HEAD", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
    )


@app.get("/", include_in_schema=False)
@app.head("/", include_in_schema=False)
def root():
    return {"status": "ok"}

app.include_router(anomaly.router)
app.include_router(explain.router)


