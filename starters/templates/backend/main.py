"""Optional FastAPI sidecar — only if the problem needs Python (data science,
heavy pandas/statsmodels work). Run: uv sync && uv run uvicorn main:app --port 8000
The Next.js app proxies to it from API routes. Same provider rules as lib/llm.ts:
subscription (agy) first for local non-interactive calls, API key otherwise."""

import os
import shutil
import subprocess

from fastapi import FastAPI
from google import genai
from pydantic import BaseModel

app = FastAPI(title="hackathon-backend")

MODEL_MAIN = "gemini-3.6-flash"
MODEL_FAST = "gemini-3.5-flash-lite"

_client: genai.Client | None = None


def client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client()  # reads GEMINI_API_KEY
    return _client


def agy_available() -> bool:
    return os.environ.get("LLM_PROVIDER", "antigravity") != "api" and shutil.which("agy") is not None


def agy_generate(prompt: str, model: str = "gemini-3.6-flash-low") -> str:
    """Subscription-quota generation via the local agy CLI (~10-15s/call)."""
    return subprocess.run(
        ["agy", "-p", prompt, "--model", model, "--sandbox"],
        capture_output=True, text=True, timeout=240, check=True,
    ).stdout.strip()


class GenerateIn(BaseModel):
    prompt: str
    fast: bool = False


@app.get("/health")
def health() -> dict:
    res = client().models.generate_content(model=MODEL_FAST, contents="ping")
    return {"ok": True, "reply": (res.text or "")[:40]}


@app.post("/generate")
def generate(body: GenerateIn) -> dict:
    if agy_available():
        try:
            return {"text": agy_generate(body.prompt), "provider": "antigravity"}
        except Exception:  # noqa: BLE001 — fall through to API key
            pass
    model = MODEL_FAST if body.fast else MODEL_MAIN
    res = client().models.generate_content(model=model, contents=body.prompt)
    return {"text": res.text or "", "provider": "api"}
