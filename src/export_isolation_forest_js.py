"""Export models/isolation_forest.pkl for the in-browser scorer."""

from __future__ import annotations

import json
from pathlib import Path

from app.anomaly.detector import load_artifacts

ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DATA = ROOT / "frontend" / "src" / "data"


def export_tree(estimator) -> dict:
    tree = estimator.tree_
    return {
        "feature": tree.feature.tolist(),
        "threshold": tree.threshold.tolist(),
        "left": tree.children_left.tolist(),
        "right": tree.children_right.tolist(),
        "n": tree.n_node_samples.tolist(),
    }


def main() -> None:
    artifacts = load_artifacts(ROOT / "models")
    model = artifacts.model
    payload = {
        "features": artifacts.features,
        "win_short": artifacts.win_short,
        "win_long": artifacts.win_long,
        "offset": float(model.offset_),
        "max_samples": int(model.max_samples_),
        "trees": [export_tree(estimator) for estimator in model.estimators_],
    }
    destination = FRONTEND_DATA / "isolationForestModel.json"
    destination.write_text(json.dumps(payload, separators=(",", ":")))
    print(f"Wrote {destination} ({destination.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
