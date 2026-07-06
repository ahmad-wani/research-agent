from __future__ import annotations

from typing import Any

import httpx

from agents.state import Source
from config import Settings


class SearchToolError(RuntimeError):
    pass


class SerpApiSearchTool:
    endpoint = "https://serpapi.com/search"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def search(self, query: str, limit: int = 5) -> list[Source]:
        if not self.settings.serpapi_api_key:
            raise SearchToolError("SERPAPI_API_KEY is required for web search.")

        params: dict[str, Any] = {
            "api_key": self.settings.serpapi_api_key,
            "engine": self.settings.serpapi_engine,
            "q": query,
            "num": max(1, min(limit, 10)),
            "output": "json",
        }
        try:
            with httpx.Client(timeout=20.0) as client:
                response = client.get(self.endpoint, params=params)
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise SearchToolError(f"SerpApi search failed: {exc}") from exc

        payload = response.json()
        if payload.get("error"):
            raise SearchToolError(f"SerpApi search failed: {payload['error']}")

        return parse_serpapi_sources(payload)


def parse_serpapi_sources(payload: dict[str, Any]) -> list[Source]:
    items = payload.get("organic_results", [])
    if not isinstance(items, list):
        return []
    return [
        {
            "title": item.get("title", "Untitled source"),
            "url": item.get("link", ""),
            "snippet": item.get("snippet", ""),
            }
            for item in items
            if item.get("link")
        ]
