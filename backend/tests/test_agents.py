from __future__ import annotations

from agents.planner import _parse_tasks
from tools.search_tool import parse_serpapi_sources


def test_parse_tasks_from_json() -> None:
    tasks = _parse_tasks('{"tasks":["one","two"]}', "query")
    assert tasks == ["one", "two"]


def test_parse_tasks_falls_back() -> None:
    tasks = _parse_tasks("not json", "climate risk")
    assert len(tasks) == 4
    assert "climate risk" in tasks[0]


def test_parse_serpapi_sources() -> None:
    sources = parse_serpapi_sources(
        {
            "organic_results": [
                {
                    "title": "Example",
                    "link": "https://example.com",
                    "snippet": "A useful result.",
                }
            ]
        }
    )

    assert sources == [
        {
            "title": "Example",
            "url": "https://example.com",
            "snippet": "A useful result.",
        }
    ]
