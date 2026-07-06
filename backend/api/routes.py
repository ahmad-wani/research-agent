from __future__ import annotations

import json
from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from agents.graph import build_graph
from agents.state import ResearchState
from config import get_settings

router = APIRouter()


class ResearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=1000)


def _sse(event: str, payload: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(payload, ensure_ascii=True)}\n\n"


def _activity_payload(stage: str, state: ResearchState) -> dict:
    stage_copy = {
        "planner": {
            "title": "Plan created",
            "detail": f"{len(state['tasks'])} research tasks prepared.",
        },
        "worker": {
            "title": "Evidence collected",
            "detail": f"{len(state['findings'])} findings from {len(state['sources'])} sources.",
        },
        "verifier": {
            "title": "Evidence verified" if state["verified"] else "More evidence requested",
            "detail": (
                "Coverage looks strong enough for synthesis."
                if state["verified"]
                else f"Retry {state['retry_count']} of {state['max_retries']} queued."
            ),
        },
        "synthesizer": {
            "title": "Report generated",
            "detail": "The final cited report is ready.",
        },
    }
    copy = stage_copy.get(stage, {"title": stage.title(), "detail": "Agent step completed."})
    return {
        "stage": stage,
        "title": copy["title"],
        "detail": copy["detail"],
        "tasks": state["tasks"],
        "current_task_index": state["current_task_index"],
        "findings_count": len(state["findings"]),
        "sources": state["sources"],
        "errors": state["errors"],
        "state": state,
    }


@router.post("/research/stream")
async def stream_research(request: ResearchRequest) -> StreamingResponse:
    settings = get_settings()
    graph = build_graph(settings)
    initial_state: ResearchState = {
        "query": request.query,
        "tasks": [],
        "current_task_index": 0,
        "findings": [],
        "verified": False,
        "retry_count": 0,
        "max_retries": settings.agent_max_retries,
        "messages": [],
        "report": "",
        "sources": [],
        "errors": [],
    }

    async def event_stream() -> AsyncIterator[str]:
        yield _sse(
            "status",
            {
                "stage": "queued",
                "title": "Research queued",
                "detail": "The agent is preparing a plan.",
                "tasks": [],
                "sources": [],
                "errors": [],
            },
        )
        final_state: ResearchState | None = None
        try:
            async for update in graph.astream(initial_state):
                for node_name, node_state in update.items():
                    final_state = node_state
                    yield _sse("update", _activity_payload(node_name, node_state))
            yield _sse(
                "complete",
                {
                    **_activity_payload("complete", final_state or initial_state),
                    "title": "Research complete",
                    "detail": "Review the report and cited sources.",
                },
            )
        except Exception as exc:  # pragma: no cover - surfaced to browser during live runs
            yield _sse("error", {"stage": "error", "message": str(exc)})

    return StreamingResponse(event_stream(), media_type="text/event-stream")
