from __future__ import annotations

from agents.state import ResearchState
from config import Settings
from llm.client import LLMClient


def _fallback_report(state: ResearchState) -> str:
    lines = [f"# Research Report: {state['query']}", "", "## Key Findings"]
    for index, finding in enumerate(state["findings"], start=1):
        lines.append(f"- {finding['summary']} [[{index}]]({finding['source_url']})")
    if state["errors"]:
        lines.extend(["", "## Run Notes"])
        lines.extend(f"- {error}" for error in state["errors"])
    return "\n".join(lines)


def synthesize_node(state: ResearchState, settings: Settings) -> ResearchState:
    prompt = (
        "Write a structured research report in Markdown. Include sections, key points, "
        "and inline citations as Markdown links using source URLs. If evidence is thin, "
        "say so clearly.\n\n"
        f"Question: {state['query']}\nFindings: {state['findings']}\nErrors: {state['errors']}"
    )
    try:
        report = LLMClient(settings).invoke(prompt)
    except Exception:
        report = _fallback_report(state)

    return {
        **state,
        "report": report,
        "messages": [*state["messages"], "Final report generated."],
    }
