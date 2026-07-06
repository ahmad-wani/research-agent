from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseModel, Field


DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


class Settings(BaseModel):
    app_env: str = "development"
    cors_origins: list[str] = Field(default_factory=lambda: DEFAULT_CORS_ORIGINS.copy())
    llm_provider: str = "groq"
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.5-flash"
    serpapi_api_key: str | None = None
    serpapi_engine: str = "google"
    search_results_limit: int = 5
    fetch_max_chars: int = 12000
    agent_max_retries: int = 2


def _csv(value: str | None, default: list[str]) -> list[str]:
    if not value:
        return default
    return [part.strip() for part in value.split(",") if part.strip()]


@lru_cache
def get_settings() -> Settings:
    load_dotenv()
    return Settings(
        app_env=os.getenv("APP_ENV", "development"),
        cors_origins=_csv(os.getenv("BACKEND_CORS_ORIGINS"), DEFAULT_CORS_ORIGINS),
        llm_provider=os.getenv("LLM_PROVIDER", "groq"),
        groq_api_key=os.getenv("GROQ_API_KEY"),
        groq_model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        gemini_api_key=os.getenv("GEMINI_API_KEY"),
        gemini_model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
        serpapi_api_key=os.getenv("SERPAPI_API_KEY"),
        serpapi_engine=os.getenv("SERPAPI_ENGINE", "google"),
        search_results_limit=int(os.getenv("SEARCH_RESULTS_LIMIT", "5")),
        fetch_max_chars=int(os.getenv("FETCH_MAX_CHARS", "12000")),
        agent_max_retries=int(os.getenv("AGENT_MAX_RETRIES", "2")),
    )
