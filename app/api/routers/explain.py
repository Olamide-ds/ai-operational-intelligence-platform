from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

from app.rag.retriever import retrieve_context
from app.llm.client import generate
from app.llm.prompts import anomaly_explanation_prompt

router = APIRouter(prefix="/explain-anomaly", tags=["GenAI"])


class ExplainRequest(BaseModel):
    anomaly_output: dict


@router.post("")
def explain(req: ExplainRequest):
    # Retrieve investigation guidance only. The prompt forbids treating docs as confirmed causes.
    metric = str(req.anomaly_output.get("metric", "time-series metric"))
    context, sources = retrieve_context(
        f"{metric} anomaly investigation checklist latency telemetry"
    )

    prompt = anomaly_explanation_prompt(req.anomaly_output, context)
    raw = generate(prompt)

    # ✅ GUARANTEED PARSE (handles double-encoded JSON too)
    try:
        parsed = json.loads(raw)

        # If model returned JSON as a string, decode again:
        if isinstance(parsed, str):
            parsed = json.loads(parsed)

        # Final safety check: must be dict
        if not isinstance(parsed, dict):
            raise ValueError(f"Expected dict, got {type(parsed)}")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "LLM did not return valid JSON object",
                "exception": str(e),
                "raw_preview": raw[:500],
            },
        )

    return {"explanation": parsed, "sources": sources}

