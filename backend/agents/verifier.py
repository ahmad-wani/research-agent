from __future__ import annotations

import json

from agents.state import ResearchState
from config import Settings
from llm.client import LLMClient


def verify_node(state: ResearchState, settings: Settings) -> ResearchState:
    if len(state["findings"]) >= max(2, len(state["tasks"])):
        return {
            **state,
            "verified": True,
            "messages": [*state["messages"], "Verifier found enough source-backed coverage."],
        }

    prompt = (
        "Review whether the findings answer the original research question. "
        "Return JSON only: {\"verified\":true|false,\"new_tasks\":[\"...\"]}.\n\n"
        f"Question: {state['query']}\nTasks: {state['tasks']}\nFindings: {state['findings']}"
    )
    try:
        data = json.loads(LLMClient(settings).invoke(prompt))
        verified = bool(data.get("verified"))
        new_tasks = [str(item).strip() for item in data.get("new_tasks", []) if str(item).strip()]
    except Exception as exc:
        verified = False
        new_tasks = [f"Find additional authoritative evidence for: {state['query']}"]
        state = {**state, "errors": [*state["errors"], f"Verifier error: {exc}"]}

    tasks = state["tasks"]
    if not verified and state["retry_count"] < state["max_retries"]:
        tasks = [*tasks, *new_tasks[:2]]

    return {
        **state,
        "verified": verified,
        "tasks": tasks,
        "retry_count": state["retry_count"] + (0 if verified else 1),
        "messages": [
            *state["messages"],
            "Verifier approved findings." if verified else "Verifier requested more evidence.",
        ],
    }
