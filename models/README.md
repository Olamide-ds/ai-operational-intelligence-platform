# Model Artifacts

Serialized Isolation Forest used by `POST /anomaly/predict`.

| File | Purpose |
|---|---|
| `isolation_forest.pkl` | Fitted `sklearn.ensemble.IsolationForest` |
| `feature_list.pkl` | Ordered feature names expected at inference |
| `config.pkl` | Rolling-window sizes (`win_short=5`, `win_long=20`) |

## What changed

The model was retrained for payment-latency demonstration data.

- Previous training domain: NAB AWS EC2 CPU utilization (roughly 0–1 scale)
- Current training domain: synthetic payment p95 latency in milliseconds (~200 ms baseline, rare spikes)
- Feature engineering unchanged:
  - `value`
  - `rolling_mean_5`, `rolling_std_5`
  - `rolling_mean_20`, `rolling_std_20`
- API response contract unchanged:
  - `warmup_points_dropped`
  - `anomaly`
  - `anomaly_score`

Retraining script: `src/retrain_payment_latency.py`  
Training series: `data/training/payment_latency_train.csv` (10,000 points)

### Hyperparameters

```text
IsolationForest(
  n_estimators=200,
  contamination=0.01,
  random_state=42,
)
```

## Why retraining was the correct solution

The previous artifact treated nearly every payment-latency observation as anomalous because absolute `value` lived far outside the CPU training scale. Tree thresholds were learned near 0–1, so latency values near 200 ms collapsed to one out-of-distribution leaf.

Retraining on the same feature pipeline, but in the payment-latency scale, keeps Isolation Forest and the API intact while making demo results technically honest.

## Verification (local artifacts)

| Dataset | Result |
|---|---|
| `stable-payment-latency.csv` | 0 anomalies |
| `payment-latency-spikes.csv` | anomalies at data rows 35, 48, 63 |
| `payment-latency-drift.csv` | 0 anomalies with current threshold |

Re-run:

```bash
source .venv/bin/activate
PYTHONPATH=. python src/retrain_payment_latency.py
```

## Limitations of the new model

- Domain-specialized to payment-latency-like millisecond telemetry near a ~200 ms baseline. It is not a universal anomaly detector for arbitrary metrics.
- `contamination=0.01` is a training assumption, not a calibrated production false-positive budget.
- Gradual drift that stays below spike magnitude may not be flagged (observed on `payment-latency-drift.csv`).
- Rolling features can create short spillover around sharp spikes depending on contamination and local windows.
- Univariate only; no multi-metric correlation or seasonality model beyond simple synthetic wobble in training data.
- Labels were synthetic; production deployment still requires customer-specific baselines and validation.
