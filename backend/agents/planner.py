from __future__ import annotations

import json

from agents.state import ResearchState
from config import Settings
from llm.client import LLMClient


def _fallback_tasks(query: str) -> list[str]:
    return [
        f"Define the key concepts and scope for: {query}",
        f"Find current evidence and authoritative sources about: {query}",
        f"Identify disagreements, risks, or trade-offs related to: {query}",
        f"Summarize practical conclusions for: {query}",
    ]


def _parse_tasks(text: str, query: str) -> list[str]:
    try:
        data = json.loads(text)
        tasks = data.get("tasks", data if isinstance(data, list) else [])
        parsed = [str(item).strip() for item in tasks if str(item).strip()]
        return parsed[:5] or _fallback_tasks(query)
    except json.JSONDecodeError:
        return _fallback_tasks(query)


def plan_node(state: ResearchState, settings: Settings) -> ResearchState:
    prompt = (
        "Create 2-5 concise research sub-tasks for the user's question. "
        "Return only JSON in this shape: {\"tasks\":[\"...\"]}.\n\n"
        f"Question: {state['query']}"
    )
    try:
        response = LLMClient(settings).invoke(prompt)
        tasks = _parse_tasks(response, state["query"])
        message = f"Planned {len(tasks)} research tasks."
        errors = state["errors"]
    except Exception as exc:
        tasks = _fallback_tasks(state["query"])
        message = "Planner fell back to deterministic tasks."
        errors = [*state["errors"], f"Planner error: {exc}"]

    return {
        **state,
        "tasks": tasks,
        "current_task_index": 0,
        "messages": [*state["messages"], message],
        "errors": errors,
    }
