"""
Retrain Isolation Forest on payment-latency telemetry.

Preserves the existing feature engineering and API contract in app/anomaly/detector.py.
"""

from __future__ import annotations

import csv
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

from app.anomaly.detector import build_features, predict_anomalies

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "models"
TRAINING_DIR = ROOT / "data" / "training"
TEST_DIR = ROOT / "operational-intelligence-test-data"

FEATURES = [
    "value",
    "rolling_mean_5",
    "rolling_std_5",
    "rolling_mean_20",
    "rolling_std_20",
]
WIN_SHORT = 5
WIN_LONG = 20


def generate_payment_latency_series(
    n_points: int = 10_000,
    seed: int = 42,
    spike_rate: float = 0.012,
) -> np.ndarray:
    """
    Synthetic payment p95 latency (ms): stable ~200 ms baseline with rare spikes.

    Includes isolated single-point spikes so the model learns high `value` + short-window
    deviation even when the long rolling window is still near baseline.
    """
    rng = np.random.default_rng(seed)
    values = 200.0 + rng.normal(0.0, 4.0, size=n_points)

    # Mild diurnal-style wobble without changing the operating scale.
    t = np.arange(n_points)
    values += 3.0 * np.sin(t / 45.0)

    # Keep spikes away from each other so long-window features recover between events.
    min_gap = 40
    candidate_indexes = list(range(WIN_LONG + 5, n_points - 5))
    rng.shuffle(candidate_indexes)
    selected: list[int] = []
    for index in candidate_indexes:
        if all(abs(index - existing) >= min_gap for existing in selected):
            selected.append(index)
        if len(selected) >= max(1, int(round(n_points * spike_rate))):
            break

    for index in selected:
        # Cover the demo spike magnitudes (about 760–1120 ms).
        values[index] = float(rng.uniform(750.0, 1150.0))

    return values.astype(float)


def write_training_csv(values: np.ndarray, path: Path) -> None:
    from datetime import datetime, timedelta

    path.parent.mkdir(parents=True, exist_ok=True)
    start = datetime(2026, 1, 1, 0, 0, 0)
    with path.open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["timestamp", "payment_latency_ms"])
        for index, value in enumerate(values):
            timestamp = start + timedelta(minutes=index)
            writer.writerow([timestamp.isoformat(), f"{value:.3f}"])


def train_model(values: np.ndarray) -> IsolationForest:
    features = build_features(values.tolist(), WIN_SHORT, WIN_LONG)[FEATURES]
    model = IsolationForest(
        n_estimators=200,
        contamination=0.01,
        random_state=42,
    )
    model.fit(features)
    return model


def save_artifacts(model: IsolationForest) -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_DIR / "isolation_forest.pkl")
    joblib.dump(FEATURES, MODEL_DIR / "feature_list.pkl")
    joblib.dump({"win_short": WIN_SHORT, "win_long": WIN_LONG}, MODEL_DIR / "config.pkl")


def load_test_values(path: Path) -> list[float]:
    with path.open() as handle:
        return [float(row["payment_latency_ms"]) for row in csv.DictReader(handle)]


def summarize(name: str, values: list[float]) -> dict:
    result = predict_anomalies(values, MODEL_DIR)
    flags = result["anomaly"]
    scores = result["anomaly_score"]
    anomaly_indexes = [index for index, flag in enumerate(flags) if flag == 1]
    anomaly_count = len(anomaly_indexes)
    scored = sum(flag is not None for flag in flags)

    spike_like = [
        index + 1
        for index, value in enumerate(values)
        if value >= 500 and flags[index] == 1
    ]
    non_spike = [
        index + 1
        for index, value in enumerate(values)
        if value < 500 and flags[index] == 1
    ]

    return {
        "name": name,
        "rows": len(values),
        "scored": scored,
        "anomaly_count": anomaly_count,
        "anomaly_rate_scored": anomaly_count / scored if scored else 0.0,
        "anomaly_rows_1_based": [index + 1 for index in anomaly_indexes],
        "spike_rows_flagged": spike_like,
        "non_spike_rows_flagged": non_spike,
        "score_min": min((score for score in scores if score is not None), default=None),
        "score_max": max((score for score in scores if score is not None), default=None),
    }


def main() -> None:
    values = generate_payment_latency_series()
    training_csv = TRAINING_DIR / "payment_latency_train.csv"
    write_training_csv(values, training_csv)

    model = train_model(values)
    save_artifacts(model)

    print(f"Saved artifacts to {MODEL_DIR}")
    print(f"Training series written to {training_csv} ({len(values)} rows)")
    print(f"Model: {model}")
    print(f"offset_: {model.offset_}")

    evaluations = [
        summarize("stable-payment-latency.csv", load_test_values(TEST_DIR / "stable-payment-latency.csv")),
        summarize("payment-latency-spikes.csv", load_test_values(TEST_DIR / "payment-latency-spikes.csv")),
        summarize("payment-latency-drift.csv", load_test_values(TEST_DIR / "payment-latency-drift.csv")),
    ]

    for evaluation in evaluations:
        print("\n===", evaluation["name"], "===")
        for key, value in evaluation.items():
            if key == "name":
                continue
            print(f"{key}: {value}")


if __name__ == "__main__":
    main()
