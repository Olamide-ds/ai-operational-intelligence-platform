import os
from typing import Optional

from openai import OpenAI

_client: Optional[OpenAI] = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")
        _client = OpenAI(api_key=api_key)
    return _client


def generate(prompt: str) -> str:
    resp = _get_client().chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "Return ONLY valid JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0,
        response_format={"type": "json_object"},  # 🔥 forces JSON object
    )
    return resp.choices[0].message.content

