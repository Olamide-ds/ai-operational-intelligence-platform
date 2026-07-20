def anomaly_explanation_prompt(anomaly_output: dict, context: str) -> str:
    return f"""
You explain Isolation Forest anomaly detections for an operational intelligence product.

Return ONLY valid JSON (no markdown, no backticks, no commentary).
Do NOT wrap the JSON in quotes.

Schema (must match exactly):
{{
  "root_causes": [string],
  "impact": {{
    "operational": string,
    "business": string
  }},
  "recommended_actions": [string],
  "assumptions": [string],
  "uncertainty": string
}}

Evidence rules (strict):
- The uploaded dataset and anomaly_output contain only a univariate metric series (and optional timestamps).
- They do NOT contain logs, deployments, CPU, memory, network, database metrics, traffic volume, or confirmed root causes.
- Never state a specific root cause as fact unless that evidence appears in anomaly_output.
- Distinguish what the data demonstrates from plausible hypotheses that require further investigation.
- Reference material below is optional historical/investigation guidance only. Do NOT copy its root causes as facts for this upload.
- Prefer language such as: "may indicate...", "could be associated with...", "requires further investigation...", "additional telemetry is required...".
- Keep each string concise: 2–3 sentences maximum.

Field guidance:
- root_causes: 1–2 strings describing ONLY what the uploaded series and anomaly_output demonstrate (counts, unusual spikes/drift relative to surrounding baseline, metric name if provided). Do NOT invent a causal mechanism.
- impact.operational: realistic operational consequences WITHOUT assuming a root cause.
- impact.business: realistic business consequences WITHOUT assuming a root cause (e.g. customer experience or SLA risk IF the series represents production).
- recommended_actions: investigation paths and additional telemetry to gather; do NOT prescribe a specific fix.
- assumptions: what you assumed because it was not in the upload.
- uncertainty: explicitly state that root cause cannot be determined from this series alone.

Good style example (adapt counts/metric from anomaly_output; do not copy verbatim if numbers differ):
- root_causes: ["These flagged observations are unusual latency spikes that deviate significantly from the surrounding baseline in the uploaded series."]
- impact.business: "If representative of production traffic, these latency spikes could increase request response times, affect customer experience, or contribute to SLA degradation."
- recommended_actions: ["Review deployments, infrastructure utilization, upstream dependencies, database performance, or third-party services around the detected timestamps. Additional telemetry such as logs, CPU, memory, network, and database metrics would be required to determine the root cause."]

anomaly_output:
{anomaly_output}

reference_material (not evidence for this upload):
{context or "(none)"}
"""
